import { useState, useEffect } from 'react';
import { 
  Key, Globe, FileSearch, Radio, Cpu, BookOpen, Flag, 
  Clock, Shield, Terminal as TermIcon, Sparkles, LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import DashboardTerminal from './DashboardTerminal';
import InstantDecryptor from './InstantDecryptor';
import DomainStationCard from './DomainStationCard';

export const DOMAIN_STATIONS = [
  { id: 'crypto', label: 'Cryptography Lab', icon: Key, count: 17, desc: 'Wiener/Fermat RSA attacks, Baby-step Giant-step, Crib dragging, Radix, Hashes, and Ciphers.' },
  { id: 'web', label: 'Web Exploitation', icon: Globe, count: 8, desc: 'JWT token tampered signature auditor, SQLi/SSTI filters, Payload dictionary, and Regex.' },
  { id: 'forensics', label: 'Forensics & Stego', icon: FileSearch, count: 12, desc: 'Magic byte carvers, LSB bitplane canvas, PCAP binary inspector, and ZIP password crackers.' },
  { id: 'osint', label: 'Network & OSINT', icon: Radio, count: 5, desc: 'IPv4/IPv6 CIDR subnet masks, Shodan/Censys intel workspace, and Whois socket resolver.' },
  { id: 'pwn', label: 'Reverse & Binary Pwn', icon: Cpu, count: 13, desc: 'Shellcode encoders, opcode tables, binary structure inspector, and format string exploits.' },
  { id: 'workspace', label: 'Workspace & Notes', icon: Flag, count: 7, desc: 'Cloud-synced persistent notes, heuristic flag hunter candidate pool, and session audits.' },
  { id: 'reference', label: 'Cheat Sheets & Guides', icon: BookOpen, count: 2, desc: 'Quick syntax sheets for CTF competitions, status codes, and security attack vectors.' }
];

export default function MainDashboard({ onSelectDomain, onOpenTool, onViewAllTools }) {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = time.getHours();
  const greeting = hour < 12 
    ? 'Good morning' 
    : hour < 17 
      ? 'Good afternoon' 
      : hour < 22 
        ? 'Good evening' 
        : 'Late night ops';

  const operatorName = user?.username || 'Operator';

  const quickPills = [
    { id: 'decoder', label: 'Multi Decoder', icon: Key },
    { id: 'xor', label: 'XOR Toolkit', icon: Key },
    { id: 'hash', label: 'Hash Utils', icon: Key },
    { id: 'rot-table', label: 'ROT Table', icon: Key },
    { id: 'notes', label: 'Notes Pad', icon: Flag },
    { id: 'flaghunter', label: 'Flag Hunter', icon: Flag }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1240, margin: '0 auto' }}>
      {/* 1. Dynamic Greeting & Live Cyber Clock Banner */}
      <div style={{
        background: 'var(--theme-card-bg, rgba(15, 23, 42, 0.75))',
        border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
        borderRadius: 10,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.35)'
      }}>
        {/* Left: Greeting & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'var(--theme-glow, rgba(0, 240, 255, 0.15))',
            border: '1px solid var(--theme-accent, #00f0ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--theme-accent, #00f0ff)'
          }}>
            <Shield size={22} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.01em' }}>
                {greeting}, <span style={{ color: 'var(--theme-accent, #00f0ff)' }}>{operatorName}</span> 👋
              </h1>
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: 10,
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid #22c55e',
                color: '#22c55e',
                fontFamily: '"JetBrains Mono", monospace'
              }}>
                SYSTEM ONLINE
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
              64 security tools loaded. Interactive terminal ready below.
            </p>
          </div>
        </div>

        {/* Right: Live Clock & Theme Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '10px 18px',
          borderRadius: 8,
          border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))'
        }}>
          <Clock size={20} color="var(--theme-accent, #00f0ff)" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: 18,
              fontWeight: 800,
              fontFamily: '"JetBrains Mono", monospace',
              color: '#f8fafc',
              letterSpacing: '0.04em'
            }}>
              {time.toLocaleTimeString()}
            </span>
            <span style={{
              fontSize: 11,
              color: '#64748b',
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              {time.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <div style={{
            height: 28,
            width: 1,
            background: 'var(--theme-border, rgba(255, 255, 255, 0.1))',
            margin: '0 4px'
          }} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', fontFamily: '"JetBrains Mono", monospace' }}>
              ACTIVE THEME
            </span>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--theme-accent, #00f0ff)',
              fontFamily: '"JetBrains Mono", monospace'
            }}>
              {currentTheme.name}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Terminal & Instant Decryptor Dual HUD */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
        gap: 20,
        alignItems: 'stretch'
      }}>
        {/* Interactive Hacker Terminal */}
        <DashboardTerminal onOpenTool={onOpenTool} />

        {/* Instant Decryptor & Fast Launch Hub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <InstantDecryptor onSelectDestination={onOpenTool} />

          {/* Quick Launch Pills */}
          <div style={{
            background: 'var(--theme-card-bg, rgba(15, 23, 42, 0.75))',
            border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
            borderRadius: 8,
            padding: '12px 16px',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#64748b',
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                Quick Launch Shortcuts
              </span>
              <button
                onClick={onViewAllTools}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--theme-accent, #00f0ff)',
                  fontSize: 11,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <LayoutGrid size={12} />
                <span>64 Tools Grid →</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {quickPills.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => onOpenTool(p.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 6,
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
                      color: '#e2e8f0',
                      fontSize: 11,
                      fontFamily: '"JetBrains Mono", monospace',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--theme-accent, #00f0ff)';
                      e.currentTarget.style.color = 'var(--theme-accent, #00f0ff)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--theme-border, rgba(255, 255, 255, 0.1))';
                      e.currentTarget.style.color = '#e2e8f0';
                    }}
                  >
                    <Icon size={12} color="var(--theme-accent, #00f0ff)" />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Operational Domain Sectors */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 800,
            color: '#64748b',
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}>
            Operational Sectors (7 Toolkits)
          </span>
          <span style={{ fontSize: 11, color: '#475569', fontFamily: '"JetBrains Mono", monospace' }}>
            Click card to explore sector tools
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16
        }}>
          {DOMAIN_STATIONS.map((cat) => (
            <DomainStationCard key={cat.id} category={cat} onSelect={onSelectDomain} />
          ))}
        </div>
      </div>
    </div>
  );
}
