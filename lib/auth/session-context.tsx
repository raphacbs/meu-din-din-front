"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import { ApiError, setUnauthorizedHandler } from "@/lib/api/client";
import { auth } from "@/lib/api/auth";
import { projections } from "@/lib/api/projections";
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from "@/lib/auth/session-storage";
import { useUserPreferencesStore } from "@/lib/preferences/user-preferences";
import type { SessionResponse } from "@/lib/types/api";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionContextValue {
  user: SessionResponse | null;
  status: SessionStatus;
  login: (session: SessionResponse) => void;
  logout: () => Promise<void>;
  handleUnauthorized: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

async function verifyActiveSession(): Promise<boolean> {
  try {
    await projections.current();
    return true;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return false;
    }

    throw error;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionResponse | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  const handleUnauthorized = useCallback(() => {
    clearStoredSession();
    setUser(null);
    setStatus("unauthenticated");
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    setUnauthorizedHandler(handleUnauthorized);
    return () => setUnauthorizedHandler(null);
  }, [handleUnauthorized]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const storedSession = readStoredSession();

      try {
        const isAuthenticated = await verifyActiveSession();

        if (cancelled) {
          return;
        }

        if (isAuthenticated) {
          setUser(storedSession);
          setStatus("authenticated");
          void useUserPreferencesStore.getState().hydrate().catch(() => {
            // Gates usam default até a tela de configurações tentar de novo.
          });
          return;
        }

        clearStoredSession();
        setUser(null);
        setStatus("unauthenticated");
      } catch {
        if (cancelled) {
          return;
        }

        if (storedSession) {
          setUser(storedSession);
          setStatus("authenticated");
          void useUserPreferencesStore.getState().hydrate().catch(() => {
            // Gates usam default até a tela de configurações tentar de novo.
          });
          return;
        }

        setStatus("unauthenticated");
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((session: SessionResponse) => {
    writeStoredSession(session);
    setUser(session);
    setStatus("authenticated");
    void useUserPreferencesStore.getState().hydrate().catch(() => {
      // Gates usam default até a tela de configurações tentar de novo.
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await auth.logout();
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        throw error;
      }
    } finally {
      clearStoredSession();
      setUser(null);
      setStatus("unauthenticated");
      router.replace("/login");
    }
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      status,
      login,
      logout,
      handleUnauthorized,
    }),
    [user, status, login, logout, handleUnauthorized],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}
