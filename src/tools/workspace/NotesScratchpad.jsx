import { useState, useEffect, useRef } from 'react';
import { Plus, Pin, Trash2, Tag, Save, Check } from 'lucide-react';
import ToolWrapper from '../../components/common/ToolWrapper';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function NotesScratchpad({ onSelectDestination }) {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedTick, setSavedTick] = useState(false);

  const debounceTimer = useRef(null);

  // Fetch notes from Spring Boot on mount
  useEffect(() => {
    if (!isAuthenticated) {
      const local = localStorage.getItem('ctf_guest_notes');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setNotes(parsed);
          if (parsed.length > 0) selectNote(parsed[0]);
        } catch {}
      }
      return;
    }

    api.get('/workspace/notes')
      .then((res) => {
        setNotes(res.data);
        if (res.data.length > 0) selectNote(res.data[0]);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const selectNote = (note) => {
    setActiveNoteId(note.id);
    setTitle(note.title || 'Untitled');
    setContent(note.content || '');
    setTags((note.tags || []).join(', '));
    setPinned(!!note.pinned);
  };

  const handleCreateNew = () => {
    const newNote = {
      id: isAuthenticated ? null : String(Date.now()),
      title: 'New Note',
      content: '',
      tags: [],
      pinned: false,
      category: 'General'
    };

    if (!isAuthenticated) {
      const updated = [newNote, ...notes];
      setNotes(updated);
      localStorage.setItem('ctf_guest_notes', JSON.stringify(updated));
      selectNote(newNote);
      return;
    }

    api.post('/workspace/notes', newNote).then((res) => {
      setNotes((prev) => [res.data, ...prev]);
      selectNote(res.data);
    });
  };

  const saveActiveNote = (t = title, c = content, tg = tags, p = pinned) => {
    if (!activeNoteId) return;
    setSaving(true);

    const tagArray = tg.split(',').map((s) => s.trim()).filter(Boolean);
    const payload = {
      id: activeNoteId,
      title: t,
      content: c,
      tags: tagArray,
      pinned: p,
      category: 'General'
    };

    if (!isAuthenticated) {
      const updated = notes.map((n) => (n.id === activeNoteId ? { ...n, ...payload } : n));
      setNotes(updated);
      localStorage.setItem('ctf_guest_notes', JSON.stringify(updated));
      setSaving(false);
      setSavedTick(true);
      setTimeout(() => setSavedTick(false), 1200);
      return;
    }

    api.post('/workspace/notes', payload)
      .then((res) => {
        setNotes((prev) => prev.map((n) => (n.id === activeNoteId ? res.data : n)));
        setSavedTick(true);
        setTimeout(() => setSavedTick(false), 1200);
      })
      .finally(() => setSaving(false));
  };

  const onContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveActiveNote(title, newContent, tags, pinned);
    }, 800);
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      const updated = notes.filter((n) => n.id !== id);
      setNotes(updated);
      localStorage.setItem('ctf_guest_notes', JSON.stringify(updated));
      if (activeNoteId === id) {
        if (updated.length > 0) selectNote(updated[0]);
        else {
          setActiveNoteId(null);
          setTitle('');
          setContent('');
        }
      }
      return;
    }

    api.delete(`/workspace/notes/${id}`).then(() => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (activeNoteId === id) {
        const remaining = notes.filter((n) => n.id !== id);
        if (remaining.length > 0) selectNote(remaining[0]);
        else {
          setActiveNoteId(null);
          setTitle('');
          setContent('');
        }
      }
    });
  };

  return (
    <ToolWrapper
      title="Notes & Scratchpad"
      category="Workspace"
      description="Persistent CTF operator solve notes with markdown support, tags, and debounced MongoDB cloud auto-save."
      badge={isAuthenticated ? "Java Engine" : "Client (Guest)"}
      outputValue={content}
      sourceToolId="notes"
      onSelectDestination={onSelectDestination}
    >
      <div style={{ display: 'flex', height: 480, border: '1px solid #1e293b', borderRadius: 6, overflow: 'hidden' }}>
        {/* Notes sidebar */}
        <div style={{ width: 220, background: '#0b0f17', borderRight: '1px solid #1e293b', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 10, borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Notes ({notes.length})</span>
            <button
              onClick={handleCreateNew}
              style={{
                background: 'rgba(0, 255, 157, 0.15)',
                border: '1px solid rgba(0, 255, 157, 0.3)',
                color: '#00ff9d',
                padding: '3px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Plus size={12} /> New
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {notes.map((n) => (
              <div
                key={n.id}
                onClick={() => selectNote(n)}
                style={{
                  padding: '9px 12px',
                  borderBottom: '1px solid #161e2e',
                  cursor: 'pointer',
                  background: activeNoteId === n.id ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                  borderLeft: activeNoteId === n.id ? '3px solid #38bdf8' : '3px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: 6 }}>
                  <div style={{ fontSize: 13, color: activeNoteId === n.id ? '#38bdf8' : '#e2e8f0', fontWeight: activeNoteId === n.id ? 600 : 400 }}>
                    {n.pinned && '📌 '}
                    {n.title || 'Untitled'}
                  </div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                    {(n.tags || []).join(', ') || 'No tags'}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(n.id, e)}
                  style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 2 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Note editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#121824' }}>
          {activeNoteId ? (
            <>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    saveActiveNote(e.target.value, content, tags, pinned);
                  }}
                  placeholder="Note title..."
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#f8fafc', fontSize: 15, fontWeight: 600, outline: 'none' }}
                />

                <button
                  onClick={() => {
                    const newPinned = !pinned;
                    setPinned(newPinned);
                    saveActiveNote(title, content, tags, newPinned);
                  }}
                  style={{
                    background: pinned ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                    border: 'none',
                    color: pinned ? '#fbbf24' : '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 11
                  }}
                >
                  <Pin size={13} /> {pinned ? 'Pinned' : 'Pin'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: savedTick ? '#00ff9d' : '#64748b' }}>
                  {savedTick ? <Check size={12} color="#00ff9d" /> : <Save size={12} />}
                  <span>{saving ? 'Saving...' : savedTick ? 'Saved to Cloud' : 'Ready'}</span>
                </div>
              </div>

              <div style={{ padding: '6px 16px', borderBottom: '1px solid #1a2332', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={12} color="#64748b" />
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => {
                    setTags(e.target.value);
                    saveActiveNote(title, content, e.target.value, pinned);
                  }}
                  placeholder="Tags (e.g. crypto, rsa, writeup)..."
                  style={{ flex: 1, background: 'transparent', border: 'none', color: '#94a3b8', fontSize: 12, outline: 'none' }}
                />
              </div>

              <textarea
                value={content}
                onChange={onContentChange}
                placeholder="Write exploit steps, hashes, scratchpad payloads, or GDB offsets here..."
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#e2e8f0',
                  padding: 16,
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 13,
                  lineHeight: '1.6',
                  resize: 'none',
                  outline: 'none'
                }}
              />
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 13 }}>
              Select a note or click + New to create one
            </div>
          )}
        </div>
      </div>
    </ToolWrapper>
  );
}
