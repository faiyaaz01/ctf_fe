import { useState } from 'react';
import ToolWrapper from '../../components/common/ToolWrapper';
import { Play } from 'lucide-react';
import api from '../../services/api';

export default function PaddingOracleSim({ onSelectDestination }) {
  const [cipherHex, setCipherHex] = useState('5b5501ff456e354e12cdfe331456a908');
  const [blockIndex, setBlockIndex] = useState(0);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const testOracle = () => {
    if (!cipherHex.trim()) return;
    setLoading(true);
    api.post('/tools/crypto/padding-oracle', {
      cipherHex,
      blockIndex: String(blockIndex)
    })
      .then((res) => {
        setResponse(res.data);
      })
      .catch(() => setResponse(null))
      .finally(() => setLoading(false));
  };

  return (
    <ToolWrapper
      title="Padding Oracle Simulator"
      category="Cryptography"
      description="Simulated PKCS#7 CBC padding oracle validation endpoint for interactive byte-by-byte decryption testing."
      badge="Java Engine"
      outputValue={response ? response.status : ''}
      sourceToolId="padding-oracle"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Ciphertext Block (Hex)</label>
          <input
            type="text"
            value={cipherHex}
            onChange={(e) => setCipherHex(e.target.value)}
            placeholder="16-byte hex block..."
            style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: 13 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Block Index:</span>
            <input
              type="number"
              min={0}
              max={15}
              value={blockIndex}
              onChange={(e) => setBlockIndex(parseInt(e.target.value) || 0)}
              style={{ width: 60, padding: '6px 10px', borderRadius: 6, border: '1px solid #334155', background: '#0f172a', color: '#38bdf8', fontWeight: 700, textAlign: 'center' }}
            />
          </div>

          <button
            onClick={testOracle}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 6,
              background: '#38bdf8',
              color: '#0f172a',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <Play size={14} />
            {loading ? 'Querying Oracle...' : 'Test Padding Oracle'}
          </button>
        </div>

        {response && (
          <div style={{ background: '#0b111e', border: '1px solid #1e293b', borderRadius: 6, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>{response.status.toUpperCase()}</span>
              <span style={{ fontSize: 12, color: '#64748b' }}>Block: {response.block}</span>
            </div>
            <div style={{ color: '#38bdf8', fontSize: 13, fontFamily: 'monospace', marginBottom: 4 }}>
              {response.mode}
            </div>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>
              {response.description}
            </p>
          </div>
        )}
      </div>
    </ToolWrapper>
  );
}
