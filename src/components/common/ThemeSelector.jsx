import { useState, useRef, useEffect } from 'react';
import { Palette, Check, Activity, EyeOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeSelector() {
  const [open, setOpen] = useState(false);
  const { currentTheme, setThemeId, motionEnabled, setMotionEnabled, THEMES } = useTheme();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        title="Change Cyber Theme"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#e2e8f0',
          padding: '5px 10px',
          borderRadius: 6,
          fontSize: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          transition: 'all 0.2s'
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: currentTheme.accent,
            boxShadow: `0 0 8px ${currentTheme.accent}`
          }}
        />
        <Palette size={14} color={currentTheme.accent} />
        <span style={{ fontSize: 11, fontWeight: 600 }}>{currentTheme.name.split(' ')[0]}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 220,
            background: '#0d131f',
            border: '1px solid #1e293b',
            borderRadius: 8,
            boxShadow: '0 12px 30px rgba(0,0,0,0.65)',
            padding: 8,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 4
          }}
        >
          <div style={{ padding: '4px 8px', fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Hacker Themes
          </div>

          {THEMES.map((t) => {
            const isSelected = t.id === currentTheme.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setThemeId(t.id);
                  setOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 6,
                  background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: isSelected ? `1px solid ${t.accent}` : '1px solid transparent',
                  color: isSelected ? '#f8fafc' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: 12,
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: t.accent,
                      boxShadow: `0 0 6px ${t.accent}`
                    }}
                  />
                  <span style={{ fontWeight: isSelected ? 700 : 500 }}>{t.name}</span>
                </div>
                {isSelected && <Check size={14} color={t.accent} />}
              </button>
            );
          })}

          <div style={{ height: 1, background: '#1e293b', margin: '4px 0' }} />

          {/* Cursor Motion Toggle */}
          <button
            onClick={() => setMotionEnabled(!motionEnabled)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 10px',
              borderRadius: 6,
              background: 'transparent',
              border: 'none',
              color: motionEnabled ? '#38bdf8' : '#64748b',
              cursor: 'pointer',
              fontSize: 11,
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {motionEnabled ? <Activity size={13} /> : <EyeOff size={13} />}
              <span>Live Cursor FX</span>
            </div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                background: motionEnabled ? 'rgba(56, 189, 248, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                color: motionEnabled ? '#38bdf8' : '#64748b'
              }}
            >
              {motionEnabled ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
