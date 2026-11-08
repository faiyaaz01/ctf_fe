import { 
  Key, Globe, FileSearch, Radio, Cpu, BookOpen, 
  LayoutDashboard, Flag, Terminal, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', label: 'Dashboard', icon: LayoutDashboard, count: 64 },
  { id: 'crypto', label: 'Cryptography', icon: Key, count: 17 },
  { id: 'web', label: 'Web Exploitation', icon: Globe, count: 8 },
  { id: 'forensics', label: 'Forensics & Stego', icon: FileSearch, count: 12 },
  { id: 'osint', label: 'Network & OSINT', icon: Radio, count: 5 },
  { id: 'pwn', label: 'Reverse & Pwn', icon: Cpu, count: 13 },
  { id: 'reference', label: 'Cheat Sheets', icon: BookOpen, count: 2 },
  { id: 'workspace', label: 'Workspace & Notes', icon: Flag, count: 7 },
];

export default function Sidebar({ activeCategory, onSelectCategory, isOpen = true, onToggle }) {
  return (
    <aside style={{
      width: isOpen ? 256 : 68,
      minWidth: isOpen ? 256 : 68,
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'var(--theme-card-bg, rgba(13, 17, 23, 0.85))',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
      height: 'calc(100vh - 58px)',
      position: 'sticky',
      top: 58,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: isOpen ? '16px 12px' : '16px 8px',
      overflowX: 'hidden',
      overflowY: 'auto'
    }}>
      <div>
        {/* Header with Title & Collapse Button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          padding: isOpen ? '0 8px 12px' : '0 0 12px',
          borderBottom: '1px solid var(--theme-border, rgba(255, 255, 255, 0.06))',
          marginBottom: 10
        }}>
          {isOpen ? (
            <>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontFamily: '"JetBrains Mono", monospace',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <Terminal size={11} color="var(--theme-accent, #00f0ff)" />
                DOMAINS
              </span>
              <button
                onClick={onToggle}
                title="Collapse Sidebar (Ctrl+B)"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 4,
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--theme-accent, #00f0ff)'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
              >
                <PanelLeftClose size={15} />
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              title="Expand Sidebar (Ctrl+B)"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--theme-accent, #00f0ff)',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <PanelLeftOpen size={18} />
            </button>
          )}
        </div>

        {/* Categories Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                title={!isOpen ? `${cat.label} (${cat.count})` : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isOpen ? 'space-between' : 'center',
                  padding: isOpen ? '9px 12px' : '10px 0',
                  borderRadius: 7,
                  border: isActive
                    ? '1px solid var(--theme-accent, #00f0ff)'
                    : '1px solid transparent',
                  background: isActive
                    ? 'linear-gradient(90deg, var(--theme-glow, rgba(0, 240, 255, 0.15)) 0%, rgba(0,0,0,0.1) 100%)'
                    : 'transparent',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Icon
                    size={17}
                    color={isActive ? 'var(--theme-accent, #00f0ff)' : '#64748b'}
                  />
                  {isOpen && (
                    <span style={{
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: isActive ? '0.01em' : 'normal',
                      whiteSpace: 'nowrap'
                    }}>
                      {cat.label}
                    </span>
                  )}
                </div>

                {isOpen && (
                  <span style={{
                    fontSize: 10,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: 5,
                    background: isActive
                      ? 'rgba(0, 0, 0, 0.4)'
                      : 'rgba(255, 255, 255, 0.04)',
                    color: isActive ? 'var(--theme-accent, #00f0ff)' : '#64748b',
                    border: `1px solid ${isActive ? 'var(--theme-accent, #00f0ff)' : 'rgba(255,255,255,0.06)'}`
                  }}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Specs Widget */}
      {isOpen ? (
        <div style={{
          padding: '12px',
          borderRadius: 8,
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.06))',
          marginTop: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              fontFamily: '"JetBrains Mono", monospace',
              color: '#64748b',
              letterSpacing: '0.08em'
            }}>
              SECURITY ENGINE
            </span>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00ff9d',
              boxShadow: '0 0 6px #00ff9d'
            }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#cbd5e1', fontFamily: '"JetBrains Mono", monospace' }}>
            SPRING BOOT 3.3 // JAVA 17
          </div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 3 }}>
            64 Active Modules Connected
          </div>
        </div>
      ) : (
        <div
          title="Security Engine: Spring Boot 3.3 // Java 17"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
            padding: '8px 0',
            borderTop: '1px solid var(--theme-border, rgba(255, 255, 255, 0.06))'
          }}
        >
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#00ff9d',
            boxShadow: '0 0 8px #00ff9d'
          }} />
          <span style={{ fontSize: 9, color: '#64748b', fontFamily: '"JetBrains Mono", monospace', fontWeight: 700 }}>
            64M
          </span>
        </div>
      )}
    </aside>
  );
}
