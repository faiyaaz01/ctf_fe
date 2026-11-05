import { ArrowRight, Sparkles } from 'lucide-react';

export default function ToolCard({ tool, onOpen }) {
  const isJava = tool.badge === 'Java Engine';

  return (
    <div
      onClick={() => onOpen(tool.id)}
      style={{
        background: '#121824',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: 18,
        cursor: 'pointer',
        transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#38bdf8';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#1e293b';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{
            fontSize: 10,
            textTransform: 'uppercase',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 10,
            background: isJava ? 'rgba(0, 255, 157, 0.12)' : 'rgba(148, 163, 184, 0.1)',
            color: isJava ? '#00ff9d' : '#94a3b8',
            border: `1px solid ${isJava ? 'rgba(0, 255, 157, 0.3)' : 'rgba(148, 163, 184, 0.2)'}`
          }}>
            {tool.badge}
          </span>
          <span style={{ fontSize: 11, color: '#64748b' }}>{tool.categoryLabel}</span>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 6 }}>
          {tool.title}
        </h3>

        <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>
          {tool.description}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 12, borderTop: '1px solid #161e2e' }}>
        <span style={{ fontSize: 12, color: '#38bdf8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
          Launch Tool <ArrowRight size={13} />
        </span>
      </div>
    </div>
  );
}
