import { useState } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function SubstitutionSolver({ onSelectDestination }) {
  const [text, setText] = useState('Gwc uivioml bw nqvl bpm ntiy!');
  const [keyMap, setKeyMap] = useState('abcdefghijklmnopqrstuvwxyz'); // 26 letters
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addCandidate } = useFlagHunter();

  const applyMapping = (currentMap = keyMap, currentText = text) => {
    if (!currentText.trim()) {
      setOutput('');
      return;
    }
    setLoading(true);
    api.post('/tools/crypto/substitution', { text: currentText, keyMap: currentMap })
      .then((res) => {
        const out = res.data?.output || '';
        setOutput(out);
        if (/flag\{|ctf\{|\{[^}]{4,}\}/i.test(out)) {
          addCandidate(out, 'Substitution Solver');
        }
      })
      .catch(() => setOutput(''))
      .finally(() => setLoading(false));
  };

  const handleCharMapChange = (index, char) => {
    const updated = keyMap.split('');
    updated[index] = char.toLowerCase() || ' ';
    const newKey = updated.join('');
    setKeyMap(newKey);
    applyMapping(newKey, text);
  };

  const resetMap = () => {
    const orig = 'abcdefghijklmnopqrstuvwxyz';
    setKeyMap(orig);
    applyMapping(orig, text);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolWrapper
      title="Substitution Solver"
      category="Cryptography"
      description="Monoalphabetic substitution cipher solver with interactive letter mapping on Java engine."
      badge="Java Engine"
      outputValue={output}
      sourceToolId="substitution"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Ciphertext</label>
          <textarea
            rows={4}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              applyMapping(keyMap, e.target.value);
            }}
            placeholder="Ciphertext..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
          />
        </div>

        {/* 26-Letter Substitution Mapping Row */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Substitution Alphabet Map</span>
            <button
              onClick={resetMap}
              style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
            >
              <RotateCcw size={12} />
              Reset Alphabet
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 4 }}>
            {'abcdefghijklmnopqrstuvwxyz'.split('').map((origChar, idx) => (
              <div key={origChar} style={{ background: '#0b111e', border: '1px solid #1e293b', borderRadius: 4, padding: '4px 2px', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>{origChar.toUpperCase()}</div>
                <input
                  type="text"
                  maxLength={1}
                  value={keyMap[idx] || origChar}
                  onChange={(e) => handleCharMapChange(idx, e.target.value)}
                  style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 12, color: '#94a3b8' }}>Decrypted Output</label>
            <button
              onClick={handleCopy}
              disabled={!output}
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
            {loading ? 'Evaluating substitutions...' : output || 'Waiting for ciphertext...'}
          </div>
        </div>
      </div>
    </ToolWrapper>
  );
}
