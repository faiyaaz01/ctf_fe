import { useState, useEffect, useRef } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { 
  Search, ExternalLink, Copy, Check, Shield, Globe, 
  Terminal, Database, Lock, User, Hash, Mail, Server, RefreshCw
} from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function OsintWorkspace({ onSelectDestination }) {
  const [target, setTarget] = useState('tesla.com');
  const [selectedType, setSelectedType] = useState('auto');
  const [queryCrtSh, setQueryCrtSh] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subdomainsLoading, setSubdomainsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const [subdomainFilter, setSubdomainFilter] = useState('');
  const { addCandidate } = useFlagHunter();
  const debounceRef = useRef(null);

  const presets = [
    { label: 'Domain: tesla.com', val: 'tesla.com', type: 'domain' },
    { label: 'Cloudflare IP: 1.1.1.1', val: '1.1.1.1', type: 'ip' },
    { label: 'Email: security@target.org', val: 'security@target.org', type: 'email' },
    { label: 'SHA-1 Hash', val: 'e4d909c290d0fb1ca068ffaddf22cbd0add8abff', type: 'hash' },
    { label: 'Handle: mrrobot', val: 'mrrobot', type: 'username' }
  ];

  const typeOptions = [
    { id: 'auto', label: 'Auto Detect' },
    { id: 'domain', label: 'Domain' },
    { id: 'ip', label: 'IP Address' },
    { id: 'hash', label: 'File Hash' },
    { id: 'email', label: 'Email' },
    { id: 'username', label: 'Username' }
  ];

  const fetchOsint = (tgt = target, type = selectedType, fetchSub = queryCrtSh) => {
    if (!tgt || !tgt.trim()) {
      setResult(null);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    api.post('/tools/network/osint', { 
      target: tgt.trim(), 
      type: type, 
      queryCrtSh: fetchSub 
    })
      .then((res) => {
        if (res.data?.error) {
          setError(res.data.error);
          setResult(null);
        } else {
          setResult(res.data);
          setError('');
          if (res.data?.target && /flag\{|ctf\{|\{[^}]{4,}\}/i.test(res.data.target)) {
            addCandidate(res.data.target, 'OSINT Target');
          }
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Server OSINT generation failed.');
        setResult(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOsint(target, selectedType, queryCrtSh);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setTarget(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchOsint(val, selectedType, queryCrtSh);
    }, 300);
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    fetchOsint(target, type, queryCrtSh);
  };

  const handlePreset = (p) => {
    setTarget(p.val);
    setSelectedType(p.type);
    fetchOsint(p.val, p.type, queryCrtSh);
  };

  const handleFetchLiveSubdomains = () => {
    if (!result?.target) return;
    setSubdomainsLoading(true);
    api.post('/tools/network/osint/subdomains', { domain: result.target })
      .then((res) => {
        if (res.data?.subdomains) {
          setResult(prev => ({
            ...prev,
            subdomains: res.data.subdomains,
            subdomainsCount: res.data.subdomains.length
          }));
        }
      })
      .catch((err) => {
        console.error('Failed to fetch subdomains', err);
      })
      .finally(() => setSubdomainsLoading(false));
  };

  const copyVal = (k, v) => {
    if (!v) return;
    navigator.clipboard.writeText(String(v));
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const copyAllSubdomains = () => {
    if (!result?.subdomains?.length) return;
    navigator.clipboard.writeText(result.subdomains.join('\n'));
    setCopiedKey('all_subs');
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const filteredSubdomains = result?.subdomains?.filter(s => 
    s.toLowerCase().includes(subdomainFilter.toLowerCase())
  ) || [];

  return (
    <ToolWrapper
      title="OSINT Multi-Target Workspace"
      category="Network & OSINT"
      description="Server-side OSINT query compiler for Shodan, Censys, VirusTotal, crt.sh, Google Dorks, and threat intelligence aggregators."
      badge="Java Engine"
      outputValue={result ? result.target : ''}
      sourceToolId="osint-workspace"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Preset Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>CTF Targets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#38bdf8',
                borderRadius: 4,
                padding: '4px 10px',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'monospace'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Box & Type Selector */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Search size={16} color="#38bdf8" /> Target Identifier (Domain, IP, Hash, Email, or Username)
              </label>
              {loading && <span style={{ color: '#38bdf8', fontSize: 12 }}>Compiling OSINT queries...</span>}
            </div>

            <input
              type="text"
              value={target}
              onChange={handleInputChange}
              placeholder="e.g. example.com, 10.10.10.1, 8.8.8.8, e4d909c2..., admin@target.org"
              style={{
                width: '100%',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 6,
                padding: '10px 14px',
                fontSize: 15,
                color: '#f8fafc',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />

            {/* Type Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Target Type:</span>
              {typeOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleTypeSelect(opt.id)}
                  style={{
                    background: selectedType === opt.id ? '#0284c7' : '#1e293b',
                    border: '1px solid',
                    borderColor: selectedType === opt.id ? '#38bdf8' : '#334155',
                    color: selectedType === opt.id ? '#fff' : '#94a3b8',
                    borderRadius: 4,
                    padding: '3px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{ background: '#451a1a', border: '1px solid #991b1b', color: '#fca5a5', padding: '12px 16px', borderRadius: 6, fontSize: 13 }}>
            <strong>Server Error:</strong> {error}
          </div>
        )}

        {/* OSINT Results */}
        {result && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Header Status Bar */}
            <div style={{
              background: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Target:</span>
                <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700, fontSize: 15 }}>
                  {result.target}
                </span>
                <span style={{
                  background: '#0369a1',
                  color: '#e0f2fe',
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {result.detectedType}
                </span>
              </div>

              {result.detectedType === 'domain' && (
                <button
                  onClick={handleFetchLiveSubdomains}
                  disabled={subdomainsLoading}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #0ea5e9',
                    color: '#38bdf8',
                    padding: '5px 12px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: subdomainsLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <RefreshCw size={13} className={subdomainsLoading ? 'spin' : ''} />
                  {subdomainsLoading ? 'Scanning crt.sh...' : 'Fetch Live Subdomains (crt.sh)'}
                </button>
              )}
            </div>

            {/* Platform Direct Investigation Cards */}
            <div>
              <h4 style={{ margin: '0 0 12px', fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 700 }}>
                Targeted OSINT Platforms & Intelligence Engines
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                {result.platforms?.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: 8,
                      padding: 14,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 10
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: 14 }}>{p.provider}</span>
                        <span style={{ fontSize: 10, background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', padding: '1px 6px', borderRadius: 4 }}>
                          {p.category}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{p.description}</div>
                      <div style={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 4,
                        padding: '6px 8px',
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: '#cbd5e1',
                        wordBreak: 'break-all'
                      }}>
                        {p.query}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          flex: 1,
                          background: '#0284c7',
                          color: '#fff',
                          textDecoration: 'none',
                          padding: '6px 10px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6
                        }}
                      >
                        Launch <ExternalLink size={13} />
                      </a>
                      <button
                        onClick={() => copyVal(`query_${idx}`, p.query)}
                        style={{
                          background: '#1e293b',
                          border: '1px solid #334155',
                          color: copiedKey === `query_${idx}` ? '#4ade80' : '#94a3b8',
                          padding: '6px 10px',
                          borderRadius: 4,
                          cursor: 'pointer'
                        }}
                        title="Copy search query"
                      >
                        {copiedKey === `query_${idx}` ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Google Dorks Section (For Domains) */}
            {result.dorks?.length > 0 && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 18 }}>
                <h4 style={{ margin: '0 0 14px', fontSize: 14, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Terminal size={16} /> Targeted Google Dork Queries (Server Compiled)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.dorks.map((d, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 6,
                        padding: '10px 14px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>{d.title}</div>
                        <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#38bdf8', wordBreak: 'break-all' }}>{d.dork}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            background: '#0ea5e9',
                            color: '#fff',
                            textDecoration: 'none',
                            padding: '4px 10px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          Google <ExternalLink size={12} />
                        </a>
                        <button
                          onClick={() => copyVal(`dork_${idx}`, d.dork)}
                          style={{
                            background: '#0f172a',
                            border: '1px solid #334155',
                            color: copiedKey === `dork_${idx}` ? '#4ade80' : '#94a3b8',
                            padding: '4px 8px',
                            borderRadius: 4,
                            cursor: 'pointer'
                          }}
                          title="Copy dork string"
                        >
                          {copiedKey === `dork_${idx}` ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Subdomain Enumeration (crt.sh) */}
            {result.subdomains?.length > 0 && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                  <h4 style={{ margin: 0, fontSize: 14, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Globe size={16} /> Discovered Certificate Subdomains ({result.subdomains.length})
                  </h4>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="text"
                      placeholder="Filter subdomains..."
                      value={subdomainFilter}
                      onChange={(e) => setSubdomainFilter(e.target.value)}
                      style={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 4,
                        padding: '4px 8px',
                        fontSize: 12,
                        color: '#f8fafc',
                        fontFamily: 'monospace'
                      }}
                    />
                    <button
                      onClick={copyAllSubdomains}
                      style={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        color: copiedKey === 'all_subs' ? '#4ade80' : '#38bdf8',
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: 11,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {copiedKey === 'all_subs' ? <Check size={12} /> : <Copy size={12} />} Copy All
                    </button>
                  </div>
                </div>

                <div style={{
                  maxHeight: 250,
                  overflowY: 'auto',
                  background: '#090d16',
                  border: '1px solid #1e293b',
                  borderRadius: 6,
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  fontFamily: 'monospace',
                  fontSize: 12
                }}>
                  {filteredSubdomains.map((sub, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '3px 6px',
                        borderRadius: 4,
                        color: '#cbd5e1'
                      }}
                    >
                      <span>{sub}</span>
                      <button
                        onClick={() => copyVal(`sub_${idx}`, sub)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedKey === `sub_${idx}` ? '#4ade80' : '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedKey === `sub_${idx}` ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
