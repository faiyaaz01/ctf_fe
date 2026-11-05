import { useState, useEffect } from 'react';
import { Trophy, CheckCircle, HelpCircle, ChevronDown, ChevronUp, Send, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChallengesPage() {
  const { user, isAuthenticated } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [flagInputs, setFlagInputs] = useState({});
  const [submitStatus, setSubmitStatus] = useState({});
  const [revealedHints, setRevealedHints] = useState({});

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = () => {
    setLoading(true);
    api.get('/challenges')
      .then((res) => setChallenges(res.data || []))
      .catch(() => setChallenges([]))
      .finally(() => setLoading(false));
  };

  const handleFlagSubmit = async (challengeId) => {
    const flag = (flagInputs[challengeId] || '').trim();
    if (!flag) return;

    if (!isAuthenticated) {
      setSubmitStatus((prev) => ({
        ...prev,
        [challengeId]: { type: 'error', message: 'You must log in to submit flags and earn points.' }
      }));
      return;
    }

    try {
      const res = await api.post(`/challenges/${challengeId}/submit`, { flag });
      if (res.data?.status === 'success') {
        setSubmitStatus((prev) => ({
          ...prev,
          [challengeId]: { type: 'success', message: res.data.message || 'Correct Flag!' }
        }));
        fetchChallenges();
      } else {
        setSubmitStatus((prev) => ({
          ...prev,
          [challengeId]: { type: 'error', message: res.data?.message || 'Incorrect flag. Try again.' }
        }));
      }
    } catch (err) {
      setSubmitStatus((prev) => ({
        ...prev,
        [challengeId]: { type: 'error', message: err.response?.data?.message || 'Submission failed.' }
      }));
    }
  };

  const categories = ['All', 'Crypto', 'Web', 'Forensics', 'Reverse', 'Pwn', 'OSINT'];

  const filtered = activeCategory === 'All'
    ? challenges
    : challenges.filter((c) => (c.category || '').toLowerCase() === activeCategory.toLowerCase());

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header banner */}
      <div style={{
        background: '#121824',
        border: '1px solid #1e293b',
        borderRadius: 8,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Trophy size={22} color="#fbbf24" /> CTF Challenges Board
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Solve challenges across 6 categories, submit flags, and build your operator score.
          </p>
        </div>

        {isAuthenticated && user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: '#0b0f17',
            padding: '10px 18px',
            borderRadius: 6,
            border: '1px solid #1e293b'
          }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>Operator Score</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#00ff9d' }}>{user.score || 0} pts</div>
            </div>
            <div style={{ width: 1, height: 28, background: '#1e293b' }} />
            <div>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>Solves</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#38bdf8' }}>{user.solvesCount || 0}</div>
            </div>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              background: activeCategory === cat ? 'rgba(56, 189, 248, 0.15)' : '#121824',
              color: activeCategory === cat ? '#38bdf8' : '#94a3b8',
              border: `1px solid ${activeCategory === cat ? 'rgba(56, 189, 248, 0.4)' : '#1e293b'}`,
              borderRadius: 20,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Challenges List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading challenges...</div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: '#121824',
          border: '1px solid #1e293b',
          borderRadius: 8,
          padding: 40,
          textAlign: 'center',
          color: '#64748b'
        }}>
          <Sparkles size={28} color="#334155" style={{ marginBottom: 8 }} />
          <div>No challenges found in category "{activeCategory}".</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Add challenges via admin or seed script.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((chal) => {
            const isSolved = user && (chal.solvedByUsers || []).includes(user.id);
            const isExpanded = expandedId === chal.id;
            const status = submitStatus[chal.id];

            return (
              <div
                key={chal.id}
                style={{
                  background: '#121824',
                  border: `1px solid ${isSolved ? 'rgba(0, 255, 157, 0.3)' : '#1e293b'}`,
                  borderRadius: 8,
                  overflow: 'hidden'
                }}
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : chal.id)}
                  style={{
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    background: isSolved ? 'rgba(0, 255, 157, 0.03)' : 'transparent'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {isSolved ? (
                      <CheckCircle size={20} color="#00ff9d" />
                    ) : (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#38bdf8' }} />
                    )}

                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#f8fafc' }}>
                        {chal.title}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        {chal.category} • {chal.solveCount || 0} solves
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isSolved ? '#00ff9d' : '#fbbf24',
                      background: isSolved ? 'rgba(0, 255, 157, 0.1)' : 'rgba(251, 191, 36, 0.1)',
                      border: `1px solid ${isSolved ? 'rgba(0, 255, 157, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                      padding: '3px 10px',
                      borderRadius: 12
                    }}>
                      {chal.points} pts
                    </span>

                    {isExpanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid #1a2332', background: '#0d1117' }}>
                    <p style={{ color: '#c9d8e8', fontSize: 13, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {chal.description}
                    </p>

                    {/* Hints section */}
                    {(chal.hints || []).length > 0 && (
                      <div style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>
                          Hints Available
                        </div>
                        {chal.hints.map((hint, idx) => (
                          <div key={idx} style={{ marginBottom: 6 }}>
                            {revealedHints[`${chal.id}_${idx}`] ? (
                              <div style={{ fontSize: 12, color: '#fbbf24', background: 'rgba(251, 191, 36, 0.08)', padding: '6px 10px', borderRadius: 4 }}>
                                💡 Hint {idx + 1}: {hint}
                              </div>
                            ) : (
                              <button
                                onClick={() => setRevealedHints((prev) => ({ ...prev, [`${chal.id}_${idx}`]: true }))}
                                style={{
                                  background: 'transparent',
                                  border: '1px dashed #334155',
                                  color: '#94a3b8',
                                  padding: '4px 8px',
                                  borderRadius: 4,
                                  fontSize: 11,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <HelpCircle size={12} /> Reveal Hint {idx + 1}
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Flag submission box */}
                    {!isSolved ? (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <input
                            type="text"
                            value={flagInputs[chal.id] || ''}
                            onChange={(e) => setFlagInputs({ ...flagInputs, [chal.id]: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleFlagSubmit(chal.id)}
                            placeholder="CTF{flag_goes_here}..."
                            style={{
                              flex: 1,
                              background: '#121824',
                              border: '1px solid #1e293b',
                              borderRadius: 6,
                              padding: '8px 12px',
                              color: '#f8fafc',
                              fontSize: 13,
                              outline: 'none',
                              fontFamily: '"JetBrains Mono", monospace'
                            }}
                          />
                          <button
                            onClick={() => handleFlagSubmit(chal.id)}
                            style={{
                              background: '#00ff9d',
                              color: '#0b0f17',
                              border: 'none',
                              borderRadius: 6,
                              padding: '0 16px',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6
                            }}
                          >
                            <Send size={13} /> Submit
                          </button>
                        </div>

                        {status && (
                          <div style={{
                            marginTop: 10,
                            fontSize: 12,
                            padding: '6px 10px',
                            borderRadius: 4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: status.type === 'success' ? 'rgba(0, 255, 157, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                            color: status.type === 'success' ? '#00ff9d' : '#f43f5e',
                            border: `1px solid ${status.type === 'success' ? 'rgba(0, 255, 157, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                          }}>
                            {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            <span>{status.message}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{
                        marginTop: 14,
                        padding: '8px 12px',
                        background: 'rgba(0, 255, 157, 0.08)',
                        border: '1px solid rgba(0, 255, 157, 0.2)',
                        color: '#00ff9d',
                        borderRadius: 6,
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        <CheckCircle size={14} /> Challenge already solved by you!
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
