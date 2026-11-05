import { useState, useMemo } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function MultiDecoder({ onSelectDestination }) {
  const [input, setInput] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const { addCandidate } = useFlagHunter();

  // Helper decoding decoders
  const decoders = useMemo(() => {
    if (!input) return [];

    const results = [];

    // 1. Base64
    try {
      const b64 = atob(input.trim());
      if (b64 && /^[\x20-\x7E\r\n\t]+$/.test(b64)) {
        results.push({ name: 'Base64', val: b64 });
      }
    } catch {}

    // 2. Hex to ASCII
    try {
      const cleanHex = input.replace(/\s+|0x/g, '');
      if (/^[0-9a-fA-F]+$/.test(cleanHex) && cleanHex.length % 2 === 0) {
        let hexStr = '';
        for (let i = 0; i < cleanHex.length; i += 2) {
          hexStr += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
        }
        if (/^[\x20-\x7E\r\n\t]+$/.test(hexStr)) {
          results.push({ name: 'Hex -> ASCII', val: hexStr });
        }
      }
    } catch {}

    // 3. URL Decode
    try {
      const urlDec = decodeURIComponent(input);
      if (urlDec !== input) {
        results.push({ name: 'URL Decoded', val: urlDec });
      }
    } catch {}

    // 4. Binary to ASCII
    try {
      const cleanBin = input.trim().replace(/\s+/g, ' ');
      const tokens = cleanBin.split(' ');
      if (tokens.every((t) => /^[01]{7,8}$/.test(t))) {
        const binStr = tokens.map((t) => String.fromCharCode(parseInt(t, 2))).join('');
        results.push({ name: 'Binary (8-bit)', val: binStr });
      }
    } catch {}

    // 5. ROT13
    try {
      const rot13 = input.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
      });
      if (rot13 !== input) {
        results.push({ name: 'ROT13', val: rot13 });
      }
    } catch {}

    // 6. Atbash (Reversed Alphabet)
    try {
      const atbash = input.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(base + (25 - (c.charCodeAt(0) - base)));
      });
      results.push({ name: 'Atbash Cipher', val: atbash });
    } catch {}

    // 7. Reversed String
    try {
      const rev = input.split('').reverse().join('');
      results.push({ name: 'Reversed Text', val: rev });
    } catch {}

    // 8. Decimal ASCII Codes (e.g., 70 76 65 71)
    try {
      const parts = input.trim().split(/[\s,]+/);
      if (parts.length > 1 && parts.every((p) => /^\d+$/.test(p) && parseInt(p) <= 255)) {
        const decAscii = parts.map((p) => String.fromCharCode(parseInt(p, 10))).join('');
        results.push({ name: 'Decimal ASCII', val: decAscii });
      }
    } catch {}

    return results;
  }, [input]);

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
      description="Simultaneous multi-format string decoder: Base64, Hex, URL, Binary, ROT13, Atbash, Decimal ASCII, and Reversal."
      badge="Client"
      outputValue={decoders[0]?.val || ''}
      sourceToolId="decoder"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
          {decoders.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13, background: '#0b0f17', borderRadius: 6, border: '1px solid #1e293b' }}>
              Enter ciphertext above to see instant decodings
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
