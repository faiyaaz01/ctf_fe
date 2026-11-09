import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import InteractiveHackerBackground from './components/common/InteractiveHackerBackground';
import { AppProvider } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChallengesPage from './pages/ChallengesPage';
import ToolCard from './components/common/ToolCard';
import MainDashboard from './components/dashboard/MainDashboard';
import CommandPalette from './components/common/CommandPalette';
import { TOOL_CATALOG, CATEGORY_URL_SLUGS, SLUG_TO_CATEGORY, getToolUrl } from './tools/toolCatalog';
import { ArrowLeft } from 'lucide-react';

// Tools
import MultiDecoder from './tools/crypto/MultiDecoder';
import XorToolkit from './tools/crypto/XorToolkit';
import HashUtils from './tools/crypto/HashUtils';
import EncodingLab from './tools/crypto/EncodingLab';
import NumberConverter from './tools/crypto/NumberConverter';
import RsaHelper from './tools/crypto/RsaHelper';
import AtbashCipher from './tools/crypto/AtbashCipher';
import RailFenceCipher from './tools/crypto/RailFenceCipher';
import BaconianCipher from './tools/crypto/BaconianCipher';
import BitwiseCalculator from './tools/crypto/BitwiseCalculator';
import RsaAttackLab from './tools/crypto/RsaAttackLab';
import VigenereSolver from './tools/crypto/VigenereSolver';
import PaddingOracleSim from './tools/crypto/PaddingOracleSim';
import SubstitutionSolver from './tools/crypto/SubstitutionSolver';
import DiscreteLogSolver from './tools/crypto/DiscreteLogSolver';
import CribDragCracker from './tools/crypto/CribDragCracker';
import RotShiftTable from './tools/crypto/RotShiftTable';
import NotesScratchpad from './tools/workspace/NotesScratchpad';
import FlagHunter from './tools/workspace/FlagHunter';
import NetworkCalc from './tools/osint/NetworkCalc';
import OsintWorkspace from './tools/osint/OsintWorkspace';
import WordlistsReference from './tools/osint/WordlistsReference';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => localStorage.getItem('ctf_sidebar_open') !== 'false');

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem('ctf_sidebar_open', String(next));
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Parse path: /<category>/<tool> (e.g. /cryptography/xor), /<category>, /tools, /challenges, /login, /
  const { activeView, authMode, activeCategory, openedToolId, dashboardView } = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const root = parts[0]?.toLowerCase() || '';
    const second = parts[1] || null;

    if (root === 'challenges') {
      return { activeView: 'challenges', authMode: 'login', activeCategory: 'all', openedToolId: null, dashboardView: 'dashboard' };
    }
    if (root === 'login' || root === 'auth') {
      return { activeView: 'auth', authMode: 'login', activeCategory: 'all', openedToolId: null, dashboardView: 'dashboard' };
    }
    if (root === 'register') {
      return { activeView: 'auth', authMode: 'register', activeCategory: 'all', openedToolId: null, dashboardView: 'dashboard' };
    }
    if (root === 'tools' || root === 'all') {
      if (second) {
        const found = TOOL_CATALOG.find((t) => t.id === second);
        return {
          activeView: 'tools',
          authMode: 'login',
          activeCategory: found ? found.category : 'all',
          openedToolId: second,
          dashboardView: 'grid'
        };
      }
      return { activeView: 'tools', authMode: 'login', activeCategory: 'all', openedToolId: null, dashboardView: 'grid' };
    }
    if (SLUG_TO_CATEGORY[root]) {
      const category = SLUG_TO_CATEGORY[root];
      return {
        activeView: 'tools',
        authMode: 'login',
        activeCategory: category,
        openedToolId: second,
        dashboardView: 'dashboard'
      };
    }
    // Direct tool fallback, e.g. /xor
    if (root) {
      const direct = TOOL_CATALOG.find((t) => t.id === root);
      if (direct) {
        return {
          activeView: 'tools',
          authMode: 'login',
          activeCategory: direct.category,
          openedToolId: direct.id,
          dashboardView: 'dashboard'
        };
      }
    }
    // Default home: /
    return { activeView: 'tools', authMode: 'login', activeCategory: 'all', openedToolId: null, dashboardView: 'dashboard' };
  }, [location.pathname]);

  const navigateToTool = (toolId) => {
    navigate(getToolUrl(toolId));
  };

  const navigateToCategory = (cat) => {
    if (cat === 'all' || cat === 'dashboard') {
      navigate('/');
    } else {
      const slug = CATEGORY_URL_SLUGS[cat] || cat;
      navigate(`/${slug}`);
    }
  };

  const filteredTools = activeCategory === 'all'
    ? TOOL_CATALOG
    : TOOL_CATALOG.filter((t) => t.category === activeCategory);

  const renderActiveToolComponent = () => {
    switch (openedToolId) {
      case 'decoder':
        return <MultiDecoder onSelectDestination={navigateToTool} />;
      case 'xor':
        return <XorToolkit onSelectDestination={navigateToTool} />;
      case 'hash':
        return <HashUtils onSelectDestination={navigateToTool} />;
      case 'encoding':
        return <EncodingLab onSelectDestination={navigateToTool} />;
      case 'number':
        return <NumberConverter onSelectDestination={navigateToTool} />;
      case 'rsa-helper':
        return <RsaHelper onSelectDestination={navigateToTool} />;
      case 'atbash':
        return <AtbashCipher onSelectDestination={navigateToTool} />;
      case 'railfence':
        return <RailFenceCipher onSelectDestination={navigateToTool} />;
      case 'baconian':
        return <BaconianCipher onSelectDestination={navigateToTool} />;
      case 'bitwise':
        return <BitwiseCalculator onSelectDestination={navigateToTool} />;
      case 'rsa-attack':
        return <RsaAttackLab onSelectDestination={navigateToTool} />;
      case 'vigenere':
        return <VigenereSolver onSelectDestination={navigateToTool} />;
      case 'padding-oracle':
        return <PaddingOracleSim onSelectDestination={navigateToTool} />;
      case 'substitution':
        return <SubstitutionSolver onSelectDestination={navigateToTool} />;
      case 'discrete-log':
        return <DiscreteLogSolver onSelectDestination={navigateToTool} />;
      case 'crib-drag':
        return <CribDragCracker onSelectDestination={navigateToTool} />;
      case 'rot-table':
        return <RotShiftTable onSelectDestination={navigateToTool} />;
      case 'notes':
        return <NotesScratchpad onSelectDestination={navigateToTool} />;
      case 'flaghunter':
        return <FlagHunter onSelectDestination={navigateToTool} />;
      case 'network-calc':
        return <NetworkCalc onSelectDestination={navigateToTool} />;
      case 'osint-workspace':
        return <OsintWorkspace onSelectDestination={navigateToTool} />;
      case 'wordlists-ref':
        return <WordlistsReference onSelectDestination={navigateToTool} />;
      default:
        return (
          <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: 8, padding: 40, textAlign: 'center', color: '#64748b' }}>
            <h3 style={{ color: '#f8fafc', fontSize: 16 }}>Tool module ready for Phase 5 implementation!</h3>
            <p style={{ marginTop: 8, fontSize: 13 }}>Selected tool ID: <code>{openedToolId}</code></p>
          </div>
        );
    }
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <div style={{ minHeight: '100vh', background: 'var(--theme-bg, #070a13)', color: '#e2e8f0', display: 'flex', position: 'relative' }}>
            <InteractiveHackerBackground />

            {/* Attached Full-Height Sidebar */}
            <Sidebar
              isOpen={sidebarOpen}
              onToggle={toggleSidebar}
              activeCategory={activeCategory}
              onSelectCategory={navigateToCategory}
              onOpenHome={() => navigate('/')}
            />

            {/* Attached Main Frame with Navbar at Top */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative', zIndex: 1 }}>
              <Navbar
                onOpenPalette={() => setPaletteOpen(true)}
                onOpenAuth={() => navigate('/login')}
                onOpenChallenges={() => navigate('/challenges')}
                onOpenTools={() => navigate('/')}
                activeView={activeView}
              />

              <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
                {activeView === 'auth' ? (
                  authMode === 'login' ? (
                    <LoginPage
                      onSwitchToRegister={() => navigate('/register')}
                      onClose={() => navigate('/')}
                    />
                  ) : (
                    <RegisterPage
                      onSwitchToLogin={() => navigate('/login')}
                      onClose={() => navigate('/')}
                    />
                  )
                ) : activeView === 'challenges' ? (
                  <ChallengesPage />
                ) : openedToolId ? (
                  <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <button
                      onClick={() => {
                        const slug = CATEGORY_URL_SLUGS[activeCategory] || activeCategory;
                        navigate(`/${slug}`);
                      }}
                      style={{
                        alignSelf: 'flex-start',
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.25)',
                        color: '#38bdf8',
                        padding: '6px 14px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <ArrowLeft size={14} /> Back to {activeCategory.toUpperCase()} Cards
                    </button>

                    {renderActiveToolComponent()}
                  </div>
                ) : activeCategory === 'all' && dashboardView === 'dashboard' ? (
                  <MainDashboard
                    onSelectDomain={navigateToCategory}
                    onOpenTool={navigateToTool}
                    onViewAllTools={() => navigate('/tools')}
                  />
                ) : (
                  <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', fontFamily: '"JetBrains Mono", monospace' }}>
                          {activeCategory === 'all' ? 'All CTF Tools (64 Modules)' : `${activeCategory.toUpperCase()} Toolkit`}
                        </h1>
                        <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                          Select any tool card below to launch its dedicated interactive workspace.
                        </p>
                      </div>
                      {activeCategory === 'all' && (
                        <button
                          onClick={() => navigate('/')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 14px',
                            borderRadius: 6,
                            background: 'var(--theme-glow, rgba(0, 240, 255, 0.15))',
                            border: '1px solid var(--theme-accent, #00f0ff)',
                            color: 'var(--theme-accent, #00f0ff)',
                            fontSize: 11,
                            fontFamily: '"JetBrains Mono", monospace',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          ← RETURN TO DASHBOARD
                        </button>
                      )}
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                      gap: 16
                    }}>
                      {filteredTools.map((tool) => (
                        <ToolCard
                          key={tool.id}
                          tool={tool}
                          onOpen={navigateToTool}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </main>
            </div>

            <CommandPalette
              isOpen={paletteOpen}
              onClose={setPaletteOpen}
              tools={TOOL_CATALOG}
              onSelectTool={navigateToTool}
            />
          </div>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
