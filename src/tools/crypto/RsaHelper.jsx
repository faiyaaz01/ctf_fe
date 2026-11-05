import { useState } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, Calculator } from 'lucide-react';
import api from '../../services/api';

export default function RsaHelper({ onSelectDestination }) {
  const [p, setP] = useState('61');
  const [q, setQ] = useState('53');
  const [e, setE] = useState('17');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const calculateRsa = () => {
    if (!p.trim() || !q.trim() || !e.trim()) {
      setError('Please provide p, q, and e');
      return;
    }
    setLoading(true);
    setError('');

    api.post('/tools/crypto/rsa-helper', { p, q, e })
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
        setError(err.response?.data?.message || 'RSA calculation failed.');
        setResult(null);
      })
      .finally(() => setLoading(false));
  };

  const copyVal = (k, v) => {
    if (!v) return;
    navigator.clipboard.writeText(String(v));
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <ToolWrapper
      title="RSA Helper"
      category="Cryptography"
      description="Compute RSA key components (Modulus N, Euler's totient phi, private exponent d, bit length) using Java BigInteger arithmetic."
      badge="Java Engine"
      outputValue={result ? result.d : ''}
      sourceToolId="rsa-helper"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Prime p</label>
            <input
              type="text"
              value={p}
              onChange={(evt) => setP(evt.target.value)}
              placeholder="e.g. 61"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Prime q</label>
            <input
              type="text"
              value={q}
              onChange={(evt) => setQ(evt.target.value)}
              placeholder="e.g. 53"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Public Exponent e</label>
            <input
              type="text"
              value={e}
              onChange={(evt) => setE(evt.target.value)}
              placeholder="e.g. 65537 or 17"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
        </div>

        <button
          onClick={calculateRsa}
          disabled={loading}
          style={{
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 6,
            background: '#38bdf8',
            color: '#0f172a',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            border: 'none'
          }}
        >
          <Calculator size={16} />
          {loading ? 'Computing on Server...' : 'Calculate RSA Keys'}
        </button>

        {error && (
          <div style={{ padding: 10, borderRadius: 6, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: 13 }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
            {[
              { label: 'Modulus N (p * q)', key: 'n', val: result.n },
              { label: 'Totient φ(N) = (p-1)*(q-1)', key: 'phi', val: result.phi },
              { label: 'Private Key d (e^-1 mod φ)', key: 'd', val: result.d },
              { label: 'Bit Length', key: 'bitLength', val: `${result.bitLength} bits` }
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
