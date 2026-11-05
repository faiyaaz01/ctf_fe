import { useState } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, Cpu } from 'lucide-react';
import api from '../../services/api';

export default function DiscreteLogSolver({ onSelectDestination }) {
  const [g, setG] = useState('2');
  const [h, setH] = useState('22');
  const [p, setP] = useState('29');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const solveLog = () => {
    if (!g.trim() || !h.trim() || !p.trim()) {
      setError('Please provide generator g, target h, and prime modulus p');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    api.post('/tools/crypto/discrete-log', { g, h, p })
      .then((res) => {
        if (res.data?.error) {
          setError(res.data.error);
        } else {
          setResult(res.data);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Discrete log solving failed.');
      })
      .finally(() => setLoading(false));
  };

  const handleCopy = () => {
    if (!result?.x) return;
    navigator.clipboard.writeText(result.x);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolWrapper
      title="Discrete Log Solver"
      category="Cryptography"
      description="Solve for exponent x in g^x ≡ h (mod p) using Baby-step Giant-step (BSGS) algorithm in Java BigInteger."
      badge="Java Engine"
      outputValue={result ? result.x : ''}
      sourceToolId="discrete-log"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Base Generator g</label>
            <input
              type="text"
              value={g}
              onChange={(e) => setG(e.target.value)}
              placeholder="e.g. 2"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Target Value h</label>
            <input
              type="text"
              value={h}
              onChange={(e) => setH(e.target.value)}
              placeholder="e.g. 22"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Prime Modulus p</label>
            <input
              type="text"
              value={p}
              onChange={(e) => setP(e.target.value)}
              placeholder="e.g. 29"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
        </div>

        <button
          onClick={solveLog}
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
          <Cpu size={16} />
          {loading ? 'Solving on Server (BSGS)...' : 'Find Discrete Log (x)'}
        </button>

        {error && (
          <div style={{ padding: 10, borderRadius: 6, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: 13 }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ background: '#0b111e', border: '1px solid #1e293b', borderRadius: 6, padding: 14 }}>
            {result.x ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Solution Found</span>
                  <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: copied ? '#10b981' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div style={{ padding: 12, background: '#0f172a', borderRadius: 6, border: '1px solid #334155', color: '#38bdf8', fontFamily: 'monospace', fontSize: 16, fontWeight: 700 }}>
                  x = {result.x}
                </div>
                {result.formula && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                    Verification: {result.formula}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: '#f59e0b', fontSize: 13 }}>{result.message || 'No solution found'}</div>
            )}
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
