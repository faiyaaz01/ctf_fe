import { useState } from 'react';
import { Share2 } from 'lucide-react';

const DESTINATIONS = [
  { id: 'decoder', label: 'Multi Decoder' },
  { id: 'xor', label: 'XOR Toolkit' },
  { id: 'hash', label: 'Hash Utils' },
  { id: 'jwt', label: 'JWT Analyzer' },
  { id: 'encoding', label: 'Encoding Lab' },
  { id: 'regex', label: 'Regex Tester' },
  { id: 'notes', label: 'Notes' },
  { id: 'flaghunter', label: 'Flag Hunter' },
];

export default function SendToMenu({ value, sourceTool, onSelectDestination }) {
  const [open, setOpen] = useState(false);

  const handleSend = (destId) => {
    setOpen(false);
    sessionStorage.setItem('ctf_transfer', JSON.stringify({
      value,
      sourceTool,
      destId,
      timestamp: Date.now()
    }));
    window.dispatchEvent(new CustomEvent('ctf:transfer', {
      detail: { value, sourceTool, destId }
    }));
    if (onSelectDestination) {
      onSelectDestination(destId);
    }
  };

  if (!value) return null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38bdf8',
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 4,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}
      >
        <Share2 size={13} />
        Send To ▾
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 4,
          background: '#161e2e',
          border: '1px solid #1e293b',
          borderRadius: 6,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          zIndex: 50,
          minWidth: 160,
          overflow: 'hidden'
        }}>
          {DESTINATIONS.map((d) => (
            <div
              key={d.id}
              onClick={() => handleSend(d.id)}
              style={{
                padding: '8px 12px',
                fontSize: 12,
                color: '#c9d8e8',
                cursor: 'pointer',
                borderBottom: '1px solid #1e293b'
              }}
              onMouseEnter={(e) => (e.target.style.background = 'rgba(56, 189, 248, 0.15)')}
              onMouseLeave={(e) => (e.target.style.background = 'transparent')}
            >
              {d.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
