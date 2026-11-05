import { Terminal, Shield, LogOut, User as UserIcon, Trophy, Wrench } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

export default function Navbar({ onOpenPalette, onOpenAuth, onOpenChallenges, onOpenTools, activeView }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { backendOnline } = useApp();

  return (
    <header style={{
      height: 56,
      background: '#121824',
      borderBottom: '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Mode Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={onOpenTools}>
          <Terminal size={22} color="#00ff9d" />
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '0.5px', color: '#f8fafc' }}>
            CTF<span style={{ color: '#00ff9d' }}>_PLATFORM</span>
          </span>
        </div>

        {/* View Switchers */}
        <nav style={{ display: 'flex', gap: 6, marginLeft: 10 }}>
          <button
            onClick={onOpenTools}
            style={{
              background: activeView === 'tools' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeView === 'tools' ? '#38bdf8' : '#94a3b8',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Wrench size={13} /> Workbench
          </button>

          <button
            onClick={onOpenChallenges}
            style={{
              background: activeView === 'challenges' ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
              color: activeView === 'challenges' ? '#fbbf24' : '#94a3b8',
              border: 'none',
              borderRadius: 6,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Trophy size={13} /> Challenges
          </button>
        </nav>

        {/* Backend Java Health Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          padding: '3px 8px',
          borderRadius: 12,
          background: backendOnline ? 'rgba(0, 255, 157, 0.1)' : 'rgba(244, 63, 94, 0.1)',
          color: backendOnline ? '#00ff9d' : '#f43f5e',
          border: `1px solid ${backendOnline ? 'rgba(0, 255, 157, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
        }}>
          <span style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: backendOnline ? '#00ff9d' : '#f43f5e',
            boxShadow: `0 0 6px ${backendOnline ? '#00ff9d' : '#f43f5e'}`
          }} />
          {backendOnline ? 'JAVA API LIVE' : 'BACKEND OFFLINE'}
        </div>
      </div>

      {/* Quick Search & Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onOpenPalette}
          style={{
            background: '#0b0f17',
            border: '1px solid #1e293b',
            color: '#94a3b8',
            padding: '6px 12px',
            borderRadius: 6,
            fontSize: 12,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span>Search tools...</span>
          <kbd style={{ background: '#1e293b', color: '#c9d8e8', padding: '2px 5px', borderRadius: 4, fontSize: 10 }}>Ctrl+K</kbd>
        </button>

        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0', fontSize: 13 }}>
              <UserIcon size={15} color="#38bdf8" />
              <span>{user.username}</span>
              <span style={{ color: '#00ff9d', fontSize: 11, marginLeft: 4 }}>({user.score || 0} pts)</span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: 12,
              padding: '6px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
}
