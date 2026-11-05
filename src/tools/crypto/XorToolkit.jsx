import { useState, useMemo } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Sparkles, Copy, Check, RefreshCw } from 'lucide-react';
import { useFlagHunter } from '../../hooks/useFlagHunter';

// ETAOIN SHRDLU English character scoring heuristic
const ENGLISH_FREQ = {
  e: 12.7, t: 9.1, a: 8.2, o: 7.5, i: 7.0, n: 6.7, s: 6.3, h: 6.1, r: 6.0,
  d: 4.3, l: 4.0, c: 2.8, u: 2.8, m: 2.4, w: 2.4, f: 2.2, g: 2.0, y: 2.0,
  p: 1.9, b: 1.5, v: 1.0, k: 0.8, j: 0.15, x: 0.15, q: 0.10, z: 0.07, ' ': 15.0
};

function scoreEnglish(text) {
  let score = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i].toLowerCase();
    score += ENGLISH_FREQ[char] || -5;
  }
  return Math.round(score);
}

export default function XorToolkit({ onSelectDestination }) {
  const [tab, setTab] = useState('single'); // 'single' or 'repeating'
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState('hex'); // 'hex' or 'ascii'
  const [key, setKey] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const { addCandidate } = useFlagHunter();

  // Convert input string into byte array
  const rawBytes = useMemo(() => {
    if (!input.trim()) return [];
    if (inputType === 'hex') {
      const clean = input.replace(/\s+|0x/g, '');
      if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length % 2 !== 0) return [];
      const bytes = [];
      for (let i = 0; i < clean.length; i += 2) {
        bytes.push(parseInt(clean.substr(i, 2), 16));
      }
      return bytes;
    } else {
      return Array.from(input).map((c) => c.charCodeAt(0));
    }
  }, [input, inputType]);

  // 1. Single-byte Brute Force (0x00 to 0xFF)
  const bruteForceResults = useMemo(() => {
    if (tab !== 'single' || rawBytes.length === 0) return [];

    const candidates = [];
    for (let k = 0; k < 256; k++) {
      let dec = '';
      let isPrintable = true;
      for (let i = 0; i < rawBytes.length; i++) {
        const b = rawBytes[i] ^ k;
        if (b < 32 || b > 126) {
          if (b !== 10 && b !== 13 && b !== 9) {
            isPrintable = false;
          }
        }
        dec += String.fromCharCode(b);
      }
      if (isPrintable) {
        const score = scoreEnglish(dec);
        candidates.push({ key: k, text: dec, score });
      }
    }

    return candidates.sort((a, b) => b.score - a.score).slice(0, 15);
  }, [rawBytes, tab]);

  // 2. Repeating Key XOR
  const repeatingXorResult = useMemo(() => {
    if (tab !== 'repeating' || rawBytes.length === 0 || !key) return '';
    const keyBytes = Array.from(key).map((c) => c.charCodeAt(0));
    let out = '';
    for (let i = 0; i < rawBytes.length; i++) {
      out += String.fromCharCode(rawBytes[i] ^ keyBytes[i % keyBytes.length]);
    }
    return out;
  }, [rawBytes, key, tab]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <ToolWrapper
      title="XOR Toolkit"
      category="Cryptography"
      description="Single-byte brute force XOR cracker ranked by English letter frequency, and multi-byte repeating key XOR cipher."
      badge="Client"
      outputValue={tab === 'single' ? (bruteForceResults[0]?.text || '') : repeatingXorResult}
      sourceToolId="xor"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Tab Switcher & Format Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setTab('single')}
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
              onClick={() => setTab('repeating')}
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
              onClick={() => setInputType('hex')}
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
              onClick={() => setInputType('ascii')}
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
          onChange={(e) => setInput(e.target.value)}
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
              onChange={(e) => setKey(e.target.value)}
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
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>
              Top 15 English Frequency Candidates (0x00 - 0xFF)
            </div>

            {bruteForceResults.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13, background: '#0b0f17', borderRadius: 6, border: '1px solid #1e293b' }}>
                Enter hex ciphertext above to brute-force all 256 byte keys
              </div>
            ) : (
              bruteForceResults.map((r) => {
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
                    <div style={{ width: 120, fontSize: 12, color: '#38bdf8' }}>
                      Key: <strong>0x{r.key.toString(16).padStart(2, '0').toUpperCase()}</strong> ({r.key})
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
                          onClick={() => addCandidate(r.text, `XOR (Key 0x${r.key.toString(16)})`)}
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
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>
              Decrypted / Encrypted Output
            </div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13,
              color: '#00ff9d',
              wordBreak: 'break-all',
              minHeight: 50
            }}>
              {repeatingXorResult || <span style={{ color: '#64748b' }}>Provide key to see repeating XOR result</span>}
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
