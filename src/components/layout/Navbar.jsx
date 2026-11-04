import { useState, useEffect } from 'react';
import { Terminal, Shield, LogOut, User as UserIcon, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function Navbar({ onOpenPalette }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await api.get('/challenges', { timeout: 3000 });
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

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
      {/* Brand & Terminal Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Terminal size={22} color="#00ff9d" />
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '0.5px', color: '#f8fafc' }}>
          CTF<span style={{ color: '#00ff9d' }}>_PLATFORM</span>
        </span>

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
          border: `1px solid ${backendOnline ? 'rgba(0, 255, 157, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
          marginLeft: 12
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

      {/* Quick Search Button (Ctrl+K) & User Action */}
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
          <kbd style={{
            background: '#1e293b',
            color: '#c9d8e8',
            padding: '2px 5px',
            borderRadius: 4,
            fontSize: 10
          }}>Ctrl+K</kbd>
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
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Guest Session</span>
          </div>
        )}
      </div>
    </header>
  );
}
