import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChallengesPage from './pages/ChallengesPage';
import ToolCard from './components/common/ToolCard';
import CommandPalette from './components/common/CommandPalette';
import { TOOL_CATALOG } from './tools/toolCatalog';
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
import NotesScratchpad from './tools/workspace/NotesScratchpad';
import FlagHunter from './tools/workspace/FlagHunter';
import NetworkCalc from './tools/osint/NetworkCalc';
import OsintWorkspace from './tools/osint/OsintWorkspace';

function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeView, setActiveView] = useState('tools'); // 'tools', 'challenges', 'auth'
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [openedToolId, setOpenedToolId] = useState(null); // When clicking a card to open that tool

  const filteredTools = activeCategory === 'all'
    ? TOOL_CATALOG
    : TOOL_CATALOG.filter((t) => t.category === activeCategory);

  const renderActiveToolComponent = () => {
    switch (openedToolId) {
      case 'decoder':
        return <MultiDecoder onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'xor':
        return <XorToolkit onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'hash':
        return <HashUtils onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'encoding':
        return <EncodingLab onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'number':
        return <NumberConverter onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'rsa-helper':
        return <RsaHelper onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'atbash':
        return <AtbashCipher onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'railfence':
        return <RailFenceCipher onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'baconian':
        return <BaconianCipher onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'bitwise':
        return <BitwiseCalculator onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'rsa-attack':
        return <RsaAttackLab onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'vigenere':
        return <VigenereSolver onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'padding-oracle':
        return <PaddingOracleSim onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'substitution':
        return <SubstitutionSolver onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'discrete-log':
        return <DiscreteLogSolver onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'crib-drag':
        return <CribDragCracker onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'notes':
        return <NotesScratchpad onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'flaghunter':
        return <FlagHunter onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'network-calc':
        return <NetworkCalc onSelectDestination={(id) => setOpenedToolId(id)} />;
      case 'osint-workspace':
        return <OsintWorkspace onSelectDestination={(id) => setOpenedToolId(id)} />;
      default:
        return (
          <div style={{ background: '#121824', border: '1px solid #1e293b', borderRadius: 8, padding: 40, textAlign: 'center', color: '#64748b' }}>
            <h3>Tool module ready for Phase 5 implementation!</h3>
            <p style={{ marginTop: 8, fontSize: 13 }}>Selected tool ID: <code>{openedToolId}</code></p>
          </div>
        );
    }
  };

  return (
    <AuthProvider>
      <AppProvider>
        <div style={{ minHeight: '100vh', background: '#0b0f17', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <Navbar
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenAuth={() => setActiveView('auth')}
          onOpenChallenges={() => setActiveView('challenges')}
          onOpenTools={() => {
            setActiveView('tools');
            setOpenedToolId(null);
          }}
          activeView={activeView}
        />

        <div style={{ display: 'flex', flex: 1 }}>
          {activeView === 'tools' && (
            <Sidebar
              activeCategory={activeCategory}
              onSelectCategory={(cat) => {
                setActiveCategory(cat);
                setOpenedToolId(null);
              }}
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
            ) : openedToolId ? (
              <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <button
                  onClick={() => setOpenedToolId(null)}
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
            ) : (
              <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Category Banner */}
                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc' }}>
                    {activeCategory === 'all' ? 'All CTF Tools' : `${activeCategory.toUpperCase()} Toolkit`}
                  </h1>
                  <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                    Select any tool card below to launch its dedicated interactive workspace.
                  </p>
                </div>

                {/* 3-Column Responsive Tool Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: 16
                }}>
                  {filteredTools.map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      onOpen={(id) => setOpenedToolId(id)}
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
          onSelectTool={(id) => {
            setActiveView('tools');
            setOpenedToolId(id);
          }}
        />
      </div>
    </AppProvider>
  </AuthProvider>
  );
}

export default App;
