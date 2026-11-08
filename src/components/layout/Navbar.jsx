import { Terminal, LogOut, User as UserIcon, Trophy, Wrench, Search, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import ThemeSelector from '../common/ThemeSelector';

export default function Navbar({ onOpenPalette, onOpenAuth, onOpenChallenges, onOpenTools, activeView, sidebarOpen = true, onToggleSidebar }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { backendOnline } = useApp();

  return (
    <header style={{
      height: 58,
      background: 'var(--theme-card-bg, rgba(13, 17, 23, 0.85))',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Segmented Nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Brand Icon & Name */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={onOpenTools}
          title="Return to Workbench"
        >
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.12))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            transition: 'border-color 0.2s'
          }}>
            <Terminal size={17} color="var(--theme-accent, #00f0ff)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: '0.08em',
              color: '#f8fafc',
              fontFamily: '"JetBrains Mono", monospace',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}>
              CTF<span style={{ color: 'var(--theme-accent, #00f0ff)' }}>//PLATFORM</span>
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
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'var(--theme-border, rgba(255,255,255,0.1))' }} />

        {/* Segmented View Switcher */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
          padding: 3,
          borderRadius: 8
        }}>
          <button
            onClick={onOpenTools}
            style={{
              background: activeView === 'tools' ? 'var(--theme-glow, rgba(0, 240, 255, 0.18))' : 'transparent',
              color: activeView === 'tools' ? 'var(--theme-accent, #00f0ff)' : '#94a3b8',
              border: activeView === 'tools' ? '1px solid var(--theme-accent, #00f0ff)' : '1px solid transparent',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: activeView === 'tools' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s'
            }}
          >
            <Wrench size={13} />
            <span>Workbench</span>
          </button>

          <button
            onClick={onOpenChallenges}
            style={{
              background: activeView === 'challenges' ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
              color: activeView === 'challenges' ? '#fbbf24' : '#94a3b8',
              border: activeView === 'challenges' ? '1px solid rgba(251, 191, 36, 0.4)' : '1px solid transparent',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12,
              fontWeight: activeView === 'challenges' ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s'
            }}
          >
            <Trophy size={13} />
            <span>Challenges</span>
          </button>
        </nav>

        {/* Live Backend Telemetry Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 10,
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 700,
          padding: '4px 10px',
          borderRadius: 20,
          background: backendOnline ? 'rgba(0, 255, 157, 0.08)' : 'rgba(244, 63, 94, 0.08)',
          color: backendOnline ? '#00ff9d' : '#f43f5e',
          border: `1px solid ${backendOnline ? 'rgba(0, 255, 157, 0.25)' : 'rgba(244, 63, 94, 0.25)'}`
        }}>
          <span style={{ position: 'relative', width: 7, height: 7, display: 'flex' }}>
            {backendOnline && (
              <span style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: '#00ff9d',
                animation: 'ctf-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
                opacity: 0.75
              }} />
            )}
            <span style={{
              position: 'relative',
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: backendOnline ? '#00ff9d' : '#f43f5e',
              boxShadow: `0 0 8px ${backendOnline ? '#00ff9d' : '#f43f5e'}`
            }} />
          </span>
          <span>{backendOnline ? 'API : 8080 ONLINE' : 'API : DISCONNECTED'}</span>
        </div>
      </div>

      {/* Right Controls: Command Palette, Theme, Operator Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenPalette}
          style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
            color: '#94a3b8',
            padding: '6px 12px',
            borderRadius: 7,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'border-color 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--theme-accent, #00f0ff)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--theme-border, rgba(255, 255, 255, 0.08))'}
        >
          <Search size={13} color="#64748b" />
          <span style={{ fontSize: 11, color: '#64748b' }}>Search toolkit...</span>
          <kbd style={{
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            padding: '2px 5px',
            borderRadius: 4,
            fontSize: 10,
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: 700
          }}>
            ⌘K
          </kbd>
        </button>

        <ThemeSelector />

        {/* Auth / Profile Area */}
        {isAuthenticated && user ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '4px 6px 4px 10px',
            borderRadius: 8,
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
              <div style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'var(--theme-glow, rgba(0, 240, 255, 0.2))',
                border: '1px solid var(--theme-accent, #00f0ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserIcon size={12} color="var(--theme-accent, #00f0ff)" />
              </div>
              <span style={{ fontWeight: 600, color: '#f8fafc', fontFamily: '"JetBrains Mono", monospace' }}>
                {user.username}
              </span>
              <span style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(0, 255, 157, 0.12)',
                color: '#00ff9d',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700
              }}>
                {user.score || 0} PTS
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign Out Operator"
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
              onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              background: 'linear-gradient(135deg, var(--theme-glow, rgba(0, 240, 255, 0.15)) 0%, transparent 100%)',
              border: '1px solid var(--theme-accent, #00f0ff)',
              color: 'var(--theme-accent, #00f0ff)',
              fontSize: 12,
              padding: '6px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 700,
              fontFamily: '"JetBrains Mono", monospace',
              letterSpacing: '0.04em',
              transition: 'all 0.15s'
            }}
          >
            OPERATOR ACCESS ➔
          </button>
        )}
      </div>
    </header>
  );
}
