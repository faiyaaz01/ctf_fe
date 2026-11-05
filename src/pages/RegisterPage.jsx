import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Terminal, Lock, User, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function RegisterPage({ onSwitchToLogin, onClose }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      if (onClose) onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '40px auto',
      background: '#121824',
      border: '1px solid #1e293b',
      borderRadius: 8,
      padding: 28,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Terminal size={32} color="#38bdf8" style={{ marginBottom: 8 }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc' }}>Create Account</h2>
        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Join the CTF platform and track your solves</p>
      </div>

      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: '#f43f5e',
          padding: '10px 12px',
          borderRadius: 6,
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16
        }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Username</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#0b0f17', border: '1px solid #1e293b', borderRadius: 6, padding: '0 10px' }}>
            <User size={15} color="#64748b" />
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="faiyaaz"
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px', color: '#f8fafc', outline: 'none', fontSize: 13 }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Email</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#0b0f17', border: '1px solid #1e293b', borderRadius: 6, padding: '0 10px' }}>
            <Mail size={15} color="#64748b" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@ctf.io"
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px', color: '#f8fafc', outline: 'none', fontSize: 13 }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>Password</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#0b0f17', border: '1px solid #1e293b', borderRadius: 6, padding: '0 10px' }}>
            <Lock size={15} color="#64748b" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={{ flex: 1, background: 'transparent', border: 'none', padding: '10px', color: '#f8fafc', outline: 'none', fontSize: 13 }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#38bdf8',
            color: '#0b0f17',
            border: 'none',
            borderRadius: 6,
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: 8
          }}
        >
          {loading ? 'Registering...' : 'Create Account'}
          <ArrowRight size={14} />
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: '#64748b' }}>
        Already registered?{' '}
        <span
          onClick={onSwitchToLogin}
          style={{ color: '#00ff9d', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Sign in here
        </span>
      </div>
    </div>
  );
}
