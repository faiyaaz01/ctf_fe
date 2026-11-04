import { 
  Key, Globe, FileSearch, Radio, Cpu, BookOpen, 
  Layers, Flag, CheckSquare 
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', label: 'All Tools', icon: Layers, count: 64 },
  { id: 'crypto', label: 'Cryptography', icon: Key, count: 17 },
  { id: 'web', label: 'Web Exploitation', icon: Globe, count: 8 },
  { id: 'forensics', label: 'Forensics & Stego', icon: FileSearch, count: 12 },
  { id: 'osint', label: 'Network & OSINT', icon: Radio, count: 5 },
  { id: 'pwn', label: 'Reverse & Pwn', icon: Cpu, count: 13 },
  { id: 'reference', label: 'Cheat Sheets', icon: BookOpen, count: 2 },
  { id: 'workspace', label: 'Workspace & Notes', icon: Flag, count: 7 },
];

export default function Sidebar({ activeCategory, onSelectCategory }) {
  return (
    <aside style={{
      width: 240,
      background: '#0d1117',
      borderRight: '1px solid #1e293b',
      height: 'calc(100vh - 56px)',
      position: 'sticky',
      top: 56,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 10px',
      overflowY: 'auto'
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 8px 10px' }}>
        Categories
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: 6,
                border: 'none',
                background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: isActive ? '#38bdf8' : '#94a3b8',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s, color 0.15s',
                borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={16} color={isActive ? '#38bdf8' : '#64748b'} />
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{cat.label}</span>
              </div>
              <span style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 10,
                background: isActive ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                color: isActive ? '#38bdf8' : '#64748b'
              }}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
