import { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import { AuthProvider } from './context/AuthContext';

function App() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', background: '#0b0f17', color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <Navbar onOpenPalette={() => console.log('Open Command Palette')} />

        <div style={{ display: 'flex', flex: 1 }}>
          <Sidebar
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc' }}>
                Workbench: <span style={{ color: '#38bdf8' }}>{activeCategory.toUpperCase()}</span>
              </h1>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                Active full-stack CTF toolkit connected to Spring Boot backend.
              </p>
            </div>

            <div style={{
              background: '#121824',
              border: '1px solid #1e293b',
              borderRadius: 8,
              padding: 24,
              textAlign: 'center'
            }}>
              <p style={{ color: '#94a3b8', fontSize: 14 }}>
                Ready for tool modules! Select a category from the sidebar or press <kbd style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4 }}>Ctrl+K</kbd>.
              </p>
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
