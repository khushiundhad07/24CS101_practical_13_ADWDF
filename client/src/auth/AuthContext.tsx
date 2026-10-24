import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as api from '../api';
import type { User } from '../api';

interface AuthValue {
  user: User | null;
  /** True while a saved token is being checked with /auth/me on first load. */
  checking: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(() => api.tokenStore.get() !== null);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = useCallback(() => {
    api.tokenStore.set(null);
    setUser(null);
  }, []);

  // Any 401 on a request that carried a token: drop the token and send the user to log in again.
  useEffect(() => {
    api.setUnauthorizedHandler((message) => {
      logout();
      navigate('/login', { replace: true, state: { from: location.pathname, notice: message } });
    });
  }, [logout, navigate, location.pathname]);

  // Restore the session from a saved token, using the /me endpoint.
  useEffect(() => {
    if (!api.tokenStore.get()) return;
    api
      .me()
      .then(({ user }) => setUser(user))
      .catch(() => api.tokenStore.set(null))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login(email, password);
    api.tokenStore.set(token);
    setUser(user);
  }, []);

  const register = useCallback(
    async (email: string, password: string) => {
      await api.register(email, password);
      await login(email, password);
    },
    [login],
  );

  const value = useMemo(() => ({ user, checking, login, register, logout }), [user, checking, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
