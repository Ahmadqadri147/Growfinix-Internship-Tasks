'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { clientApi } from '@/lib/client-api';
import type { PublicUser, UserStats } from '@/lib/types';

type SessionStats = (UserStats & { hourlyLimit: number }) | null;

interface SessionContextValue {
  user: PublicUser | null;
  stats: SessionStats;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [stats, setStats] = useState<SessionStats>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await clientApi.me();
      setUser(response.data.user);
      setStats(response.data.stats);
    } catch {
      setUser(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // The session lives in an httpOnly cookie, so it can only be read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await clientApi.logout();
    setUser(null);
    setStats(null);
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, stats, loading, refresh, logout }),
    [user, stats, loading, refresh, logout]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
