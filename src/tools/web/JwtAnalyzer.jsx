import { useState, useEffect } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { 
  Key, Shield, AlertTriangle, CheckCircle, XCircle, 
  Copy, Check, Zap, RefreshCw, Lock, Unlock, Play, ArrowRight 
} from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function JwtAnalyzer({ onSelectDestination }) {
  const [activeTab, setActiveTab] = useState('inspect'); // 'inspect', 'forge', 'crack'
  const [tokenInput, setTokenInput] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM3IiwidXNlcm5hbWUiOiJndWVzdCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.s_p0qM91gW9j7kEeV1M9-b6GfZjIuR21E1uU8vM-qQ8'
  );
  const [secretInput, setSecretInput] = useState('secret');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);
  const { addCandidate } = useFlagHunter();

  // Tamper & Forge states
  const [forgeHeader, setForgeHeader] = useState('{\n  "alg": "none",\n  "typ": "JWT"\n}');
  const [forgePayload, setForgePayload] = useState('{\n  "sub": "1337",\n  "username": "admin",\n  "role": "admin",\n  "admin": true\n}');
  const [forgeAlg, setForgeAlg] = useState('none');
  const [forgeSecret, setForgeSecret] = useState('');
  const [forgedToken, setForgedToken] = useState('');
  const [forgeLoading, setForgeLoading] = useState(false);

  // Brute-force state
  const [crackCustomWords, setCrackCustomWords] = useState('');
  const [crackResult, setCrackResult] = useState(null);
  const [crackLoading, setCrackLoading] = useState(false);

  const presets = [
    {
      label: 'Standard HS256 Token',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMzM3IiwidXNlcm5hbWUiOiJndWVzdCIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.s_p0qM91gW9j7kEeV1M9-b6GfZjIuR21E1uU8vM-qQ8',
      secret: 'secret'
    },
    {
      label: 'Vulnerable "none" Alg',
      token: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJyb290Iiwicm9sZSI6ImFkbWluIiwiZmxhZyI6ImN0Zntqd3Rfbm9uZV9hbGdfZXhwbG9pdGVkfSJ9.',
      secret: ''
    },
    {
      label: 'Expired Session Token',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0MiIsInVzZXIiOiJvcGVyYXRvciIsImV4cCI6MTUxNDc2NDgwMH0.1xQ4q6N56_eYk1u7_s8U3L8bW1Zz-e2P8q0L5K3M2Q8',
      secret: 'password'
    }
  ];

  // Run analysis whenever token or secret changes
  const runAnalysis = (t = tokenInput, s = secretInput) => {
    if (!t || !t.trim()) {
      setAnalysis(null);
      setError('');
      return;
    }
    setLoading(true);
    setError('');

    api.post('/tools/web/jwt/analyze', { token: t.trim(), secret: s })
      .then((res) => {
        if (res.data?.error) {
          setError(res.data.error);
          setAnalysis(null);
        } else {
          setAnalysis(res.data);
          setError('');
          // Auto-load into forge view
          if (res.data.headerJson) setForgeHeader(res.data.headerJson);
          if (res.data.payloadJson) setForgePayload(res.data.payloadJson);

          // Check if payload contains a CTF flag
          if (res.data.payloadJson && /flag\{|ctf\{/i.test(res.data.payloadJson)) {
            const match = res.data.payloadJson.match(/(?:flag|ctf)\{[^}]+\}/i);
            if (match) addCandidate(match[0], 'JWT Analyzer Claim');
          }
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || err.message || 'Analysis request failed');
        setAnalysis(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleForge = () => {
    setForgeLoading(true);
    api.post('/tools/web/jwt/forge', {
      headerJson: forgeHeader,
      payloadJson: forgePayload,
      algorithm: forgeAlg,
      secret: forgeSecret
    })
      .then((res) => {
        if (res.data?.token) {
          setForgedToken(res.data.token);
        } else if (res.data?.error) {
          alert('Forge Error: ' + res.data.error);
        }
      })
      .catch((err) => alert('Forge failed: ' + (err.response?.data?.error || err.message)))
      .finally(() => setForgeLoading(false));
  };

  const handleCrack = () => {
    setCrackLoading(true);
    setCrackResult(null);

    const customList = crackCustomWords
      .split('\n')
      .map((w) => w.trim())
      .filter(Boolean);

    api.post('/tools/web/jwt/crack', {
      token: tokenInput.trim(),
      customWordlist: customList
    })
      .then((res) => {
        setCrackResult(res.data);
      })
      .catch((err) => {
        setCrackResult({ error: err.response?.data?.error || err.message });
      })
      .finally(() => setCrackLoading(false));
  };

  // Quick tamper helpers
  const applyAdminExploit = () => {
    try {
      const p = JSON.parse(forgePayload);
      p.role = 'admin';
      p.isAdmin = true;
      p.admin = true;
      setForgePayload(JSON.stringify(p, null, 2));
    } catch (_) {}
  };

  const applyNoneAlgExploit = () => {
    try {
      const h = JSON.parse(forgeHeader);
      h.alg = 'none';
      setForgeHeader(JSON.stringify(h, null, 2));
      setForgeAlg('none');
    } catch (_) {}
  };

  const applyExtendExpiry = () => {
    try {
      const p = JSON.parse(forgePayload);
      p.exp = Math.floor(Date.now() / 1000) + (10 * 365 * 86400); // +10 years
      setForgePayload(JSON.stringify(p, null, 2));
    } catch (_) {}
  };

  return (
    <ToolWrapper
      title="JWT Token Analyzer & Exploit Lab"
      description="Token structure inspector, claim decoder, security vulnerability auditor, 'none' algorithm exploit generator, and server-side HMAC secret dictionary brute-forcer."
      badge="Java Engine"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Presets Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#64748b', fontFamily: '"JetBrains Mono", monospace' }}>
            PRESETS:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTokenInput(p.token);
                setSecretInput(p.secret);
                runAnalysis(p.token, p.secret);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 5,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
                color: '#cbd5e1',
                fontSize: 11,
                fontFamily: '"JetBrains Mono", monospace',
                cursor: 'pointer'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Mode Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: 6,
          background: 'rgba(0, 0, 0, 0.35)',
          padding: 4,
          borderRadius: 8,
          border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))'
        }}>
          <button
            onClick={() => setActiveTab('inspect')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 6,
              background: activeTab === 'inspect' ? 'var(--theme-glow, rgba(0, 240, 255, 0.15))' : 'transparent',
              border: activeTab === 'inspect' ? '1px solid var(--theme-accent, #00f0ff)' : '1px solid transparent',
              color: activeTab === 'inspect' ? 'var(--theme-accent, #00f0ff)' : '#94a3b8',
              fontWeight: activeTab === 'inspect' ? 700 : 500,
              fontSize: 12,
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Shield size={14} />
            <span>1. Inspect & Verify</span>
          </button>

          <button
            onClick={() => setActiveTab('forge')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 6,
              background: activeTab === 'forge' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
              border: activeTab === 'forge' ? '1px solid #ef4444' : '1px solid transparent',
              color: activeTab === 'forge' ? '#f87171' : '#94a3b8',
              fontWeight: activeTab === 'forge' ? 700 : 500,
              fontSize: 12,
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Zap size={14} />
            <span>2. Tamper & Forge ("none" Exploit)</span>
          </button>

          <button
            onClick={() => setActiveTab('crack')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 6,
              background: activeTab === 'crack' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              border: activeTab === 'crack' ? '1px solid #f59e0b' : '1px solid transparent',
              color: activeTab === 'crack' ? '#fbbf24' : '#94a3b8',
              fontWeight: activeTab === 'crack' ? 700 : 500,
              fontSize: 12,
              fontFamily: '"JetBrains Mono", monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Key size={14} />
            <span>3. Brute-Force Secret</span>
          </button>
        </div>

        {/* ── TAB 1: INSPECT & VERIFY ── */}
        {activeTab === 'inspect' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Input & Secret row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                RAW JWT TOKEN:
              </label>
              <textarea
                rows={3}
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  runAnalysis(e.target.value, secretInput);
                }}
                placeholder="Paste JWT string (header.payload.signature)..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 6,
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.12))',
                  color: '#f8fafc',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260 }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace', whiteSpace: 'nowrap' }}>
                  HMAC SECRET (Optional):
                </span>
                <input
                  type="text"
                  value={secretInput}
                  onChange={(e) => {
                    setSecretInput(e.target.value);
                    runAnalysis(tokenInput, e.target.value);
                  }}
                  placeholder="e.g. secret, password..."
                  style={{
                    flex: 1,
                    padding: '8px 12px',
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

              <button
                onClick={() => runAnalysis(tokenInput, secretInput)}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  background: 'var(--theme-glow, rgba(0, 240, 255, 0.15))',
                  border: '1px solid var(--theme-accent, #00f0ff)',
                  color: 'var(--theme-accent, #00f0ff)',
                  fontSize: 12,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                <span>Verify & Parse</span>
              </button>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 6,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                color: '#f87171',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <XCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            {analysis && (
              <>
                {/* Security Findings Banner */}
                {analysis.findings && analysis.findings.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {analysis.findings.map((f, i) => {
                      const isCrit = f.level === 'CRITICAL';
                      const isWarn = f.level === 'WARNING';
                      return (
                        <div
                          key={i}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 6,
                            background: isCrit
                              ? 'rgba(239, 68, 68, 0.15)'
                              : isWarn ? 'rgba(245, 158, 11, 0.12)' : 'rgba(56, 189, 248, 0.1)',
                            border: `1px solid ${isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#38bdf8'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10
                          }}
                        >
                          {isCrit ? <AlertTriangle size={16} color="#ef4444" /> : <Shield size={16} color={isWarn ? '#f59e0b' : '#38bdf8'} />}
                          <div style={{ flex: 1 }}>
                            <span style={{
                              fontWeight: 800,
                              fontSize: 12,
                              color: isCrit ? '#f87171' : isWarn ? '#fbbf24' : '#38bdf8',
                              marginRight: 8
                            }}>
                              [{f.level}] {f.title}:
                            </span>
                            <span style={{ fontSize: 12, color: '#e2e8f0' }}>{f.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Signature Verification Status Pill */}
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 6,
                  background: analysis.signatureVerified === true
                    ? 'rgba(34, 197, 94, 0.12)'
                    : analysis.signatureVerified === false ? 'rgba(239, 68, 68, 0.12)' : 'rgba(148, 163, 184, 0.1)',
                  border: `1px solid ${
                    analysis.signatureVerified === true
                      ? '#22c55e'
                      : analysis.signatureVerified === false ? '#ef4444' : '#64748b'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 10
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {analysis.signatureVerified === true ? (
                      <CheckCircle size={18} color="#22c55e" />
                    ) : analysis.signatureVerified === false ? (
                      <XCircle size={18} color="#ef4444" />
                    ) : (
                      <Lock size={18} color="#94a3b8" />
                    )}
                    <div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: analysis.signatureVerified === true
                          ? '#22c55e'
                          : analysis.signatureVerified === false ? '#f87171' : '#cbd5e1'
                      }}>
                        {analysis.signatureVerified === true
                          ? 'Signature Verified (Valid Secret)'
                          : analysis.signatureVerified === false
                            ? 'Invalid Signature (Incorrect Secret or Modified Payload)'
                            : 'Signature Unchecked (Provide HMAC secret to verify)'}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                        Algorithm: <code>{analysis.algorithm}</code> | Signature length: {analysis.signatureRaw?.length || 0} chars
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('forge');
                      setForgeAlg(analysis.algorithm || 'none');
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 5,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.15))',
                      color: '#f8fafc',
                      fontSize: 11,
                      fontFamily: '"JetBrains Mono", monospace',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <span>Load into Forge Lab</span>
                    <ArrowRight size={12} />
                  </button>
                </div>

                {/* Color-Coded Header & Payload Side-by-Side */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: 16
                }}>
                  {/* Header Box (Red/Pink) */}
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.04)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 8,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#f87171', fontFamily: '"JetBrains Mono", monospace' }}>
                        HEADER (ALGORITHM & TOKEN TYPE)
                      </span>
                      <button
                        onClick={() => handleCopy(analysis.headerJson, 'header')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedKey === 'header' ? '#22c55e' : '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 10
                        }}
                      >
                        {copiedKey === 'header' ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedKey === 'header' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre style={{
                      margin: 0,
                      color: '#fca5a5',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 12,
                      lineHeight: 1.5,
                      overflowX: 'auto'
                    }}>
                      {analysis.headerJson}
                    </pre>
                  </div>

                  {/* Payload Box (Purple/Blue) */}
                  <div style={{
                    background: 'rgba(168, 85, 247, 0.04)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    borderRadius: 8,
                    padding: 14,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#c084fc', fontFamily: '"JetBrains Mono", monospace' }}>
                        PAYLOAD (DATA CLAIMS)
                      </span>
                      <button
                        onClick={() => handleCopy(analysis.payloadJson, 'payload')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: copiedKey === 'payload' ? '#22c55e' : '#94a3b8',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 10
                        }}
                      >
                        {copiedKey === 'payload' ? <Check size={11} /> : <Copy size={11} />}
                        <span>{copiedKey === 'payload' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre style={{
                      margin: 0,
                      color: '#d8b4fe',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 12,
                      lineHeight: 1.5,
                      overflowX: 'auto'
                    }}>
                      {analysis.payloadJson}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── TAB 2: TAMPER & FORGE ── */}
        {activeTab === 'forge' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Quick Action Tamper Buttons */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace', marginBottom: 8 }}>
                1-CLICK CTF EXPLOIT PRESETS:
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={applyAdminExploit}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 5,
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid #ef4444',
                    color: '#f87171',
                    fontSize: 11,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  👑 Set "role": "admin"
                </button>
                <button
                  onClick={applyNoneAlgExploit}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 5,
                    background: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid #f59e0b',
                    color: '#fbbf24',
                    fontSize: 11,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🔓 Force "alg": "none" (Strip Signature)
                </button>
                <button
                  onClick={applyExtendExpiry}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 5,
                    background: 'rgba(56, 189, 248, 0.15)',
                    border: '1px solid #38bdf8',
                    color: '#38bdf8',
                    fontSize: 11,
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⏳ Extend Expiry (+10 Years)
                </button>
              </div>
            </div>

            {/* Editable JSON Editors */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 16
            }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#f87171', fontFamily: '"JetBrains Mono", monospace' }}>
                  EDIT HEADER JSON:
                </label>
                <textarea
                  rows={8}
                  value={forgeHeader}
                  onChange={(e) => setForgeHeader(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    lineHeight: 1.5,
                    outline: 'none',
                    marginTop: 6
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#c084fc', fontFamily: '"JetBrains Mono", monospace' }}>
                  EDIT PAYLOAD JSON:
                </label>
                <textarea
                  rows={8}
                  value={forgePayload}
                  onChange={(e) => setForgePayload(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 6,
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    color: '#d8b4fe',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    lineHeight: 1.5,
                    outline: 'none',
                    marginTop: 6
                  }}
                />
              </div>
            </div>

            {/* Signing options */}
            <div style={{
              display: 'flex',
              gap: 12,
              alignItems: 'center',
              flexWrap: 'wrap',
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '12px 16px',
              borderRadius: 8,
              border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                  ALGORITHM:
                </span>
                <select
                  value={forgeAlg}
                  onChange={(e) => setForgeAlg(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 5,
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.15))',
                    color: '#f8fafc',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    outline: 'none'
                  }}
                >
                  <option value="none">none (Unsigned Exploit)</option>
                  <option value="HS256">HS256 (HMAC-SHA256)</option>
                  <option value="HS384">HS384 (HMAC-SHA384)</option>
                  <option value="HS512">HS512 (HMAC-SHA512)</option>
                </select>
              </div>

              {forgeAlg !== 'none' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 }}>
                  <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                    SECRET KEY:
                  </span>
                  <input
                    type="text"
                    value={forgeSecret}
                    onChange={(e) => setForgeSecret(e.target.value)}
                    placeholder="Key to sign token..."
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: 5,
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.12))',
                      color: '#f8fafc',
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 12,
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              <button
                onClick={handleForge}
                disabled={forgeLoading}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  color: '#f87171',
                  fontWeight: 800,
                  fontSize: 12,
                  fontFamily: '"JetBrains Mono", monospace',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Zap size={13} />
                <span>Forge Token Now</span>
              </button>
            </div>

            {/* Generated Forged Token Box */}
            {forgedToken && (
              <div style={{
                background: 'rgba(0, 255, 157, 0.05)',
                border: '1px solid #00ff9d',
                borderRadius: 8,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#00ff9d', fontFamily: '"JetBrains Mono", monospace' }}>
                    SUCCESSFULLY FORGED TOKEN:
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        setTokenInput(forgedToken);
                        setSecretInput(forgeSecret);
                        setActiveTab('inspect');
                        runAnalysis(forgedToken, forgeSecret);
                      }}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#f8fafc',
                        fontSize: 10,
                        cursor: 'pointer'
                      }}
                    >
                      Inspect in Tab 1
                    </button>
                    <button
                      onClick={() => handleCopy(forgedToken, 'forged')}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 4,
                        background: '#00ff9d',
                        border: 'none',
                        color: '#070a13',
                        fontSize: 10,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      {copiedKey === 'forged' ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedKey === 'forged' ? 'Copied!' : 'Copy Token'}</span>
                    </button>
                  </div>
                </div>
                <div style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                  color: '#e2e8f0',
                  wordBreak: 'break-all',
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: 10,
                  borderRadius: 6
                }}>
                  {forgedToken}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: BRUTE-FORCE SECRET ── */}
        {activeTab === 'crack' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
              borderRadius: 8,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>
                  HMAC-SHA256 Dictionary Secret Cracker
                </span>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  Tests signatures against top 25 built-in common CTF secrets (<code>secret</code>, <code>password</code>, <code>admin</code>, <code>jwt</code>, etc.) plus any custom wordlist supplied below.
                </p>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                  ADDITIONAL CUSTOM WORDLIST (1 per line):
                </label>
                <textarea
                  rows={4}
                  value={crackCustomWords}
                  onChange={(e) => setCrackCustomWords(e.target.value)}
                  placeholder="custom_secret_1&#10;company_name&#10;ctf2026..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.12))',
                    color: '#f8fafc',
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: 12,
                    outline: 'none',
                    marginTop: 6
                  }}
                />
              </div>

              <button
                onClick={handleCrack}
                disabled={crackLoading}
                style={{
                  alignSelf: 'flex-start',
                  padding: '8px 18px',
                  borderRadius: 6,
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid #f59e0b',
                  color: '#fbbf24',
                  fontWeight: 800,
                  fontSize: 12,
                  fontFamily: '"JetBrains Mono", monospace',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Play size={13} />
                <span>{crackLoading ? 'Brute-Forcing Signatures...' : 'Launch Dictionary Attack'}</span>
              </button>
            </div>

            {/* Crack Output */}
            {crackResult && (
              <div style={{
                padding: '16px 20px',
                borderRadius: 8,
                background: crackResult.found ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${crackResult.found ? '#22c55e' : '#ef4444'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: crackResult.found ? '#22c55e' : '#f87171'
                  }}>
                    {crackResult.found ? '🎉 SECRET KEY CRACKED!' : '[-] Attack Finished: Secret Not Found'}
                  </div>
                  {crackResult.found ? (
                    <div style={{ fontSize: 13, color: '#e2e8f0', marginTop: 4, fontFamily: '"JetBrains Mono", monospace' }}>
                      Secret: <code style={{ color: '#22c55e', fontSize: 14, fontWeight: 700 }}>{crackResult.secret}</code> (found in {crackResult.attempts} attempts)
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                      Tested {crackResult.attempts} words. Add more words to the custom list above.
                    </div>
                  )}
                </div>

                {crackResult.found && (
                  <button
                    onClick={() => {
                      setSecretInput(crackResult.secret);
                      setActiveTab('inspect');
                      runAnalysis(tokenInput, crackResult.secret);
                    }}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 6,
                      background: '#22c55e',
                      border: 'none',
                      color: '#070a13',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Apply Secret to Inspector
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
