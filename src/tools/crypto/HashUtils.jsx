import { useState, useRef } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, Hash, Sparkles } from 'lucide-react';
import api from '../../services/api';

export default function HashUtils({ onSelectDestination }) {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const debounceTimer = useRef(null);

  const fetchServerHashes = (val) => {
    if (!val.trim()) {
      setHashes(null);
      return;
    }
    setLoading(true);
    api.post('/tools/crypto/hashes', { input: val })
      .then((res) => setHashes(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchServerHashes(val);
    }, 350);
  };

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const ALGORITHMS = [
    { key: 'md5', label: 'MD5 (128-bit)' },
    { key: 'sha1', label: 'SHA-1 (160-bit)' },
    { key: 'sha256', label: 'SHA-256 (256-bit)' },
    { key: 'sha512', label: 'SHA-512 (512-bit)' },
    { key: 'ntlm', label: 'NTLM (Windows SAM)' },
  ];

  return (
    <ToolWrapper
      title="Hash Utils"
      category="Cryptography"
      description="Server-side high-precision cryptographic hashing via Java BouncyCastle & heuristic hash type identifier."
      badge="Java Engine"
      outputValue={hashes?.sha256 || ''}
      sourceToolId="hash"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Input Textarea */}
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Enter plaintext to hash, or paste a hash to identify its algorithm..."
          style={{
            width: '100%',
            height: 80,
            background: '#0b0f17',
            border: '1px solid #1e293b',
            borderRadius: 6,
            padding: 12,
            color: '#f8fafc',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            outline: 'none',
            resize: 'none'
          }}
        />

        {/* Server Hashing Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
            <span>Computed Hashes (Java BouncyCastle)</span>
            {loading && <span style={{ color: '#38bdf8' }}>Computing on Server...</span>}
          </div>

          {!hashes ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13, background: '#0b0f17', borderRadius: 6, border: '1px solid #1e293b' }}>
              Type plaintext above to compute server-side hashes
            </div>
          ) : (
            ALGORITHMS.map((algo) => {
              const hashVal = hashes[algo.key] || 'Generating...';
              return (
                <div
                  key={algo.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#0d1117',
                    border: '1px solid #1e293b',
                    borderRadius: 6,
                    gap: 12
                  }}
                >
                  <div style={{ width: 150, fontSize: 12, fontWeight: 600, color: '#38bdf8' }}>
                    {algo.label}
                  </div>

                  <div style={{
                    flex: 1,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    color: '#00ff9d',
                    wordBreak: 'break-all'
                  }}>
                    {hashVal}
                  </div>

                  <button
                    onClick={() => handleCopy(algo.key, hashVal)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid #1e293b',
                      color: copiedKey === algo.key ? '#00ff9d' : '#94a3b8',
                      padding: '4px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11
                    }}
                  >
                    {copiedKey === algo.key ? <Check size={12} /> : <Copy size={12} />}
                    {copiedKey === algo.key ? 'Copied' : 'Copy'}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Server Hash Type Identification */}
        {hashes?.identification && hashes.identification.length > 0 && (
          <div style={{
            background: 'rgba(56, 189, 248, 0.05)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: 6,
            padding: 14
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#38bdf8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={14} /> Hash Type Identification (Possible Matches)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {hashes.identification.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#c9d8e8' }}>
                  <span style={{ fontWeight: 600, color: '#f8fafc' }}>{t.name}</span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ color: '#fbbf24' }}>Hashcat: <code>{t.hashcat}</code></span>
                    <span style={{ color: '#94a3b8' }}>John: <code>{t.john}</code></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
