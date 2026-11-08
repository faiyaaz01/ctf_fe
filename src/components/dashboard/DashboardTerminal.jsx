import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft, Trash2 } from 'lucide-react';
import { TOOL_CATALOG } from '../../tools/toolCatalog';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardTerminal({ onOpenTool }) {
  const { setThemeId, currentTheme, THEMES } = useTheme();
  const [history, setHistory] = useState([
    { type: 'system', text: 'CTF//PLATFORM Terminal v2.4 (session: active)' },
    { type: 'info', text: "Type 'help' for available commands, or type 'open <tool>' (e.g. 'open xor', 'rot-table')." }
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIndex = historyIndex + 1 < cmdHistory.length ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIndex);
      setInput(cmdHistory[cmdHistory.length - 1 - nextIndex] || '');
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
      return;
    }

    if (e.key !== 'Enter') return;
    const rawCmd = input.trim();
    if (!rawCmd) return;

    // Record in history
    setCmdHistory((prev) => [...prev, rawCmd]);
    setHistoryIndex(-1);
    setInput('');

    const newLogs = [{ type: 'prompt', text: `ctf@operator:~$ ${rawCmd}` }];
    const parts = rawCmd.split(' ');
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ').trim();

    if (cmd === 'clear') {
      setHistory([
        { type: 'system', text: 'Terminal buffer cleared.' },
        { type: 'info', text: "Type 'help' for commands or 'open <tool>' to launch." }
      ]);
      return;
    }

    if (cmd === 'help') {
      newLogs.push(
        { type: 'system', text: 'AVAILABLE TERMINAL COMMANDS:' },
        { type: 'info', text: "  open <tool>    - Launch tool workspace (e.g. 'open xor', 'open rot-table')" },
        { type: 'info', text: "  <tool_id>      - Shorthand to open tool directly (e.g. 'xor', 'decoder', 'notes')" },
        { type: 'info', text: "  list           - Display available tools catalog" },
        { type: 'info', text: "  theme <name>   - Switch theme (matrix, redteam, cyberpunk, synthwave, amber)" },
        { type: 'info', text: "  decode <str>   - Fast Base64 / Hex / ROT13 heuristics test" },
        { type: 'info', text: "  time           - Print live server and local UTC operational clock" },
        { type: 'info', text: "  clear          - Clear terminal output" }
      );
      setHistory((prev) => [...prev, ...newLogs]);
      return;
    }

    if (cmd === 'time') {
      const now = new Date();
      newLogs.push({
        type: 'success',
        text: `LOCAL: ${now.toLocaleTimeString()} (${now.toDateString()}) | UTC: ${now.toUTCString()}`
      });
      setHistory((prev) => [...prev, ...newLogs]);
      return;
    }

    if (cmd === 'theme') {
      const targetTheme = arg.toLowerCase();
      const valid = THEMES.find((t) => t.id === targetTheme);
      if (valid) {
        setThemeId(valid.id);
        newLogs.push({ type: 'success', text: `[+] Theme successfully switched to: ${valid.name}` });
      } else {
        newLogs.push({
          type: 'error',
          text: `[-] Unknown theme '${arg}'. Choose: ${THEMES.map((t) => t.id).join(', ')}`
        });
      }
      setHistory((prev) => [...prev, ...newLogs]);
      return;
    }

    if (cmd === 'list') {
      newLogs.push({ type: 'system', text: 'SECURITY MODULES CATALOG:' });
      TOOL_CATALOG.forEach((t) => {
        newLogs.push({ type: 'info', text: `  • [${t.category}] ${t.id} - ${t.title}` });
      });
      setHistory((prev) => [...prev, ...newLogs]);
      return;
    }

    if (cmd === 'decode') {
      if (!arg) {
        newLogs.push({ type: 'error', text: '[-] Usage: decode <ciphertext_string>' });
      } else {
        let decoded = null;
        // Base64
        try {
          if (/^[A-Za-z0-9+/]{4,}={0,2}$/.test(arg)) {
            decoded = `Base64: ${atob(arg)}`;
          }
        } catch (_) {}
        // Hex
        if (!decoded && /^[0-9a-fA-F]{4,}$/.test(arg) && arg.length % 2 === 0) {
          try {
            let str = '';
            for (let i = 0; i < arg.length; i += 2) {
              str += String.fromCharCode(parseInt(arg.substr(i, 2), 16));
            }
            decoded = `Hex to ASCII: ${str}`;
          } catch (_) {}
        }
        // ROT13
        if (!decoded) {
          const rot = arg.replace(/[a-zA-Z]/g, (c) => {
            const base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
          });
          decoded = `ROT-13: ${rot}`;
        }
        newLogs.push({ type: 'success', text: `[+] Decoded result: ${decoded || 'Could not parse payload'}` });
      }
      setHistory((prev) => [...prev, ...newLogs]);
      return;
    }

    // Check if command is "open <id>" or direct tool id
    const targetToolId = cmd === 'open' ? arg.toLowerCase() : cmd;
    const tool = TOOL_CATALOG.find((t) => t.id.toLowerCase() === targetToolId || t.title.toLowerCase() === targetToolId);

    if (tool) {
      newLogs.push({ type: 'success', text: `[+] Launching ${tool.title} [${tool.categoryLabel}]...` });
      setHistory((prev) => [...prev, ...newLogs]);
      setTimeout(() => {
        onOpenTool(tool.id);
      }, 350);
      return;
    }

    // Unknown command
    newLogs.push({
      type: 'error',
      text: `[-] Command or tool '${rawCmd}' not recognized. Type 'help' or 'list'.`
    });
    setHistory((prev) => [...prev, ...newLogs]);
  };

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        background: 'rgba(5, 8, 15, 0.85)',
        border: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        minHeight: 280,
        height: 310
      }}
    >
      {/* Terminal Title Bar */}
      <div style={{
        height: 34,
        background: 'rgba(255, 255, 255, 0.03)',
        borderBottom: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        userSelect: 'none'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#eab308', display: 'inline-block' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
          <span style={{
            marginLeft: 8,
            fontSize: 11,
            color: '#94a3b8',
            fontFamily: '"JetBrains Mono", monospace',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <TerminalIcon size={12} color="var(--theme-accent, #00f0ff)" />
            ctf-terminal // interactive command runner
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setHistory([
              { type: 'system', text: 'Terminal buffer cleared.' },
              { type: 'info', text: "Type 'help' for commands or 'open <tool>' to launch." }
            ]);
          }}
          title="Clear Terminal"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 10,
            fontFamily: '"JetBrains Mono", monospace'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
        >
          <Trash2 size={12} />
          <span>Clear</span>
        </button>
      </div>

      {/* Terminal Output Log */}
      <div style={{
        flex: 1,
        padding: '12px 14px',
        overflowY: 'auto',
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 12,
        lineHeight: 1.6,
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }}>
        {history.map((item, idx) => {
          let color = '#94a3b8';
          if (item.type === 'prompt') color = '#f8fafc';
          if (item.type === 'system') color = 'var(--theme-accent, #00f0ff)';
          if (item.type === 'success') color = '#22c55e';
          if (item.type === 'error') color = '#f87171';
          return (
            <div key={idx} style={{ color, wordBreak: 'break-all' }}>
              {item.text}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Prompt Input */}
      <div style={{
        padding: '8px 14px',
        borderTop: '1px solid var(--theme-border, rgba(255, 255, 255, 0.08))',
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span style={{
          color: 'var(--theme-accent, #00f0ff)',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 12,
          fontWeight: 700,
          whiteSpace: 'nowrap'
        }}>
          ctf@operator:~$
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          placeholder="type 'open xor', 'rot-table', 'list', 'help'..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#f8fafc',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12
          }}
        />
        <CornerDownLeft size={13} color="#475569" />
      </div>
    </div>
  );
}
