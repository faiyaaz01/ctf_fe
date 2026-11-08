import { useState } from 'react';
import { Zap, Copy, Check, ShieldCheck } from 'lucide-react';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function InstantDecryptor({ onSelectDestination }) {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const { addCandidate } = useFlagHunter();

  // Instant heuristics engine
  const detectAndCrack = (raw) => {
    if (!raw || !raw.trim()) return null;
    const clean = raw.trim();

    // 1. Base64
    try {
      if (/^[A-Za-z0-9+/]{4,}={0,2}$/.test(clean)) {
        const decoded = atob(clean);
        if (/^[\x20-\x7E\r\n\t]+$/.test(decoded)) {
          return { type: 'Base64 Decoded', result: decoded };
        }
      }
    } catch (_) {}

    // 2. Hexadecimal
    if (/^[0-9a-fA-F]{4,}$/.test(clean) && clean.length % 2 === 0) {
      try {
        let str = '';
        for (let i = 0; i < clean.length; i += 2) {
          str += String.fromCharCode(parseInt(clean.substr(i, 2), 16));
        }
        if (/^[\x20-\x7E\r\n\t]+$/.test(str)) {
          return { type: 'Hex to ASCII', result: str };
        }
      } catch (_) {}
    }

    // 3. URL Encoding
    if (/%[0-9a-fA-F]{2}/.test(clean)) {
      try {
        const urlDec = decodeURIComponent(clean);
        if (urlDec !== clean) {
          return { type: 'URL Decoded', result: urlDec };
        }
      } catch (_) {}
    }

    // 4. ROT-13
    if (/[a-zA-Z]/.test(clean)) {
      const rot = clean.replace(/[a-zA-Z]/g, (c) => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
      });
      if (/flag\{|ctf\{|the\s|is\s|and\s/i.test(rot)) {
        return { type: 'ROT-13 Decoded', result: rot };
      }
    }

    // 5. Hash Fingerprint Detection
    if (/^[0-9a-fA-F]{32}$/.test(clean)) return { type: 'Hash Fingerprint', result: 'MD5 Hash Detected' };
    if (/^[0-9a-fA-F]{40}$/.test(clean)) return { type: 'Hash Fingerprint', result: 'SHA-1 Hash Detected' };
    if (/^[0-9a-fA-F]{64}$/.test(clean)) return { type: 'Hash Fingerprint', result: 'SHA-256 Hash Detected' };

    return null;
  };

  const detected = detectAndCrack(input);
  const isFlag = detected && /flag\{|ctf\{|\{[^}]{4,}\}/i.test(detected.result);

  const handleCopy = () => {
    if (!detected?.result) return;
    navigator.clipboard.writeText(detected.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCapture = () => {
    if (detected?.result) {
      addCandidate(detected.result, `Instant Decryptor (${detected.type})`);
    }
  };

  return (
    <div style={{
      background: 'var(--theme-card-bg, rgba(15, 23, 42, 0.75))',
      border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
      borderRadius: 8,
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={16} color="var(--theme-accent, #00f0ff)" />
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: '"JetBrains Mono", monospace', color: '#f8fafc', letterSpacing: '0.04em' }}>
            Instant Decoder & Heuristics
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#64748b', fontFamily: '"JetBrains Mono", monospace' }}>
          Auto-parses Base64 / Hex / URL / ROT13 / Hashes
        </span>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste encoded string or hash to crack immediately..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 6,
            border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.12))',
            background: 'rgba(0, 0, 0, 0.35)',
            color: '#f8fafc',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            outline: 'none',
            transition: 'border-color 0.2s'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--theme-accent, #00f0ff)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--theme-border, rgba(255, 255, 255, 0.12))'}
        />
        {input && (
          <button
            onClick={() => setInput('')}
            style={{
              padding: '0 14px',
              borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: 11,
              fontFamily: '"JetBrains Mono", monospace'
            }}
          >
            Clear
          </button>
        )}
      </div>

      {detected && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: 6,
          background: 'var(--theme-glow, rgba(0, 240, 255, 0.08))',
          border: '1px solid var(--theme-accent, #00f0ff)',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <span style={{
              fontSize: 10,
              fontWeight: 800,
              fontFamily: '"JetBrains Mono", monospace',
              padding: '2px 8px',
              borderRadius: 4,
              background: 'var(--theme-accent, #00f0ff)',
              color: '#070a13',
              whiteSpace: 'nowrap'
            }}>
              {detected.type}
            </span>
            <span style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13,
              color: '#f8fafc',
              fontWeight: 600,
              wordBreak: 'break-all'
            }}>
              {detected.result}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isFlag && (
              <button
                onClick={handleCapture}
                style={{
                  padding: '5px 12px',
                  borderRadius: 5,
                  background: 'var(--theme-accent, #00f0ff)',
                  border: 'none',
                  color: '#070a13',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}
              >
                <ShieldCheck size={13} />
                SECURE FLAG
              </button>
            )}
            <button
              onClick={handleCopy}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.15))',
                color: copied ? 'var(--theme-accent, #00f0ff)' : '#e2e8f0',
                padding: '5px 10px',
                borderRadius: 5,
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
