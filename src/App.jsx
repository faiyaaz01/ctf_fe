import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChallengesPage from './pages/ChallengesPage';
import NotesScratchpad from './tools/workspace/NotesScratchpad';
import FlagHunter from './tools/workspace/FlagHunter';
import CommandPalette from './components/common/CommandPalette';

function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeView, setActiveView] = useState('tools'); // 'tools', 'challenges', 'auth'
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [paletteOpen, setPaletteOpen] = useState(false);

  const sampleTools = [
    { id: 'notes', title: 'Notes & Scratchpad', category: 'Workspace', badge: 'Java Engine' },
    { id: 'flaghunter', title: 'Flag Hunter', category: 'Workspace', badge: 'Java Engine' },
  ];

  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', background: '#0b0f17', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <Navbar
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenAuth={() => setActiveView('auth')}
          onOpenChallenges={() => setActiveView('challenges')}
          onOpenTools={() => setActiveView('tools')}
          activeView={activeView}
        />

        <div style={{ display: 'flex', flex: 1 }}>
          {activeView === 'tools' && (
            <Sidebar
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
            />
          )}

          <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
            {activeView === 'auth' ? (
              authMode === 'login' ? (
                <LoginPage
                  onSwitchToRegister={() => setAuthMode('register')}
                  onClose={() => setActiveView('tools')}
                />
              ) : (
                <RegisterPage
                  onSwitchToLogin={() => setAuthMode('login')}
                  onClose={() => setActiveView('tools')}
                />
              )
            ) : activeView === 'challenges' ? (
              <ChallengesPage />
            ) : (
              <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Active category tools */}
                {(activeCategory === 'all' || activeCategory === 'workspace') && (
                  <>
                    <NotesScratchpad />
                    <FlagHunter />
                  </>
                )}

                {activeCategory !== 'all' && activeCategory !== 'workspace' && (
                  <div style={{
                    background: '#121824',
                    border: '1px solid #1e293b',
                    borderRadius: 8,
                    padding: 40,
                    textAlign: 'center',
                    color: '#64748b'
                  }}>
                    <h3 style={{ fontSize: 16, color: '#f8fafc', marginBottom: 8 }}>
                      Category: {activeCategory.toUpperCase()}
                    </h3>
                    <p style={{ fontSize: 13 }}>
                      Modular tool suite queued for Phase 5. Select Workspace to test active tools!
                    </p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        <CommandPalette
          isOpen={paletteOpen}
          onClose={setPaletteOpen}
          tools={sampleTools}
          onSelectTool={(id) => {
            setActiveView('tools');
            setActiveCategory('workspace');
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
