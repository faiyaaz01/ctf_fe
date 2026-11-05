import { useState, useRef } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, Sparkles } from 'lucide-react';
import { useFlagHunter } from '../../hooks/useFlagHunter';
import api from '../../services/api';

export default function MultiDecoder({ onSelectDestination }) {
  const [input, setInput] = useState('');
  const [decoders, setDecoders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const { addCandidate } = useFlagHunter();
  const debounceTimer = useRef(null);

  const fetchServerDecodes = (val) => {
    if (!val.trim()) {
      setDecoders([]);
      return;
    }
    setLoading(true);
    api.post('/tools/crypto/decode', { input: val })
      .then((res) => setDecoders(res.data || []))
      .catch(() => setDecoders([]))
      .finally(() => setLoading(false));
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchServerDecodes(val);
    }, 300);
  };

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleSendToFlagHunter = (text, name) => {
    addCandidate(text, `MultiDecoder (${name})`);
  };

  return (
    <ToolWrapper
      title="Multi Decoder"
      category="Cryptography"
      description="Simultaneous multi-format string decoder computed on Java Spring Boot: Base64, Hex, URL, Binary, ROT13, Atbash, and Reversal."
      badge="Java Engine"
      outputValue={decoders[0]?.val || ''}
      sourceToolId="decoder"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Paste encoded ciphertext or hash string here..."
          style={{
            width: '100%',
            height: 90,
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
            <span>Decoded Outputs (Java Engine)</span>
            {loading && <span style={{ color: '#38bdf8' }}>Decoding on Server...</span>}
          </div>

          {decoders.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13, background: '#0b0f17', borderRadius: 6, border: '1px solid #1e293b' }}>
              Enter ciphertext above to see server-side decodings
            </div>
          ) : (
            decoders.map((d, idx) => {
              const isFlag = /flag\{|ctf\{|\{[^}]{4,}\}/i.test(d.val);

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: isFlag ? 'rgba(0, 255, 157, 0.05)' : '#0d1117',
                    border: `1px solid ${isFlag ? 'rgba(0, 255, 157, 0.3)' : '#1e293b'}`,
                    borderRadius: 6,
                    gap: 12
                  }}
                >
                  <div style={{ width: 140, fontSize: 12, fontWeight: 600, color: '#38bdf8' }}>
                    {d.name}
                  </div>

                  <div style={{
                    flex: 1,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 13,
                    color: isFlag ? '#00ff9d' : '#f1f5f9',
                    wordBreak: 'break-all'
                  }}>
                    {d.val}
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {isFlag && (
                      <button
                        onClick={() => handleSendToFlagHunter(d.val, d.name)}
                        title="Pipe into Flag Hunter"
                        style={{
                          background: 'rgba(0, 255, 157, 0.15)',
                          border: '1px solid rgba(0, 255, 157, 0.3)',
                          color: '#00ff9d',
                          padding: '3px 8px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          fontSize: 11,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Sparkles size={11} /> Flag
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(d.name, d.val)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid #1e293b',
                        color: copiedKey === d.name ? '#00ff9d' : '#94a3b8',
                        padding: '4px 8px',
                        borderRadius: 4,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11
                      }}
                    >
                      {copiedKey === d.name ? <Check size={12} /> : <Copy size={12} />}
                      {copiedKey === d.name ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </ToolWrapper>
  );
}
