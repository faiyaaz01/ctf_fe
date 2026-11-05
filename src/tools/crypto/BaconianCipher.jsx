import { useState } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, ArrowRightLeft } from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function BaconianCipher({ onSelectDestination }) {
  const [text, setText] = useState('AABAB AABAA ABABB ABABB ABBAA');
  const [mode, setMode] = useState('decrypt');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addCandidate } = useFlagHunter();

  const processBaconian = (t = text, m = mode) => {
    if (!t) {
      setResult('');
      return;
    }
    setLoading(true);
    api.post('/tools/crypto/baconian', { text: t, mode: m })
      .then((res) => {
        const out = res.data?.result || '';
        setResult(out);
        if (/flag\{|ctf\{|\{[^}]{4,}\}/i.test(out)) {
          addCandidate(out, 'Baconian Cipher');
        }
      })
      .catch(() => setResult(''))
      .finally(() => setLoading(false));
  };

  const handleModeToggle = () => {
    const nextMode = mode === 'decrypt' ? 'encrypt' : 'decrypt';
    setMode(nextMode);
    processBaconian(text, nextMode);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolWrapper
      title="Baconian Cipher"
      category="Cryptography"
      description="5-bit binary steganographic substitution cipher with A/B character encoding on Java backend."
      badge="Java Engine"
      outputValue={result}
      sourceToolId="baconian"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
              processBaconian(e.target.value, mode);
            }}
            placeholder={mode === 'decrypt' ? 'e.g. AABAB AABAA ABABB...' : 'e.g. HELLO WORLD'}
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
