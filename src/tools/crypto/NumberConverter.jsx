import { useState, useRef } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check } from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function NumberConverter({ onSelectDestination }) {
  const [value, setValue] = useState('1337');
  const [fromRadix, setFromRadix] = useState('dec');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const { addCandidate } = useFlagHunter();
  const debounceRef = useRef(null);

  const radices = [
    { id: 'dec', label: 'Decimal' },
    { id: 'hex', label: 'Hex' },
    { id: 'octal', label: 'Octal' },
    { id: 'binary', label: 'Binary' },
    { id: 'ascii', label: 'ASCII' }
  ];

  const fetchConversion = (val = value, radix = fromRadix) => {
    if (!val.trim()) {
      setResult(null);
      setError('');
      return;
    }
    setLoading(true);
    setError('');

    api.post('/tools/crypto/number', { value: val, fromRadix: radix })
      .then((res) => {
        if (res.data?.error) {
          setError(res.data.error);
          setResult(null);
        } else {
          setResult(res.data);
          setError('');
          if (res.data?.ascii && /flag\{|ctf\{|\{[^}]{4,}\}/i.test(res.data.ascii)) {
            addCandidate(res.data.ascii, 'Number Converter');
          }
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Conversion failed.');
        setResult(null);
      })
      .finally(() => setLoading(false));
  };

  const handleInputChange = (e) => {
    const v = e.target.value;
    setValue(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchConversion(v, fromRadix), 300);
  };

  const handleRadixChange = (r) => {
    setFromRadix(r);
    fetchConversion(value, r);
  };

  const copyVal = (k, v) => {
    if (!v) return;
    navigator.clipboard.writeText(String(v));
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <ToolWrapper
      title="Number Radix Converter"
      category="Cryptography"
      description="Instant conversion across Decimal, Hexadecimal, Octal, Binary, ASCII string, and IEEE-754 floating point on server."
      badge="Java Engine"
      outputValue={result ? result.hex : ''}
      sourceToolId="number"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {radices.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRadixChange(r.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: fromRadix === r.id ? '1px solid #38bdf8' : '1px solid #334155',
                background: fromRadix === r.id ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                color: fromRadix === r.id ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12
              }}
            >
              From {r.label}
            </button>
          ))}
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Input Value</label>
          <input
            type="text"
            value={value}
            onChange={handleInputChange}
            placeholder="e.g. 1337 or 0x539 or 01010011"
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 6,
              border: '1px solid #334155',
              background: '#0f172a',
              color: '#f8fafc',
              fontFamily: 'monospace',
              fontSize: 14
            }}
          />
        </div>

        {error && (
          <div style={{ padding: 10, borderRadius: 6, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: 13 }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {[
              { label: 'Decimal (Base 10)', key: 'decimal', val: result.decimal },
              { label: 'Hexadecimal (Base 16)', key: 'hex', val: result.hex },
              { label: 'Octal (Base 8)', key: 'octal', val: result.octal },
              { label: 'Binary (Base 2)', key: 'binary', val: result.binary },
              { label: 'ASCII String', key: 'ascii', val: result.ascii },
              { label: 'IEEE-754 Float (32-bit)', key: 'ieee754_float', val: result.ieee754_float },
              { label: 'IEEE-754 Double (64-bit)', key: 'ieee754_double', val: result.ieee754_double }
            ].filter(item => item.val !== undefined && item.val !== null).map((item) => (
              <div key={item.key} style={{ background: '#0b111e', border: '1px solid #1e293b', borderRadius: 6, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{item.label}</span>
                  <button
                    onClick={() => copyVal(item.key, item.val)}
                    style={{ background: 'none', border: 'none', color: copiedKey === item.key ? '#10b981' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
                  >
                    {copiedKey === item.key ? <Check size={12} /> : <Copy size={12} />}
                    {copiedKey === item.key ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#38bdf8', wordBreak: 'break-all' }}>
                  {String(item.val)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
