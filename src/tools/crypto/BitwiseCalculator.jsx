import { useState, useRef } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check } from 'lucide-react';
import api from '../../services/api';

export default function BitwiseCalculator({ onSelectDestination }) {
  const [a, setA] = useState('0x1337');
  const [b, setB] = useState('0xFF');
  const [op, setOp] = useState('AND');
  const [bits, setBits] = useState(32);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const debounceRef = useRef(null);

  const ops = ['AND', 'OR', 'XOR', 'NOT', 'SHL', 'SHR'];
  const bitSizes = [8, 16, 32, 64];

  const calculate = (valA = a, valB = b, oper = op, bitSize = bits) => {
    if (!valA.trim()) {
      setResult(null);
      setError('');
      return;
    }
    setLoading(true);
    setError('');

    api.post('/tools/crypto/bitwise', {
      a: valA,
      b: valB,
      op: oper,
      bits: String(bitSize)
    })
      .then((res) => {
        if (res.data?.error) {
          setError(res.data.error);
          setResult(null);
        } else {
          setResult(res.data);
          setError('');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Bitwise calculation failed.');
        setResult(null);
      })
      .finally(() => setLoading(false));
  };

  const handleAChange = (v) => {
    setA(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(v, b, op, bits), 300);
  };

  const handleBChange = (v) => {
    setB(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(a, v, op, bits), 300);
  };

  const handleOpChange = (newOp) => {
    setOp(newOp);
    calculate(a, b, newOp, bits);
  };

  const handleBitsChange = (newBits) => {
    setBits(newBits);
    calculate(a, b, op, newBits);
  };

  const copyVal = (k, v) => {
    if (!v) return;
    navigator.clipboard.writeText(String(v));
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <ToolWrapper
      title="Bitwise Calculator"
      category="Cryptography"
      description="Interactive bitwise sandbox (AND, OR, XOR, NOT, SHL, SHR) with 8, 16, 32, and 64-bit word masking on Java backend."
      badge="Java Engine"
      outputValue={result ? result.hex : ''}
      sourceToolId="bitwise"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Controls row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ops.map((o) => (
              <button
                key={o}
                onClick={() => handleOpChange(o)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: op === o ? '1px solid #38bdf8' : '1px solid #334155',
                  background: op === o ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                  color: op === o ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 12
                }}
              >
                {o}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Word Size:</span>
            {bitSizes.map((s) => (
              <button
                key={s}
                onClick={() => handleBitsChange(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: bits === s ? '1px solid #38bdf8' : '1px solid #334155',
                  background: bits === s ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
                  color: bits === s ? '#38bdf8' : '#94a3b8',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 11
                }}
              >
                {s}-bit
              </button>
            ))}
          </div>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: op === 'NOT' ? '1fr' : '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Operand A (Hex or Dec)</label>
            <input
              type="text"
              value={a}
              onChange={(e) => handleAChange(e.target.value)}
              placeholder="e.g. 0x1337 or 4919"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          {op !== 'NOT' && (
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Operand B (Hex, Dec, or Shift)</label>
              <input
                type="text"
                value={b}
                onChange={(e) => handleBChange(e.target.value)}
                placeholder="e.g. 0xFF or 255"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
              />
            </div>
          )}
        </div>

        {error && (
          <div style={{ padding: 10, borderRadius: 6, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: 13 }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {[
              { label: 'Hex Result', key: 'hex', val: result.hex },
              { label: 'Decimal Result', key: 'dec', val: result.dec },
              { label: 'Binary Result', key: 'bin', val: result.bin }
            ].map((item) => (
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
                  {item.val}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
