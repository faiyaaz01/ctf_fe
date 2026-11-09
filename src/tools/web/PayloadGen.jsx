import { useState, useEffect } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { 
  Search, Copy, Check, Filter, Zap, RefreshCw, 
  Layers, Terminal, Globe, ShieldAlert 
} from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export const CATEGORIES = [
  { id: 'all', label: 'All Attack Vectors' },
  { id: 'sqli', label: 'SQL Injection (SQLi)' },
  { id: 'xss', label: 'Cross-Site Scripting (XSS)' },
  { id: 'ssti', label: 'Template Injection (SSTI)' },
  { id: 'lfi', label: 'LFI & Path Traversal' },
  { id: 'cmdi', label: 'Command Injection (RCE)' },
  { id: 'xxe', label: 'XML External Entity (XXE)' },
  { id: 'ssrf', label: 'Server-Side Request Forgery' },
  { id: 'redirect', label: 'Open Redirect' },
  { id: 'csrf', label: 'CSRF PoC Generator' },
  { id: 'proto', label: 'Prototype Pollution' },
  { id: 'crlf', label: 'CRLF / Header Injection' },
  { id: 'ldap', label: 'LDAP Injection' },
  { id: 'nosql', label: 'NoSQL Injection (MongoDB)' }
];

export const ENCODINGS = [
  { id: 'raw', label: 'Raw' },
  { id: 'url', label: 'URL Encoded' },
  { id: 'double_url', label: 'Double URL' },
  { id: 'base64', label: 'Base64' },
  { id: 'hex', label: 'Hex (\\x41)' },
  { id: 'html', label: 'HTML Entity' }
];

