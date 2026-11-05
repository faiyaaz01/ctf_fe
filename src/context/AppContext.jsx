import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [backendOnline, setBackendOnline] = useState(false);
  const [bootstrapLoaded, setBootstrapLoaded] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  // Single startup bootstrap call: checks health & gets public platform metadata ONCE
  useEffect(() => {
    let mounted = true;
    const bootstrap = async () => {
      try {
        const [annRes] = await Promise.all([
          api.get('/announcements', { timeout: 3500 }).catch(() => ({ data: [] }))
        ]);
        if (!mounted) return;
        setBackendOnline(true);
        setAnnouncements(annRes.data || []);
      } catch {
        if (mounted) setBackendOnline(false);
      } finally {
        if (mounted) setBootstrapLoaded(true);
      }
    };

    bootstrap();

    // Gentle heartbeat every 45s (prevents excessive polling)
    const timer = setInterval(async () => {
      try {
        await api.get('/announcements', { timeout: 3000 });
        if (mounted) setBackendOnline(true);
      } catch {
        if (mounted) setBackendOnline(false);
      }
    }, 45000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <AppContext.Provider value={{ backendOnline, bootstrapLoaded, announcements }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
