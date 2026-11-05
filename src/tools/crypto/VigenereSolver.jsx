import { useState } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, Search } from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function VigenereSolver({ onSelectDestination }) {
  const [text, setText] = useState('LXFOPVEFRNHR');
  const [key, setKey] = useState('LEMON');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addCandidate } = useFlagHunter();

  const solve = (customKey = key) => {
    if (!text.trim()) return;
    setLoading(true);

    api.post('/tools/crypto/vigenere', { text, key: customKey })
      .then((res) => {
        setResult(res.data);
        if (res.data?.decrypted && /flag\{|ctf\{|\{[^}]{4,}\}/i.test(res.data.decrypted)) {
          addCandidate(res.data.decrypted, 'Vigenère Solver');
        }
      })
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  };

  const handleCopy = () => {
    if (!result?.decrypted) return;
    navigator.clipboard.writeText(result.decrypted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolWrapper
      title="Vigenère Solver"
      category="Cryptography"
      description="Polyalphabetic Vigenère decryption with known key or automated Index of Coincidence (IoC) key length analysis."
      badge="Java Engine"
      outputValue={result ? result.decrypted : ''}
      sourceToolId="vigenere"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Ciphertext</label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ciphertext..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Key (leave blank for IoC length deduction)</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. LEMON or SECRET"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          <button
            onClick={() => solve(key)}
            disabled={loading}
            style={{
              padding: '10px 20px',
              borderRadius: 6,
              background: '#38bdf8',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 42
            }}
          >
            <Search size={16} />
            {loading ? 'Solving...' : key ? 'Decrypt' : 'Analyze IoC'}
          </button>
        </div>

        {result && (
          <div style={{ background: '#0b111e', border: '1px solid #1e293b', borderRadius: 6, padding: 14 }}>
            {result.decrypted && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Decrypted Plaintext</span>
                  <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: copied ? '#10b981' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div style={{ minHeight: 60, padding: 10, background: '#0f172a', borderRadius: 6, border: '1px solid #334155', color: '#38bdf8', fontFamily: 'monospace', fontSize: 14, wordBreak: 'break-all' }}>
                  {result.decrypted}
                </div>
              </div>
            )}

            {result.probableKeyLength && (
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>
                  Probable Key Length: {result.probableKeyLength}
                </span>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  Computed Index of Coincidence across 1-16 offsets. Peaks near ~0.065 indicate probable polyalphabetic period.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
