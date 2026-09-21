'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { api } from '@/services/api';
import { UserProfile } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  revokeAllSessions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Inicialización directa y sin parpadeos desde localStorage
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        if (storedToken && storedUser) {
          return JSON.parse(storedUser);
        }
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return Boolean(localStorage.getItem(TOKEN_KEY));
    }
    return false;
  });

  // Validación silenciosa en segundo plano con el backend
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      return;
    }

    api.getMe()
      .then((profile) => {
        setUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Escuchar evento emitido cuando una petición recibe 401
  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
      setIsLoading(false);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await api.login(username, password);
    localStorage.setItem(TOKEN_KEY, data.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const revokeAllSessions = useCallback(async () => {
    try {
      await api.revokeAllSessions();
    } finally {
      logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    logout,
    revokeAllSessions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
