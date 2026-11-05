import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

// Standard CTF Flag Patterns
const HIGH_CONF_REGEX = /\b[a-zA-Z0-9_\-]{2,12}\{[^ \t\r\n\x00-\x1f\x7f]{3,128}\}\b/;
const MED_CONF_REGEX = /\{[^ \t\r\n\x00-\x1f\x7f]{3,128}\}/;

export function useFlagHunter() {
  const { isAuthenticated } = useAuth();
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      const local = localStorage.getItem('ctf_guest_flags');
      if (local) {
        try { setCandidates(JSON.parse(local)); } catch {}
      }
      return;
    }

    api.get('/workspace/flags')
      .then((res) => setCandidates(res.data))
      .catch(() => {});
  }, [isAuthenticated]);

  const addCandidate = (text, sourceTool = 'Unknown') => {
    if (!text || typeof text !== 'string' || text.length < 5) return;

    let match = text.match(HIGH_CONF_REGEX);
    let confidence = 'high';

    if (!match) {
      match = text.match(MED_CONF_REGEX);
      confidence = 'medium';
    }

    if (!match) return;

    const value = match[0];

    const flagPayload = {
      value,
      sourceTool,
      confidence,
      confirmed: false,
      falsePositive: false
    };

    if (!isAuthenticated) {
      setCandidates((prev) => {
        const exists = prev.find((c) => c.value === value);
        if (exists) return prev;
        const updated = [{ ...flagPayload, id: String(Date.now()), createdAt: new Date().toISOString() }, ...prev];
        localStorage.setItem('ctf_guest_flags', JSON.stringify(updated));
        return updated;
      });
      return;
    }

    api.post('/workspace/flags', flagPayload).then((res) => {
      setCandidates((prev) => {
        const idx = prev.findIndex((c) => c.id === res.data.id || c.value === res.data.value);
        if (idx !== -1) {
          const clone = [...prev];
          clone[idx] = res.data;
          return clone;
        }
        return [res.data, ...prev];
      });
    });
  };

  const clearAll = () => {
    if (!isAuthenticated) {
      setCandidates([]);
      localStorage.removeItem('ctf_guest_flags');
      return;
    }
    api.delete('/workspace/flags').then(() => setCandidates([]));
  };

  return { candidates, addCandidate, clearAll };
}
