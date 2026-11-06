import { useState, useRef } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, Search, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function CribDragCracker({ onSelectDestination }) {
  const [cipher1, setCipher1] = useState('5b5501ff456e354e12cdfe331456a908');
  const [cipher2, setCipher2] = useState('3f1015bd0528760b578ca2715016c849');
  const [crib, setCrib] = useState('the ');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const { addCandidate } = useFlagHunter();
  const debounceRef = useRef(null);

  const cribPresets = ['the ', 'flag{', 'CTF{', 'http', 'admin', 'that ', 'with '];

  const runCribDrag = (c1 = cipher1, c2 = cipher2, cr = crib) => {
    if (!c1.trim() || !c2.trim()) {
      setError('Please provide two ciphertexts');
      setResult(null);
      return;
    }
    setLoading(true);
    setError('');

    api.post('/tools/crypto/crib-drag', { cipher1: c1, cipher2: c2, crib: cr })
      .then((res) => {
        if (res.data?.error) {
          setError(res.data.error);
          setResult(null);
        } else {
          setResult(res.data);
          setError('');
          // Scan top candidates for CTF flags
          if (res.data?.candidates) {
            res.data.candidates.forEach((cand) => {
              if (/flag\{|ctf\{|\{[^}]{4,}\}/i.test(cand.revealed)) {
                addCandidate(cand.revealed, `Crib Drag (pos ${cand.position})`);
              }
            });
          }
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Crib dragging failed.');
        setResult(null);
      })
      .finally(() => setLoading(false));
  };

  const handleCribChange = (newCrib) => {
    setCrib(newCrib);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runCribDrag(cipher1, cipher2, newCrib), 250);
  };

  const copyVal = (k, v) => {
    if (!v) return;
    navigator.clipboard.writeText(String(v));
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <ToolWrapper
      title="Crib Dragging Cracker"
      category="Cryptography"
      description="Two-time pad (one-time pad key reuse) solver dragging known plaintext cribs across C1 ⊕ C2 using Java server engine."
      badge="Java Engine"
      outputValue={result ? result.xorHex : ''}
      sourceToolId="crib-drag"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Ciphertext Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Ciphertext 1 (Hex or ASCII)</label>
            <input
              type="text"
              value={cipher1}
              onChange={(e) => {
                setCipher1(e.target.value);
                clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => runCribDrag(e.target.value, cipher2, crib), 300);
              }}
              placeholder="e.g. 5b5501ff456e354e..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Ciphertext 2 (Hex or ASCII)</label>
            <input
              type="text"
              value={cipher2}
              onChange={(e) => {
                setCipher2(e.target.value);
                clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => runCribDrag(cipher1, e.target.value, crib), 300);
              }}
              placeholder="e.g. 3f1015bd0528760b..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
        </div>

        {/* Crib Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
            <label style={{ fontSize: 12, color: '#94a3b8' }}>Guess / Crib Word</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {cribPresets.map((p) => (
                <button
                  key={p}
                  onClick={() => handleCribChange(p)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: crib === p ? 'rgba(56, 189, 248, 0.2)' : '#0f172a',
                    border: crib === p ? '1px solid #38bdf8' : '1px solid #334155',
                    color: crib === p ? '#38bdf8' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: 11,
                    fontFamily: 'monospace'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={crib}
              onChange={(e) => handleCribChange(e.target.value)}
              placeholder="e.g. the  or flag{"
              style={{ flex: 1, padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
            />
            <button
              onClick={() => runCribDrag(cipher1, cipher2, crib)}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 20px',
                borderRadius: 6,
                background: '#38bdf8',
                color: '#0f172a',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                border: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              <Search size={16} />
              {loading ? 'Dragging...' : 'Drag Crib'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ padding: 10, borderRadius: 6, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* XOR Overlap Preview */}
        {result && (
          <div style={{ background: '#0b111e', border: '1px solid #1e293b', borderRadius: 6, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                C1 ⊕ C2 XOR STREAM ({result.overlapLength} BYTES OVERLAP)
              </span>
              <button
                onClick={() => copyVal('xorHex', result.xorHex)}
                style={{ background: 'none', border: 'none', color: copiedKey === 'xorHex' ? '#10b981' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
              >
                {copiedKey === 'xorHex' ? <Check size={12} /> : <Copy size={12} />}
                {copiedKey === 'xorHex' ? 'Copied' : 'Copy XOR'}
              </button>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8', wordBreak: 'break-all' }}>
              {result.xorHex}
            </div>
          </div>
        )}

        {/* Candidate List */}
        {result?.candidates && (
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
              <span>Ranked Positions ({result.candidates.length} offsets tested)</span>
              <span style={{ color: '#64748b', fontSize: 11 }}>Sorted by English frequency score</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 420, overflowY: 'auto' }}>
              {result.candidates.map((c) => (
                <div
                  key={c.position}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: c.score > 20 ? 'rgba(56, 189, 248, 0.08)' : '#0b111e',
                    border: c.score > 20 ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #1e293b'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b', width: 50 }}>
                      pos {c.position}
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: 14, color: c.printableRatio === 1 ? '#38bdf8' : '#e2e8f0', wordBreak: 'break-all' }}>
                      "{c.revealed}"
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 11, color: c.score > 15 ? '#10b981' : '#64748b', fontWeight: 600 }}>
                      score: {c.score}
                    </span>
                    <button
                      onClick={() => copyVal(`pos-${c.position}`, c.revealed)}
                      style={{ background: 'none', border: 'none', color: copiedKey === `pos-${c.position}` ? '#10b981' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
                    >
                      {copiedKey === `pos-${c.position}` ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
