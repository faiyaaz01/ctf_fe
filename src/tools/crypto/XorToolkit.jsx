import { useState, useRef } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Sparkles, Copy, Check } from 'lucide-react';
import { useFlagHunter } from '../../hooks/useFlagHunter';
import api from '../../services/api';

export default function XorToolkit({ onSelectDestination }) {
  const [tab, setTab] = useState('single'); // 'single' or 'repeating'
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState('hex'); // 'hex' or 'ascii'
  const [key, setKey] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const { addCandidate } = useFlagHunter();
  const debounceTimer = useRef(null);

  const fetchServerXor = (val = input, it = inputType, m = tab, k = key) => {
    if (!val.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    api.post('/tools/crypto/xor', {
      input: val,
      inputType: it,
      mode: m,
      key: k
    })
      .then((res) => setResults(res.data))
      .catch(() => setResults(null))
      .finally(() => setLoading(false));
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchServerXor(val, inputType, tab, key);
    }, 350);
  };

  const handleKeyChange = (e) => {
    const k = e.target.value;
    setKey(k);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchServerXor(input, inputType, tab, k);
    }, 350);
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    fetchServerXor(input, inputType, newTab, key);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const candidates = results?.candidates || [];
  const repeatingOutput = results?.result || '';

  return (
    <ToolWrapper
      title="XOR Toolkit"
      category="Cryptography"
      description="Single-byte brute force XOR cracker ranked by Java English letter frequency, and multi-byte repeating key XOR cipher on Spring Boot."
      badge="Java Engine"
      outputValue={tab === 'single' ? (candidates[0]?.text || '') : repeatingOutput}
      sourceToolId="xor"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Tab Switcher & Format Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => handleTabChange('single')}
              style={{
                background: tab === 'single' ? 'rgba(56, 189, 248, 0.15)' : '#0d1117',
                color: tab === 'single' ? '#38bdf8' : '#94a3b8',
                border: `1px solid ${tab === 'single' ? 'rgba(56, 189, 248, 0.4)' : '#1e293b'}`,
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Single-Byte Brute Force
            </button>
            <button
              onClick={() => handleTabChange('repeating')}
              style={{
                background: tab === 'repeating' ? 'rgba(56, 189, 248, 0.15)' : '#0d1117',
                color: tab === 'repeating' ? '#38bdf8' : '#94a3b8',
                border: `1px solid ${tab === 'repeating' ? 'rgba(56, 189, 248, 0.4)' : '#1e293b'}`,
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              Repeating Key XOR
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#64748b' }}>
            <span>Input Type:</span>
            <button
              onClick={() => {
                setInputType('hex');
                fetchServerXor(input, 'hex', tab, key);
              }}
              style={{
                background: inputType === 'hex' ? '#1e293b' : 'transparent',
                color: inputType === 'hex' ? '#38bdf8' : '#64748b',
                border: 'none',
                padding: '3px 8px',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              HEX
            </button>
            <button
              onClick={() => {
                setInputType('ascii');
                fetchServerXor(input, 'ascii', tab, key);
              }}
              style={{
                background: inputType === 'ascii' ? '#1e293b' : 'transparent',
                color: inputType === 'ascii' ? '#38bdf8' : '#64748b',
                border: 'none',
                padding: '3px 8px',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              ASCII
            </button>
          </div>
        </div>

        {/* Input box */}
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder={inputType === 'hex' ? 'Paste hex ciphertext (e.g. 1b37373331363f78151b7f2b783431333d78397828372d363c78373e783a393b3736)...' : 'Paste ASCII text...'}
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

        {/* Repeating key specific parameter */}
        {tab === 'repeating' && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>XOR Key (ASCII):</span>
            <input
              type="text"
              value={key}
              onChange={handleKeyChange}
              placeholder="e.g. secret, ICE, admin..."
              style={{
                flex: 1,
                background: '#0b0f17',
                border: '1px solid #1e293b',
                borderRadius: 6,
                padding: '8px 12px',
                color: '#f8fafc',
                fontSize: 13,
                outline: 'none',
                fontFamily: '"JetBrains Mono", monospace'
              }}
            />
          </div>
        )}

        {/* Results view */}
        {tab === 'single' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
              <span>Top 20 English Frequency Candidates (Java Engine)</span>
              {loading && <span style={{ color: '#38bdf8' }}>Cracking in Java...</span>}
            </div>

            {candidates.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13, background: '#0b0f17', borderRadius: 6, border: '1px solid #1e293b' }}>
                Enter hex ciphertext above to brute-force all 256 byte keys on Java server
              </div>
            ) : (
              candidates.map((r) => {
                const isFlag = /flag\{|ctf\{|\{[^}]{4,}\}/i.test(r.text);

                return (
                  <div
                    key={r.key}
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
                    <div style={{ width: 130, fontSize: 12, color: '#38bdf8' }}>
                      Key: <strong>{r.keyHex}</strong> ({r.key})
                    </div>

                    <div style={{
                      flex: 1,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 13,
                      color: isFlag ? '#00ff9d' : '#f1f5f9',
                      wordBreak: 'break-all'
                    }}>
                      {r.text}
                    </div>

                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {isFlag && (
                        <button
                          onClick={() => addCandidate(r.text, `XOR (Key ${r.keyHex})`)}
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
                        onClick={() => handleCopy(r.key, r.text)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid #1e293b',
                          color: copiedKey === r.key ? '#00ff9d' : '#94a3b8',
                          padding: '4px 8px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11
                        }}
                      >
                        {copiedKey === r.key ? <Check size={12} /> : <Copy size={12} />}
                        {copiedKey === r.key ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div style={{
            background: '#0b0f17',
            border: '1px solid #1e293b',
            borderRadius: 6,
            padding: 16
          }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>Decrypted / Encrypted Output (Java Engine)</span>
              {loading && <span style={{ color: '#38bdf8' }}>Processing...</span>}
            </div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13,
              color: '#00ff9d',
              wordBreak: 'break-all',
              minHeight: 50
            }}>
              {repeatingOutput || <span style={{ color: '#64748b' }}>Provide key to see repeating XOR result</span>}
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
