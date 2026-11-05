import { useState, useRef } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, ArrowRightLeft, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function EncodingLab({ onSelectDestination }) {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState('base64');
  const [mode, setMode] = useState('encode'); // 'encode' or 'decode'
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { addCandidate } = useFlagHunter();
  const debounceTimer = useRef(null);

  const ALGORITHMS = [
    { id: 'base64', label: 'Base64 (Standard)' },
    { id: 'hex', label: 'Hexadecimal' },
    { id: 'base32', label: 'Base32 (RFC 4648)' },
    { id: 'base58', label: 'Base58 (Bitcoin)' },
    { id: 'ascii85', label: 'Base85 / Ascii85' },
  ];

  const fetchServerEncoding = (val = input, algo = algorithm, m = mode) => {
    if (!val.trim()) {
      setOutput('');
      setError('');
      return;
    }
    setLoading(true);
    setError('');

    api.post('/tools/crypto/encoding', {
      input: val,
      algorithm: algo,
      mode: m
    })
      .then((res) => {
        if (res.data?.error) {
          setError(res.data.error);
          setOutput('');
        } else {
          const out = res.data?.output || '';
          setOutput(out);
          setError('');
          if (m === 'decode' && /flag\{|ctf\{|\{[^}]{4,}\}/i.test(out)) {
            addCandidate(out, `EncodingLab (${algo})`);
          }
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Server encoding failed.');
        setOutput('');
      })
      .finally(() => setLoading(false));
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchServerEncoding(val, algorithm, mode);
    }, 300);
  };

  const handleAlgoChange = (newAlgo) => {
    setAlgorithm(newAlgo);
    fetchServerEncoding(input, newAlgo, mode);
  };

  const handleModeToggle = () => {
    const nextMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(nextMode);
    fetchServerEncoding(input, algorithm, nextMode);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolWrapper
      title="Encoding Lab"
      category="Cryptography"
      description="Server-side radix encodings on Java: Base32, Base58 (Bitcoin), Base64, Base85 (Ascii85), and Hexadecimal."
      badge="Java Engine"
      outputValue={output}
      sourceToolId="encoding"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Controls Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          {/* Algorithm pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ALGORITHMS.map((algo) => (
              <button
                key={algo.id}
                onClick={() => handleAlgoChange(algo.id)}
                style={{
                  background: algorithm === algo.id ? 'rgba(56, 189, 248, 0.15)' : '#0d1117',
                  color: algorithm === algo.id ? '#38bdf8' : '#94a3b8',
                  border: `1px solid ${algorithm === algo.id ? 'rgba(56, 189, 248, 0.4)' : '#1e293b'}`,
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                {algo.label}
              </button>
            ))}
          </div>

          {/* Mode Switcher */}
          <button
            onClick={handleModeToggle}
            style={{
              background: mode === 'encode' ? 'rgba(0, 255, 157, 0.15)' : 'rgba(251, 191, 36, 0.15)',
              color: mode === 'encode' ? '#00ff9d' : '#fbbf24',
              border: `1px solid ${mode === 'encode' ? 'rgba(0, 255, 157, 0.4)' : 'rgba(251, 191, 36, 0.4)'}`,
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <ArrowRightLeft size={13} />
            {mode === 'encode' ? 'MODE: ENCODE' : 'MODE: DECODE'}
          </button>
        </div>

        {/* Input Textarea */}
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder={mode === 'encode' ? 'Enter plaintext to encode on Java server...' : `Enter ${algorithm.toUpperCase()} string to decode on Java server...`}
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

        {/* Output Box */}
        <div style={{
          background: '#0b0f17',
          border: '1px solid #1e293b',
          borderRadius: 6,
          padding: 14
        }}>
          <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Result (Java {algorithm.toUpperCase()})</span>
            {loading && <span style={{ color: '#38bdf8' }}>Executing on Java...</span>}
          </div>

          {error ? (
            <div style={{ color: '#f43f5e', fontSize: 13 }}>{error}</div>
          ) : output ? (
            <div style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13,
              color: '#00ff9d',
              wordBreak: 'break-all',
              lineHeight: '1.5'
            }}>
              {output}
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: 13 }}>
              Result will appear here after server execution
            </div>
          )}
        </div>
      </div>
    </ToolWrapper>
  );
}
