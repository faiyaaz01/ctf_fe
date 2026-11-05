import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, tools = [], onSelectTool }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = tools.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: 100,
      zIndex: 1000
    }} onClick={() => onClose(false)}>
      <div style={{
        width: 560,
        maxWidth: '90%',
        background: '#121824',
        border: '1px solid #1e293b',
        borderRadius: 8,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Search header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px 16px',
          borderBottom: '1px solid #1e293b',
          gap: 10
        }}>
          <Search size={18} color="#38bdf8" />
          <input
            autoFocus
            type="text"
            placeholder="Type tool name or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: 14
            }}
          />
          <button onClick={() => onClose(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
              No CTF tools matching "{query}"
            </div>
          ) : (
            filtered.map((tool) => (
              <div
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.id);
                  onClose(false);
                }}
                style={{
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderBottom: '1px solid #161e2e'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div>
                  <div style={{ fontSize: 14, color: '#f1f5f9', fontWeight: 500 }}>{tool.title}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{tool.category}</div>
                </div>
                <span style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: tool.badge === 'Java Engine' ? 'rgba(0, 255, 157, 0.15)' : 'rgba(148, 163, 184, 0.1)',
                  color: tool.badge === 'Java Engine' ? '#00ff9d' : '#94a3b8'
                }}>
                  {tool.badge || 'Client'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
