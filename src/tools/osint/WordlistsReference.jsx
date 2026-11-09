import { useState, useEffect, useRef } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { 
  FileText, Terminal, Copy, Check, ExternalLink, Download, 
  Search, Filter, Key, Globe, Shield, Database, User, Cpu
} from 'lucide-react';
import api from '../../services/api';

export default function WordlistsReference({ onSelectDestination }) {
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [target, setTarget] = useState('http://target.htb');
  const [wordlists, setWordlists] = useState([]);
  const [selectedWordlist, setSelectedWordlist] = useState(null);
  const [commandData, setCommandData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [commandsLoading, setCommandsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const debounceRef = useRef(null);

  const categories = [
    { id: 'all', label: 'All Wordlists' },
    { id: 'passwords', label: 'Passwords & Hashes' },
    { id: 'discovery', label: 'Web Directories' },
    { id: 'subdomains', label: 'Subdomains & DNS' },
    { id: 'fuzzing', label: 'Fuzzing & Exploits' },
    { id: 'api', label: 'APIs & Parameters' },
    { id: 'usernames', label: 'Usernames' }
  ];

  // Fetch wordlists catalog from backend
  const fetchCatalog = (cat = category, q = searchQuery) => {
    setLoading(true);
    api.get(`/tools/network/wordlists?category=${cat}&query=${encodeURIComponent(q)}`)
      .then((res) => {
        if (res.data?.wordlists) {
          setWordlists(res.data.wordlists);
          // If none selected, or selected was filtered out, select first
          if (!selectedWordlist || !res.data.wordlists.some(w => w.id === selectedWordlist.id)) {
            if (res.data.wordlists.length > 0) {
              selectWordlist(res.data.wordlists[0], target);
            } else {
              setSelectedWordlist(null);
              setCommandData(null);
            }
          }
        }
      })
      .catch((err) => {
        console.error('Failed to fetch wordlists from server', err);
      })
      .finally(() => setLoading(false));
  };

  // Generate commands on backend for the selected wordlist & target
  const selectWordlist = (wl, tgt = target) => {
    setSelectedWordlist(wl);
    setCommandsLoading(true);
    api.post('/tools/network/wordlists/commands', {
      wordlistId: wl.id,
      target: tgt
    })
      .then((res) => {
        if (res.data) {
          setCommandData(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to generate commands', err);
      })
      .finally(() => setCommandsLoading(false));
  };

  useEffect(() => {
    fetchCatalog(category, searchQuery);
  }, [category]);

  const handleSearchChange = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCatalog(category, q);
    }, 250);
  };

  const handleTargetChange = (e) => {
    const val = e.target.value;
    setTarget(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (selectedWordlist) {
        selectWordlist(selectedWordlist, val);
      }
    }, 300);
  };

  const copyVal = (k, v) => {
    if (!v) return;
    navigator.clipboard.writeText(String(v));
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const getCategoryBadgeColor = (cat) => {
    switch (cat) {
      case 'passwords': return { bg: '#451a03', color: '#fb923c', border: '#78350f' };
      case 'discovery': return { bg: '#064e3b', color: '#34d399', border: '#065f46' };
      case 'subdomains': return { bg: '#082f49', color: '#38bdf8', border: '#0369a1' };
      case 'fuzzing': return { bg: '#4c0519', color: '#fb7185', border: '#881337' };
      case 'api': return { bg: '#3b0764', color: '#c084fc', border: '#581c87' };
      case 'usernames': return { bg: '#172554', color: '#60a5fa', border: '#1e3a8a' };
      default: return { bg: '#1e293b', color: '#94a3b8', border: '#334155' };
    }
  };

  return (
    <ToolWrapper
      title="CTF Wordlists & Command Generator"
      category="Network & OSINT"
      description="Server-backed curated penetration testing wordlists, SecLists catalog, Kali Linux system paths, and dynamic ffuf / gobuster command compiler."
      badge="Java Engine"
      outputValue={selectedWordlist ? selectedWordlist.kaliPath : ''}
      sourceToolId="wordlists-ref"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Target Configuration Bar */}
        <div style={{
          background: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: 8,
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
            <Terminal size={18} color="#38bdf8" />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>Target Host / URL:</span>
            <input
              type="text"
              value={target}
              onChange={handleTargetChange}
              placeholder="e.g. http://10.10.10.10 or http://target.htb"
              style={{
                flex: 1,
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 4,
                padding: '6px 12px',
                fontSize: 13,
                fontFamily: 'monospace',
                color: '#38bdf8',
                outline: 'none'
              }}
            />
          </div>
          <span style={{ fontSize: 11, color: '#64748b' }}>Commands recompile dynamically on backend</span>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search wordlists by name, description, or tags (e.g. rockyou, medium, sqli, api)..."
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 6,
                padding: '10px 14px 10px 38px',
                fontSize: 13,
                color: '#f8fafc',
                outline: 'none'
              }}
            />
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                style={{
                  background: category === c.id ? '#0284c7' : '#1e293b',
                  border: '1px solid',
                  borderColor: category === c.id ? '#38bdf8' : '#334155',
                  color: category === c.id ? '#fff' : '#94a3b8',
                  borderRadius: 4,
                  padding: '4px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Wordlists Grid + Command Generator Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(360px, 1.5fr)', gap: 16 }}>
          {/* Left: Wordlists List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 600, overflowY: 'auto' }}>
            {loading && <div style={{ color: '#38bdf8', fontSize: 13, padding: 10 }}>Loading wordlists...</div>}
            {!loading && wordlists.length === 0 && (
              <div style={{ color: '#64748b', fontSize: 13, padding: 20, textAlign: 'center' }}>
                No wordlists found matching your search.
              </div>
            )}
            {wordlists.map((wl) => {
              const isSelected = selectedWordlist?.id === wl.id;
              const badge = getCategoryBadgeColor(wl.category);

              return (
                <div
                  key={wl.id}
                  onClick={() => selectWordlist(wl, target)}
                  style={{
                    background: isSelected ? '#172554' : '#0f172a',
                    border: '1px solid',
                    borderColor: isSelected ? '#38bdf8' : '#1e293b',
                    borderRadius: 6,
                    padding: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                      {wl.name}
                    </span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      padding: '1px 6px',
                      borderRadius: 4
                    }}>
                      {wl.category}
                    </span>
                  </div>

                  <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
                    {wl.description}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 11, color: '#64748b' }}>
                    <span><strong>{wl.linesCount}</strong> lines • {wl.fileSize}</span>
                    <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontSize: 10 }}>
                      {isSelected ? '● ACTIVE' : 'Click to compile'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Compiled Commands Panel for Selected Wordlist */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {selectedWordlist ? (
              <>
                {/* Wordlist Details Header */}
                <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <h4 style={{ margin: 0, fontSize: 15, color: '#38bdf8', fontWeight: 700 }}>
                      {selectedWordlist.name}
                    </h4>
                    <a
                      href={selectedWordlist.rawUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#0284c7',
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
                      <Download size={12} /> Raw Download
                    </a>
                  </div>

                  {/* Kali Path Bar */}
                  <div style={{
                    background: '#090d16',
                    border: '1px solid #1e293b',
                    borderRadius: 4,
                    padding: '6px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    marginTop: 8
                  }}>
                    <span style={{ color: '#4ade80', wordBreak: 'break-all' }}>{selectedWordlist.kaliPath}</span>
                    <button
                      onClick={() => copyVal('kalipath', selectedWordlist.kaliPath)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedKey === 'kalipath' ? '#4ade80' : '#64748b',
                        cursor: 'pointer',
                        padding: 2
                      }}
                      title="Copy Kali path"
                    >
                      {copiedKey === 'kalipath' ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                {/* Compiled Commands Section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      Ready-to-Run Terminal Commands
                    </span>
                    {commandsLoading && <span style={{ fontSize: 11, color: '#38bdf8' }}>Compiling...</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 420, overflowY: 'auto' }}>
                    {commandData?.commands && Object.entries(commandData.commands).map(([toolName, cmd], idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: 6,
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{toolName}</span>
                          <button
                            onClick={() => copyVal(`cmd_${idx}`, cmd)}
                            style={{
                              background: copiedKey === `cmd_${idx}` ? '#065f46' : '#0f172a',
                              border: '1px solid #334155',
                              color: copiedKey === `cmd_${idx}` ? '#34d399' : '#38bdf8',
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                          >
                            {copiedKey === `cmd_${idx}` ? <Check size={12} /> : <Copy size={12} />}
                            {copiedKey === `cmd_${idx}` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <div style={{
                          background: '#090d16',
                          border: '1px solid #1e293b',
                          borderRadius: 4,
                          padding: '6px 8px',
                          fontFamily: 'monospace',
                          fontSize: 11,
                          color: '#38bdf8',
                          wordBreak: 'break-all',
                          lineHeight: 1.4
                        }}>
                          {cmd}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: '#64748b', fontSize: 13, textAlign: 'center', margin: 'auto' }}>
                Select a wordlist from the left to view Kali paths and generated terminal commands.
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolWrapper>
  );
}
