import { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Cyan',
    accent: '#00f0ff',
    accentGlow: 'rgba(0, 240, 255, 0.35)',
    bg: '#070a13',
    cardBg: 'rgba(15, 23, 42, 0.75)',
    border: '#1e293b',
    iconColor: '#38bdf8'
  },
  {
    id: 'matrix',
    name: 'Matrix Terminal',
    accent: '#00ff66',
    accentGlow: 'rgba(0, 255, 102, 0.35)',
    bg: '#050a06',
    cardBg: 'rgba(11, 20, 13, 0.75)',
    border: '#162e1c',
    iconColor: '#00ff66'
  },
  {
    id: 'redteam',
    name: 'Red Team Ops',
    accent: '#ff0055',
    accentGlow: 'rgba(255, 0, 85, 0.35)',
    bg: '#0d0407',
    cardBg: 'rgba(24, 11, 15, 0.75)',
    border: '#3b1622',
    iconColor: '#ff0055'
  },
  {
    id: 'synthwave',
    name: 'Synthwave Void',
    accent: '#c084fc',
    accentGlow: 'rgba(192, 132, 252, 0.35)',
    bg: '#0c0717',
    cardBg: 'rgba(23, 14, 43, 0.75)',
    border: '#311c59',
    iconColor: '#c084fc'
  },
  {
    id: 'amber',
    name: 'Mainframe Amber',
    accent: '#f59e0b',
    accentGlow: 'rgba(245, 158, 11, 0.35)',
    bg: '#0c0904',
    cardBg: 'rgba(22, 17, 9, 0.75)',
    border: '#3b2f15',
    iconColor: '#f59e0b'
  }
];

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => localStorage.getItem('ctf_theme') || 'cyberpunk');
  const [motionEnabled, setMotionEnabled] = useState(() => localStorage.getItem('ctf_motion') !== 'false');

  const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  useEffect(() => {
    localStorage.setItem('ctf_theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    document.documentElement.style.setProperty('--theme-accent', currentTheme.accent);
    document.documentElement.style.setProperty('--theme-glow', currentTheme.accentGlow);
    document.documentElement.style.setProperty('--theme-bg', currentTheme.bg);
    document.documentElement.style.setProperty('--theme-card-bg', currentTheme.cardBg);
    document.documentElement.style.setProperty('--theme-border', currentTheme.border);
  }, [themeId, currentTheme]);

  useEffect(() => {
    localStorage.setItem('ctf_motion', String(motionEnabled));
  }, [motionEnabled]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setThemeId, motionEnabled, setMotionEnabled, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
