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

export default function Sidebar({ activeCategory, onSelectCategory, isOpen = true, onToggle, onOpenHome }) {
  return (
    <aside style={{
      width: isOpen ? 256 : 68,
      minWidth: isOpen ? 256 : 68,
      transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      background: 'var(--theme-card-bg, rgba(13, 17, 23, 0.85))',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRight: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      overflowX: 'hidden',
      zIndex: 110
    }}>
      {/* 1. Attached Header - Aligns with 58px Navbar */}
      <div style={{
        height: 58,
        minHeight: 58,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isOpen ? 'space-between' : 'center',
        padding: isOpen ? '0 16px' : '0',
        borderBottom: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
        background: 'rgba(0, 0, 0, 0.2)'
      }}>
        {isOpen ? (
          <>
            {/* Brand Logo & Name */}
            <div
              onClick={onOpenHome}
              title="Return to Dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 7,
                background: 'var(--theme-glow, rgba(0, 240, 255, 0.15))',
                border: '1px solid var(--theme-accent, #00f0ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--theme-accent, #00f0ff)'
              }}>
                <Terminal size={16} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: '0.06em',
                  color: '#f8fafc',
                  fontFamily: '"JetBrains Mono", monospace'
                }}>
                  CTF<span style={{ color: 'var(--theme-accent, #00f0ff)' }}>//PLATFORM</span>
                </span>
                <span style={{
                  fontSize: 9,
                  fontWeight: 600,
                  padding: '1px 5px',
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#94a3b8'
                }}>
                  v2.4
                </span>
              </div>
            </div>

            {/* Collapse Button */}
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
              <PanelLeftClose size={16} />
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
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
      </div>

      {/* 2. Middle Navigation Section */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: isOpen ? '16px 12px' : '16px 8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        <div style={{
          fontSize: 9,
          fontWeight: 800,
          color: '#64748b',
          fontFamily: '"JetBrains Mono", monospace',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          padding: isOpen ? '0 8px 8px' : '0 0 8px',
          textAlign: isOpen ? 'left' : 'center'
        }}>
          {isOpen ? 'NAVIGATION' : '•••'}
        </div>

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
      </div>

      {/* 3. Footer System Specs Widget */}
      {isOpen ? (
        <div style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
          background: 'rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{
              fontSize: 9,
              fontWeight: 800,
              fontFamily: '"JetBrains Mono", monospace',
              color: '#64748b',
              letterSpacing: '0.08em'
            }}>
              ENGINE STATUS
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
          <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
            64 Modules Online
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
            padding: '12px 0',
            borderTop: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))'
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
