import { useState, useRef } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, Search, Sparkles } from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function RotShiftTable({ onSelectDestination }) {
  const [text, setText] = useState('Uryyb Jbeyq! Gur synt vf synt{pnrfne_fbyirq}');
  const [filter, setFilter] = useState('');
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const { addCandidate } = useFlagHunter();
  const debounceRef = useRef(null);

  const fetchShifts = (val = text) => {
    if (!val.trim()) {
      setShifts([]);
      return;
    }
    setLoading(true);

    api.post('/tools/crypto/rot-table', { text: val })
      .then((res) => {
        const list = res.data?.shifts || [];
        setShifts(list);

        // Check for flags across all 25 shifts
        list.forEach((s) => {
          if (/flag\{|ctf\{|\{[^}]{4,}\}/i.test(s.text)) {
            addCandidate(s.text, `ROT-${s.shift}`);
          }
        });
      })
      .catch(() => setShifts([]))
      .finally(() => setLoading(false));
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchShifts(val), 250);
  };

  const copyVal = (k, v) => {
    if (!v) return;
    navigator.clipboard.writeText(String(v));
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Find highest score shift
  const maxScore = shifts.reduce((max, s) => (s.score > max ? s.score : max), 0);

  const filteredShifts = filter.trim()
    ? shifts.filter((s) => s.text.toLowerCase().includes(filter.toLowerCase()) || String(s.shift) === filter.trim())
    : shifts;

  return (
    <ToolWrapper
      title="Caesar 25-Shift Table"
      category="Cryptography"
      description="Simultaneous 25-rotation Caesar shift inspector with English frequency scoring on Java engine."
      badge="Java Engine"
      outputValue={shifts.length > 0 ? (shifts.find(s => s.shift === 13)?.text || shifts[0]?.text) : ''}
      sourceToolId="rot-table"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Input Text</label>
          <textarea
            rows={3}
            value={text}
            onChange={handleTextChange}
            placeholder="Ciphertext or plain text..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13, resize: 'vertical' }}
          />
        </div>

        {/* Filter input */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
            <Search size={14} color="#64748b" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by shift number or matching keyword..."
              style={{ width: '100%', padding: '6px 12px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontSize: 12 }}
            />
          </div>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            {loading ? 'Evaluating on server...' : `Displaying ${filteredShifts.length} of 25 shifts`}
          </span>
        </div>

        {/* 25-Shift Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto' }}>
          {filteredShifts.map((s) => {
            const isBest = s.score === maxScore && maxScore > 10;
            const isRot13 = s.shift === 13;

            return (
              <div
                key={s.shift}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 6,
                  background: isBest ? 'rgba(16, 185, 129, 0.08)' : isRot13 ? 'rgba(56, 189, 248, 0.08)' : '#0b111e',
                  border: isBest ? '1px solid rgba(16, 185, 129, 0.35)' : isRot13 ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #1e293b'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 95 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: isBest ? '#10b981' : isRot13 ? '#38bdf8' : '#94a3b8' }}>
                      ROT-{s.shift}
                    </span>
                    {isRot13 && (
                      <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: '#38bdf8', color: '#0f172a', fontWeight: 800 }}>
                        STD
                      </span>
                    )}
                  </div>

                  <span style={{ fontFamily: 'monospace', fontSize: 14, color: isBest ? '#34d399' : '#e2e8f0', wordBreak: 'break-all' }}>
                    {s.text}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {isBest && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 700 }}>
                      <Sparkles size={11} />
                      PROBABLE
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>
                    score: {s.score}
                  </span>
                  <button
                    onClick={() => copyVal(`rot-${s.shift}`, s.text)}
                    style={{ background: 'none', border: 'none', color: copiedKey === `rot-${s.shift}` ? '#10b981' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}
                    title="Copy text"
                  >
                    {copiedKey === `rot-${s.shift}` ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolWrapper>
  );
}
