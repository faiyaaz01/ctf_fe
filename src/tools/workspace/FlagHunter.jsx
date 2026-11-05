import { useState } from 'react';
import { Flag, Trash2, CheckCircle2, XCircle, Search, ShieldAlert, Copy, Check } from 'lucide-react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function FlagHunter({ onSelectDestination }) {
  const { candidates, addCandidate, clearAll } = useFlagHunter();
  const [manualInput, setManualInput] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const handleManualScan = () => {
    if (!manualInput.trim()) return;
    addCandidate(manualInput, 'Manual Scan');
    setManualInput('');
  };

  const handleCopy = (id, val) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <ToolWrapper
      title="Flag Hunter"
      category="Workspace"
      description="Automated regex watcher and aggregator for CTF flag patterns, confidence scoring, and MongoDB cloud persistence."
      badge="Java Engine"
      sourceToolId="flaghunter"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Manual scanner box */}
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
            placeholder="Paste raw text, decoded string, or cipher dump to scan for flags..."
            style={{
              flex: 1,
              background: '#0b0f17',
              border: '1px solid #1e293b',
              borderRadius: 6,
              padding: '10px 14px',
              color: '#f8fafc',
              fontSize: 13,
              outline: 'none',
              fontFamily: '"JetBrains Mono", monospace'
            }}
          />
          <button
            onClick={handleManualScan}
            style={{
              background: '#00ff9d',
              color: '#0b0f17',
              border: 'none',
              borderRadius: 6,
              padding: '0 18px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Search size={15} /> Scan Text
          </button>
          {candidates.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f43f5e',
                borderRadius: 6,
                padding: '0 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12
              }}
            >
              <Trash2 size={14} /> Clear Pool
            </button>
          )}
        </div>

        {/* Candidate pool list */}
        <div style={{
          border: '1px solid #1e293b',
          borderRadius: 6,
          background: '#0d1117',
          minHeight: 260,
          maxHeight: 450,
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: '#64748b'
          }}>
            <span>Discovered Flag Candidates ({candidates.length})</span>
            <span>Regex Heuristics: PicoCTF, CTF{`{...}`}, HTB, Hex</span>
          </div>

          {candidates.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              <Flag size={28} color="#334155" style={{ marginBottom: 8 }} />
              <div>No candidate flags discovered yet.</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>
                Tools running across Cryptography, Forensics, and Web will automatically pipe detected flags here.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {candidates.map((c) => {
                const isHigh = c.confidence === 'high';
                return (
                  <div
                    key={c.id || c.value}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #161e2e',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, overflow: 'hidden' }}>
                      <span style={{
                        fontSize: 10,
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 10,
                        background: isHigh ? 'rgba(0, 255, 157, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                        color: isHigh ? '#00ff9d' : '#fbbf24',
                        border: `1px solid ${isHigh ? 'rgba(0, 255, 157, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`
                      }}>
                        {c.confidence}
                      </span>

                      <span style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 14,
                        color: '#f8fafc',
                        fontWeight: 600,
                        letterSpacing: '0.3px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {c.value}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 11, color: '#64748b' }}>
                        Source: <span style={{ color: '#38bdf8' }}>{c.sourceTool || 'Unknown'}</span>
                      </span>

                      <button
                        onClick={() => handleCopy(c.id || c.value, c.value)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid #1e293b',
                          color: copiedId === (c.id || c.value) ? '#00ff9d' : '#94a3b8',
                          padding: '4px 8px',
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11
                        }}
                      >
                        {copiedId === (c.id || c.value) ? <Check size={12} /> : <Copy size={12} />}
                        {copiedId === (c.id || c.value) ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ToolWrapper>
  );
}
