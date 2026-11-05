import { useState } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, Zap } from 'lucide-react';
import api from '../../services/api';

export default function RsaAttackLab({ onSelectDestination }) {
  const [attackType, setAttackType] = useState('wiener'); // 'wiener' or 'fermat'
  const [n, setN] = useState('17993');
  const [e, setE] = useState('905');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const runAttack = () => {
    if (!n.trim()) {
      setError('Modulus N is required');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    const endpoint = attackType === 'wiener' ? '/tools/crypto/rsa-wiener' : '/tools/crypto/rsa-fermat';
    const payload = attackType === 'wiener' ? { n, e } : { n };

    api.post(endpoint, payload)
      .then((res) => {
        if (res.data?.error) {
          setError(res.data.error);
        } else {
          setResult(res.data);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Attack failed.');
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
      title="RSA Attack Lab"
      category="Cryptography"
      description="Automated RSA cryptanalysis: Wiener's low private exponent attack (continued fractions) and Fermat's close prime factorization."
      badge="Java Engine"
      outputValue={result ? (result.d || result.p || '') : ''}
      sourceToolId="rsa-attack"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Method Switcher */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setAttackType('wiener'); setResult(null); }}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: attackType === 'wiener' ? '1px solid #38bdf8' : '1px solid #334155',
              background: attackType === 'wiener' ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
              color: attackType === 'wiener' ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 12
            }}
          >
            Wiener Low Exponent Attack
          </button>
          <button
            onClick={() => { setAttackType('fermat'); setResult(null); }}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: attackType === 'fermat' ? '1px solid #38bdf8' : '1px solid #334155',
              background: attackType === 'fermat' ? 'rgba(56, 189, 248, 0.15)' : '#0f172a',
              color: attackType === 'fermat' ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 12
            }}
          >
            Fermat Factorization (Close Primes)
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: attackType === 'wiener' ? '2fr 1fr' : '1fr', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Modulus N</label>
            <input
              type="text"
              value={n}
              onChange={(evt) => setN(evt.target.value)}
              placeholder="e.g. 17993"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          {attackType === 'wiener' && (
            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Public Exponent e</label>
              <input
                type="text"
                value={e}
                onChange={(evt) => setE(evt.target.value)}
                placeholder="e.g. 905"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
              />
            </div>
          )}
        </div>

        <button
          onClick={runAttack}
          disabled={loading}
          style={{
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 20px',
            borderRadius: 6,
            background: '#ef4444',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            border: 'none'
          }}
        >
          <Zap size={16} />
          {loading ? 'Executing Attack on Server...' : `Launch ${attackType === 'wiener' ? 'Wiener' : 'Fermat'} Attack`}
        </button>

        {error && (
          <div style={{ padding: 10, borderRadius: 6, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: 13 }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ background: '#0b111e', border: '1px solid #1e293b', borderRadius: 6, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: result.status === 'success' ? '#10b981' : '#f59e0b', textTransform: 'uppercase' }}>
                Status: {result.status || 'Complete'}
              </span>
              {result.attack && <span style={{ fontSize: 11, color: '#64748b' }}>{result.attack}</span>}
            </div>

            {result.message && (
              <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 12 }}>{result.message}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              {result.d && (
                <div style={{ background: '#0f172a', padding: 10, borderRadius: 6, border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>RECOVERED PRIVATE KEY d</span>
                    <button onClick={() => copyVal('d', result.d)} style={{ background: 'none', border: 'none', color: copiedKey === 'd' ? '#10b981' : '#94a3b8', cursor: 'pointer', fontSize: 11 }}>
                      {copiedKey === 'd' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#38bdf8', wordBreak: 'break-all' }}>{result.d}</div>
                </div>
              )}
              {result.p && (
                <div style={{ background: '#0f172a', padding: 10, borderRadius: 6, border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>FACTOR p</span>
                    <button onClick={() => copyVal('p', result.p)} style={{ background: 'none', border: 'none', color: copiedKey === 'p' ? '#10b981' : '#94a3b8', cursor: 'pointer', fontSize: 11 }}>
                      {copiedKey === 'p' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#38bdf8', wordBreak: 'break-all' }}>{result.p}</div>
                </div>
              )}
              {result.q && (
                <div style={{ background: '#0f172a', padding: 10, borderRadius: 6, border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>FACTOR q</span>
                    <button onClick={() => copyVal('q', result.q)} style={{ background: 'none', border: 'none', color: copiedKey === 'q' ? '#10b981' : '#94a3b8', cursor: 'pointer', fontSize: 11 }}>
                      {copiedKey === 'q' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#38bdf8', wordBreak: 'break-all' }}>{result.q}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