export default function PayloadGen({ onSelectDestination }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [encoding, setEncoding] = useState('raw');
  const [replacements, setReplacements] = useState({
    target: '127.0.0.1:8080',
    cmd: 'cat /flag.txt',
    file: 'etc/passwd'
  });

  const [payloads, setPayloads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const { addCandidate } = useFlagHunter();

  const fetchPayloads = () => {
    setLoading(true);
    setError('');

    const params = {};
    if (selectedCategory !== 'all') params.category = selectedCategory;
    if (searchQuery.trim()) params.query = searchQuery.trim();

    api.get('/tools/web/payloads', { params })
      .then((res) => {
        if (res.data?.payloads) {
          setPayloads(res.data.payloads);
        } else {
          setPayloads([]);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message || 'Failed to load payloads');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayloads();
  }, [selectedCategory, searchQuery]);

  // Client-side instant renderer with encoding & replacement
  const renderEncoded = (raw) => {
    if (!raw) return '';
    let processed = raw
      .replace(/\{\{TARGET\}\}/g, replacements.target || '127.0.0.1')
      .replace(/\{\{CMD\}\}/g, replacements.cmd || 'id')
      .replace(/\{\{FILE\}\}/g, replacements.file || 'etc/passwd');

    switch (encoding) {
      case 'url':
        return encodeURIComponent(processed);
      case 'double_url':
        return encodeURIComponent(encodeURIComponent(processed));
      case 'base64':
        try {
          return btoa(processed);
        } catch (_) {
          return processed;
        }
      case 'hex':
        return processed.split('').map((c) => '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
      case 'html':
        return processed.split('').map((c) => `&#x${c.charCodeAt(0).toString(16)};`).join('');
      default:
        return processed;
    }
  };

  const handleCopy = (raw, id) => {
    const text = renderEncoded(raw);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);

    // If payload contains a flag pattern, register with flag hunter
    if (/flag\{|ctf\{/i.test(text)) {
      const match = text.match(/(?:flag|ctf)\{[^}]+\}/i);
      if (match) addCandidate(match[0], 'PayloadGen Preset');
    }
  };

  return (
    <ToolWrapper
      title="Web Attack Payload Generator"
      description="Curated penetration testing dictionary across 13 web attack categories with live parameter injection and instant multi-format encoding."
      badge="Java Engine"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top Controls: Search & Parameter Replacements */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
          borderRadius: 8,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}>
          {/* Search Bar & Encoding Switch */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{
              flex: 1,
              minWidth: 260,
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={15} color="#64748b" style={{ position: 'absolute', left: 12 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 28 payloads (e.g. sleep, alert, popen, nullbyte)..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 6,
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.12))',
                  color: '#f8fafc',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                  outline: 'none'
                }}
              />
            </div>

            {/* Encoding Selector Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#64748b', fontFamily: '"JetBrains Mono", monospace', marginRight: 4 }}>
                ENCODING:
              </span>
              {ENCODINGS.map((enc) => (
                <button
                  key={enc.id}
                  onClick={() => setEncoding(enc.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 5,
                    background: encoding === enc.id ? 'var(--theme-glow, rgba(0, 240, 255, 0.18))' : 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${encoding === enc.id ? 'var(--theme-accent, #00f0ff)' : 'rgba(255, 255, 255, 0.08)'}`,
                    color: encoding === enc.id ? 'var(--theme-accent, #00f0ff)' : '#94a3b8',
                    fontSize: 11,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: encoding === enc.id ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {enc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Template Parameters ({{TARGET}}, {{CMD}}, {{FILE}}) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 10,
            paddingTop: 10,
            borderTop: '1px solid var(--theme-border, rgba(255, 255, 255, 0.06))'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                TARGET / HOST (&#123;&#123;TARGET&#125;&#125;):
              </label>
              <input
                type="text"
                value={replacements.target}
                onChange={(e) => setReplacements({ ...replacements, target: e.target.value })}
                style={{
                  padding: '6px 10px',
                  borderRadius: 5,
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
                  color: '#38bdf8',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 11,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                COMMAND (&#123;&#123;CMD&#125;&#125;):
              </label>
              <input
                type="text"
                value={replacements.cmd}
                onChange={(e) => setReplacements({ ...replacements, cmd: e.target.value })}
                style={{
                  padding: '6px 10px',
                  borderRadius: 5,
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
                  color: '#f87171',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 11,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                FILE PATH (&#123;&#123;FILE&#125;&#125;):
              </label>
              <input
                type="text"
                value={replacements.file}
                onChange={(e) => setReplacements({ ...replacements, file: e.target.value })}
                style={{
                  padding: '6px 10px',
                  borderRadius: 5,
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
                  color: '#fbbf24',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 11,
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Categories Rail & Payloads Grid */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Categories Sidebar */}
          <div style={{
            width: 240,
            minWidth: 220,
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
            borderRadius: 8,
            padding: '10px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}>
            <div style={{
              fontSize: 10,
              fontWeight: 800,
              color: '#64748b',
              fontFamily: '"JetBrains Mono", monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              padding: '6px 8px',
              marginBottom: 4
            }}>
              Attack Categories (13)
            </div>

            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 6,
                    background: active ? 'var(--theme-glow, rgba(0, 240, 255, 0.15))' : 'transparent',
                    border: `1px solid ${active ? 'var(--theme-accent, #00f0ff)' : 'transparent'}`,
                    color: active ? '#f8fafc' : '#94a3b8',
                    fontSize: 12,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.color = '#e2e8f0';
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.color = '#94a3b8';
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Payloads List */}
          <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc', fontFamily: '"JetBrains Mono", monospace' }}>
                {CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'All Vectors'} ({payloads.length} Payloads)
              </span>
              {loading && <RefreshCw size={13} className="animate-spin" color="var(--theme-accent, #00f0ff)" />}
            </div>

            {error && (
              <div style={{ padding: 12, borderRadius: 6, background: 'rgba(239,68,68,0.1)', color: '#f87171', fontSize: 12 }}>
                {error}
              </div>
            )}

            {payloads.map((p) => {
              const isCrit = p.risk === 'CRITICAL';
              const isHigh = p.risk === 'HIGH';
              const rendered = renderEncoded(p.payload);

              return (
                <div
                  key={p.id}
                  style={{
                    background: 'var(--theme-card-bg, rgba(15, 23, 42, 0.75))',
                    border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
                    borderRadius: 8,
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  {/* Card Header: Title + Risk Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <div>
                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                        {p.title}
                      </h4>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.4 }}>
                        {p.desc}
                      </p>
                    </div>

                    <span style={{
                      fontSize: 10,
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: isCrit ? 'rgba(239, 68, 68, 0.15)' : isHigh ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      border: `1px solid ${isCrit ? '#ef4444' : isHigh ? '#f59e0b' : '#38bdf8'}`,
                      color: isCrit ? '#f87171' : isHigh ? '#fbbf24' : '#38bdf8',
                      fontFamily: '"JetBrains Mono", monospace'
                    }}>
                      {p.risk}
                    </span>
                  </div>

                  {/* Rendered Payload Code Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(0, 0, 0, 0.5)',
                    border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
                    borderRadius: 6,
                    padding: '8px 12px',
                    gap: 10
                  }}>
                    <code style={{
                      flex: 1,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 12,
                      color: 'var(--theme-accent, #00f0ff)',
                      wordBreak: 'break-all',
                      lineHeight: 1.5
                    }}>
                      {rendered}
                    </code>

                    <button
                      onClick={() => handleCopy(p.payload, p.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 5,
                        background: copiedId === p.id ? '#22c55e' : 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.12))',
                        color: copiedId === p.id ? '#070a13' : '#f8fafc',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {copiedId === p.id ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedId === p.id ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Tags */}
                  {p.tags && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {p.tags.map((t, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: 9,
                            padding: '1px 6px',
                            borderRadius: 3,
                            background: 'rgba(255, 255, 255, 0.04)',
                            color: '#64748b',
                            fontFamily: '"JetBrains Mono", monospace'
                          }}
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ToolWrapper>
  );
}
