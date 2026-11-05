import { useState } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, ArrowRightLeft } from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function RailFenceCipher({ onSelectDestination }) {
  const [text, setText] = useState('WECRLTEERDSOEEFEAOCAIVDEN');
  const [rails, setRails] = useState(3);
  const [mode, setMode] = useState('decrypt');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addCandidate } = useFlagHunter();

  const processRailFence = (t = text, r = rails, m = mode) => {
    if (!t) {
      setResult('');
      return;
    }
    setLoading(true);
    api.post('/tools/crypto/railfence', { text: t, rails: String(r), mode: m })
      .then((res) => {
        const out = res.data?.result || '';
        setResult(out);
        if (/flag\{|ctf\{|\{[^}]{4,}\}/i.test(out)) {
          addCandidate(out, `RailFence (${r} rails)`);
        }
      })
      .catch(() => setResult(''))
      .finally(() => setLoading(false));
  };

  const handleModeToggle = () => {
    const nextMode = mode === 'decrypt' ? 'encrypt' : 'decrypt';
    setMode(nextMode);
    processRailFence(text, rails, nextMode);
  };

  const handleRailsChange = (val) => {
    const r = Math.max(2, Math.min(20, parseInt(val) || 2));
    setRails(r);
    processRailFence(text, r, mode);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolWrapper
      title="Rail Fence Cipher"
      category="Cryptography"
      description="Transposition zig-zag cipher encryptor and decryptor with configurable rails on Java engine."
      badge="Java Engine"
      outputValue={result}
      sourceToolId="railfence"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#94a3b8' }}>Rails:</span>
            <input
              type="number"
              min={2}
              max={20}
              value={rails}
              onChange={(e) => handleRailsChange(e.target.value)}
              style={{ width: 64, padding: '6px 10px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#38bdf8', fontWeight: 700, textAlign: 'center' }}
            />
          </div>

          <button
            onClick={handleModeToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 6,
              background: '#0f172a',
              border: '1px solid #334155',
              color: '#38bdf8',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12
            }}
          >
            <ArrowRightLeft size={14} />
            Mode: {mode.toUpperCase()}
          </button>
        </div>

        <div>
          <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Input Text</label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              processRailFence(e.target.value, rails, mode);
            }}
            placeholder="Ciphertext or plaintext..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 12, color: '#94a3b8' }}>Result</label>
            <button
              onClick={handleCopy}
              disabled={!result}
              style={{ background: 'none', border: 'none', color: copied ? '#10b981' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div
            style={{
              minHeight: 70,
              padding: '12px 14px',
              borderRadius: 6,
              background: '#0b111e',
              border: '1px solid #1e293b',
              color: '#38bdf8',
              fontFamily: 'monospace',
              fontSize: 14,
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap'
            }}
          >
            {loading ? 'Processing...' : result || 'Enter text to decode/encode'}
          </div>
        </div>
      </div>
    </ToolWrapper>
  );
}
