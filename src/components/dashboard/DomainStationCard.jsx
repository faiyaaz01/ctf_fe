import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function DomainStationCard({ category, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const Icon = category.icon;

  return (
    <div
      onClick={() => onSelect(category.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--theme-card-bg, rgba(15, 23, 42, 0.75))',
        border: `1px solid ${hovered ? 'var(--theme-accent, #00f0ff)' : 'var(--theme-border, rgba(255, 255, 255, 0.08))'}`,
        borderRadius: 8,
        padding: '20px',
        cursor: 'pointer',
        backdropFilter: 'blur(10px)',
        boxShadow: hovered ? '0 8px 24px var(--theme-glow, rgba(0, 240, 255, 0.2))' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 150
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 7,
            background: 'var(--theme-glow, rgba(0, 240, 255, 0.12))',
            border: '1px solid var(--theme-accent, #00f0ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--theme-accent, #00f0ff)'
          }}>
            <Icon size={18} />
          </div>

          <span style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
            color: hovered ? 'var(--theme-accent, #00f0ff)' : '#94a3b8',
            fontFamily: '"JetBrains Mono", monospace'
          }}>
            {category.count} Modules
          </span>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 6 }}>
          {category.label}
        </h3>
        <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }}>
          {category.desc}
        </p>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: hovered ? 'var(--theme-accent, #00f0ff)' : '#64748b',
        fontFamily: '"JetBrains Mono", monospace',
        marginTop: 14
      }}>
        <span>Explore Toolkit</span>
        <ArrowRight size={13} style={{ transform: hovered ? 'translateX(3px)' : 'none', transition: 'transform 0.15s' }} />
      </div>
    </div>
  );
}
