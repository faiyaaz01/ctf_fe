import { useState, useEffect, useRef } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Copy, Check, Network, Server, Globe, Cpu } from 'lucide-react';
import api from '../../services/api';
import { useFlagHunter } from '../../hooks/useFlagHunter';

export default function NetworkCalc({ onSelectDestination }) {
  const [ipInput, setIpInput] = useState('192.168.1.105/24');
  const [cidrSlider, setCidrSlider] = useState(24);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const { addCandidate } = useFlagHunter();
  const debounceRef = useRef(null);

  const presets = [
    { label: 'LAN /24', val: '192.168.1.105/24' },
    { label: 'HTB / THM /16', val: '10.10.10.1/16' },
    { label: 'AD Domain /20', val: '172.16.0.50/20' },
    { label: 'Cloud Host /32', val: '8.8.8.8/32' },
    { label: 'Point-to-Point /31', val: '10.0.0.0/31' },
    { label: 'IPv6 /64', val: '2001:db8::1/64' }
  ];

  const fetchCalculation = (rawInput) => {
    if (!rawInput || !rawInput.trim()) {
      setResult(null);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    api.post('/tools/network/calc', { ip: rawInput.trim() })
      .then((res) => {
        if (res.data?.error) {
          setError(res.data.error);
          setResult(null);
        } else {
          setResult(res.data);
          setError('');
          if (res.data.cidr !== undefined && res.data.version === 'IPv4') {
            setCidrSlider(res.data.cidr);
          }
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Server calculation failed.');
        setResult(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCalculation(ipInput);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setIpInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCalculation(val);
    }, 250);
  };

  const handleSliderChange = (e) => {
    const newCidr = parseInt(e.target.value, 10);
    setCidrSlider(newCidr);

    let baseIp = ipInput;
    if (baseIp.includes('/')) {
      baseIp = baseIp.split('/')[0];
    }
    const combined = `${baseIp}/${newCidr}`;
    setIpInput(combined);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCalculation(combined);
    }, 150);
  };

  const handlePreset = (val) => {
    setIpInput(val);
    fetchCalculation(val);
  };

  const copyVal = (k, v) => {
    if (!v) return;
    navigator.clipboard.writeText(String(v));
    setCopiedKey(k);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <ToolWrapper
      title="CIDR Subnet & Wildcard Calculator"
      category="Network & OSINT"
      description="Server-side IPv4 & IPv6 CIDR subnet calculator, wildcard generator, binary bitmask breakdown, and host range analyzer."
      badge="Java Engine"
      outputValue={result ? result.networkAddress : ''}
      sourceToolId="network-calc"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Preset Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>CTF Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p.val)}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#38bdf8',
                borderRadius: 4,
                padding: '4px 10px',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'monospace',
                transition: 'all 0.15s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input & CIDR Slider */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <span>IP Address & CIDR Prefix Notation</span>
              {loading && <span style={{ color: '#38bdf8', fontSize: 12 }}>Calculating on server...</span>}
            </label>
            <input
              type="text"
              value={ipInput}
              onChange={handleInputChange}
              placeholder="e.g. 192.168.1.105/24 or 2001:db8::1/64"
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

            {/* Slider (IPv4 only) */}
            {result?.version !== 'IPv6' && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>
                  <span>Subnet Mask Prefix: <strong>/{cidrSlider}</strong></span>
                  <span>Netmask: <strong>{result?.netmask || '255.255.255.0'}</strong></span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={cidrSlider}
                  onChange={handleSliderChange}
                  style={{ width: '100%', accentColor: '#0ea5e9', cursor: 'pointer' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{ background: '#451a1a', border: '1px solid #991b1b', color: '#fca5a5', padding: '12px 16px', borderRadius: 6, fontSize: 13 }}>
            <strong>Server Error:</strong> {error}
          </div>
        )}

        {/* Calculated Results (Server Computed) */}
        {result && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <StatCard
                title="Network Address"
                value={result.networkAddress}
                badge={result.version}
                copied={copiedKey === 'net'}
                onCopy={() => copyVal('net', result.networkAddress)}
              />
              <StatCard
                title="Broadcast Address"
                value={result.broadcastAddress || 'N/A (IPv6)'}
                copied={copiedKey === 'bcast'}
                onCopy={() => copyVal('bcast', result.broadcastAddress)}
              />
              <StatCard
                title="Subnet Mask"
                value={result.netmask || `/${result.cidr}`}
                copied={copiedKey === 'mask'}
                onCopy={() => copyVal('mask', result.netmask)}
              />
              <StatCard
                title="Wildcard Mask"
                value={result.wildcard || 'N/A'}
                copied={copiedKey === 'wild'}
                onCopy={() => copyVal('wild', result.wildcard)}
              />
              <StatCard
                title="Usable Host Range"
                value={result.usableHostRange || result.networkAddress}
                highlight
                copied={copiedKey === 'range'}
                onCopy={() => copyVal('range', result.usableHostRange)}
              />
              <StatCard
                title="Total / Usable Hosts"
                value={`${result.totalHosts?.toLocaleString()} total / ${result.usableHosts?.toLocaleString()} usable`}
              />
              <StatCard
                title="IP Scope / Type"
                value={result.ipType}
              />
              {result.ipClass && (
                <StatCard
                  title="IP Class"
                  value={result.ipClass}
                />
              )}
            </div>

            {/* Binary Bit breakdown (IPv4) */}
            {result.binaryIp && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 18 }}>
                <h4 style={{ margin: '0 0 14px', fontSize: 14, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Cpu size={16} /> 32-Bit Binary Bitmask Analysis (Server Computed)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'monospace', fontSize: 13 }}>
                  <BinaryRow label="Input IP" bin={result.binaryIp} />
                  <BinaryRow label="Subnet Mask" bin={result.binaryNetmask} color="#38bdf8" />
                  <BinaryRow label="Network ID" bin={result.binaryNetwork} color="#4ade80" />
                  <BinaryRow label="Broadcast" bin={result.binaryBroadcast} color="#f87171" />
                </div>
              </div>
            )}

            {/* Radix Formats */}
            {result.ipInteger && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
                <h4 style={{ margin: '0 0 12px', fontSize: 13, color: '#94a3b8' }}>Alternative Radix Encodings</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                  <CopyPill label="Decimal (Int)" val={result.ipInteger} onCopy={() => copyVal('int', result.ipInteger)} copied={copiedKey === 'int'} />
                  <CopyPill label="Hexadecimal" val={result.ipHex} onCopy={() => copyVal('hex', result.ipHex)} copied={copiedKey === 'hex'} />
                  <CopyPill label="Mask Hex" val={result.netmaskHex} onCopy={() => copyVal('maskhex', result.netmaskHex)} copied={copiedKey === 'maskhex'} />
                </div>
              </div>
            )}

            {/* Next Subnet Splits */}
            {result.splitSubnets && (
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, padding: 16 }}>
                <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#94a3b8' }}>
                  Subnet Partitioning (Split into two /{result.cidr + 1} subnets)
                </h4>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {result.splitSubnets.map((sub, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 6,
                        padding: '8px 14px',
                        fontSize: 12,
                        fontFamily: 'monospace'
                      }}
                    >
                      <div style={{ color: '#38bdf8', fontWeight: 700 }}>{sub.subnet}</div>
                      <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>{sub.range}</div>
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

function StatCard({ title, value, badge, highlight, copied, onCopy }) {
  return (
    <div
      style={{
        background: highlight ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : '#0f172a',
        border: highlight ? '1px solid #0284c7' : '1px solid #1e293b',
        borderRadius: 8,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600 }}>
          {title}
        </span>
        {badge && (
          <span style={{ fontSize: 10, background: '#0369a1', color: '#e0f2fe', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 14, color: highlight ? '#38bdf8' : '#f8fafc', fontWeight: 700, fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {value}
        </span>
        {onCopy && (
          <button
            onClick={onCopy}
            style={{
              background: 'transparent',
              border: 'none',
              color: copied ? '#4ade80' : '#64748b',
              cursor: 'pointer',
              padding: 4
            }}
            title="Copy value"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}

function BinaryRow({ label, bin, color = '#f8fafc' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
      <span style={{ color: '#94a3b8', minWidth: 120 }}>{label}:</span>
      <span style={{ color: color, letterSpacing: '1px', background: '#1e293b', padding: '3px 8px', borderRadius: 4 }}>
        {bin}
      </span>
    </div>
  );
}

function CopyPill({ label, val, onCopy, copied }) {
  return (
    <div
      onClick={onCopy}
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 6,
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        fontFamily: 'monospace',
        fontSize: 12
      }}
    >
      <div>
        <div style={{ fontSize: 10, color: '#94a3b8', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ color: '#f8fafc', fontWeight: 600, marginTop: 2 }}>{val}</div>
      </div>
      <span style={{ color: copied ? '#4ade80' : '#64748b' }}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </span>
    </div>
  );
}
