import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import SendToMenu from './SendToMenu';

export default function ToolWrapper({
  title,
  category,
  description,
  badge = 'Client', // 'Client' or 'Java Engine'
  outputValue = '',
  sourceToolId = '',
  onSelectDestination,
  children
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!outputValue) return;
    navigator.clipboard.writeText(outputValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isJava = badge === 'Java Engine';

  return (
    <div style={{
      background: '#121824',
      border: '1px solid #1e293b',
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 20
    }}>
      {/* Header bar */}
      <div style={{
        padding: '12px 16px',
        background: '#0d1117',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#f8fafc' }}>{title}</span>
          <span style={{
            fontSize: 10,
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: 10,
            background: isJava ? 'rgba(0, 255, 157, 0.12)' : 'rgba(148, 163, 184, 0.12)',
            color: isJava ? '#00ff9d' : '#94a3b8',
            border: `1px solid ${isJava ? 'rgba(0, 255, 157, 0.3)' : 'rgba(148, 163, 184, 0.2)'}`
          }}>
            {badge}
          </span>
          {category && (
            <span style={{ fontSize: 11, color: '#64748b' }}>• {category}</span>
          )}
        </div>

        {/* Action bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {outputValue && (
            <>
              <button
                onClick={handleCopy}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #1e293b',
                  color: copied ? '#00ff9d' : '#94a3b8',
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <SendToMenu
                value={outputValue}
                sourceTool={sourceToolId || title}
                onSelectDestination={onSelectDestination}
              />
            </>
          )}
        </div>
      </div>

      {description && (
        <div style={{ padding: '8px 16px', background: 'rgba(11, 15, 23, 0.5)', fontSize: 12, color: '#64748b', borderBottom: '1px solid #1a2332' }}>
          {description}
        </div>
      )}

      {/* Main body */}
      <div style={{ padding: 16 }}>
        {children}
      </div>
    </div>
  );
}
