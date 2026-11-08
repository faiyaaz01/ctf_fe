import { LogOut, User as UserIcon, Trophy, Wrench, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import ThemeSelector from '../common/ThemeSelector';

export default function Navbar({ onOpenPalette, onOpenAuth, onOpenChallenges, onOpenTools, activeView }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { backendOnline } = useApp();

  return (
    <header style={{
      height: 58,
      minHeight: 58,
      background: 'var(--theme-card-bg, rgba(13, 17, 23, 0.85))',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Left: View Switcher & API Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
        {/* Search / Command Palette Trigger */}
        <button
          onClick={onOpenPalette}
          title="Open Command Palette (Ctrl+K)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
            borderRadius: 7,
            padding: '6px 12px',
            color: '#94a3b8',
            fontSize: 12,
            fontFamily: '"JetBrains Mono", monospace',
            cursor: 'pointer',
            transition: 'border-color 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--theme-accent, #00f0ff)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--theme-border, rgba(255, 255, 255, 0.08))'}
        >
          <Search size={13} color="var(--theme-accent, #00f0ff)" />
          <span>Search tools...</span>
          <kbd style={{
            fontSize: 9,
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '2px 5px',
            borderRadius: 4,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#cbd5e1'
          }}>
            ⌘K
          </kbd>
        </button>

        {/* Live Hacker Theme Switcher */}
        <ThemeSelector />

        {/* User Auth Profile Button */}
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 12px',
              borderRadius: 7,
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))'
            }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: 'var(--theme-accent, #00f0ff)',
                color: '#070a13',
                fontSize: 10,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#f8fafc', fontFamily: '"JetBrains Mono", monospace' }}>
                {user?.username}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign Out"
              style={{
                background: 'transparent',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f43f5e',
                borderRadius: 6,
                padding: '6px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 7,
              background: 'var(--theme-glow, rgba(0, 240, 255, 0.12))',
              border: '1px solid var(--theme-accent, #00f0ff)',
              color: 'var(--theme-accent, #00f0ff)',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <UserIcon size={13} />
            <span>OPERATOR LOGIN</span>
          </button>
        )}
      </div>
    </header>
  );
}
