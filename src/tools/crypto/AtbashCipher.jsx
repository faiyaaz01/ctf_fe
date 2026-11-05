import { useState, useRef } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check } from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function AtbashCipher({ onSelectDestination }) {
  const [text, setText] = useState('svool dliow');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addCandidate } = useFlagHunter();
  const debounceRef = useRef(null);

  const fetchAtbash = (t = text) => {
    if (!t) {
      setResult('');
      return;
    }
    setLoading(true);
    api.post('/tools/crypto/atbash', { text: t })
      .then((res) => {
        const out = res.data?.result || '';
        setResult(out);
        if (/flag\{|ctf\{|\{[^}]{4,}\}/i.test(out)) {
          addCandidate(out, 'Atbash Cipher');
        }
      })
      .catch(() => setResult(''))
      .finally(() => setLoading(false));
  };

  const handleInputChange = (e) => {
    const v = e.target.value;
    setText(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchAtbash(v), 250);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolWrapper
      title="Atbash Cipher"
      category="Cryptography"
      description="Classic reciprocal substitution cipher mapping A <-> Z, B <-> Y, C <-> X executed via Java backend."
      badge="Java Engine"
      outputValue={result}
      sourceToolId="atbash"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Input Text</label>
          <textarea
            rows={4}
            value={text}
            onChange={handleInputChange}
            placeholder="Type or paste text to convert..."
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
              {copied ? 'Copied' : 'Copy Result'}
            </button>
          </div>
          <div
            style={{
              minHeight: 80,
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
            {loading ? 'Evaluating...' : result || 'Waiting for input...'}
          </div>
        </div>
      </div>
    </ToolWrapper>
  );
}
