export default function HexViewer({ data = '', bytesPerRow = 16 }) {
  if (!data) return <div style={{ color: '#64748b', fontSize: 12 }}>No binary data</div>;

  const hexBytes = [];
  const asciiChars = [];

  for (let i = 0; i < data.length; i++) {
    const code = data.charCodeAt(i);
    hexBytes.push(code.toString(16).padStart(2, '0').toUpperCase());
    asciiChars.push(code >= 32 && code <= 126 ? data[i] : '.');
  }

  const rows = [];
  for (let i = 0; i < hexBytes.length; i += bytesPerRow) {
    const offset = i.toString(16).padStart(8, '0').toUpperCase();
    const rowHex = hexBytes.slice(i, i + bytesPerRow).join(' ');
    const rowAscii = asciiChars.slice(i, i + bytesPerRow).join('');
    rows.push({ offset, rowHex, rowAscii });
  }

  return (
    <div style={{
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 12,
      background: '#0b0f17',
      border: '1px solid #1e293b',
      borderRadius: 6,
      padding: 12,
      overflowX: 'auto'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} style={{ lineHeight: '1.6' }}>
              <td style={{ color: '#64748b', paddingRight: 16, userSelect: 'none' }}>{r.offset}</td>
              <td style={{ color: '#38bdf8', paddingRight: 16 }}>{r.rowHex}</td>
              <td style={{ color: '#00ff9d' }}>{r.rowAscii}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
