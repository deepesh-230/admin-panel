import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../api/auth';
import {
  clearSession,
  getRefreshToken,
  getStoredUser,
  storeSession,
  type AuthUser,
} from '../utils/apiClient';
import { DASHBOARD_ROLES, homePathForRole } from '../utils/roleAccess';

export { homePathForRole };
type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const stored = getStoredUser();
      if (!stored) {
        setLoading(false);
        return;
      }

      try {
        const me = await authApi.me();
        if (!DASHBOARD_ROLES.has(me.role)) {
          clearSession();
          setUser(null);
        } else {
          setUser(me);
          localStorage.setItem('dd_auth_user', JSON.stringify(me));
        }
      } catch {
        clearSession();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    if (!DASHBOARD_ROLES.has(result.user.role)) {
      clearSession();
      throw new Error('This account is not allowed to access the admin dashboard');
    }
    storeSession(result.user, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
    });
    setUser(result.user);
    return homePathForRole(result.user.role);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } catch {
      // ignore logout API errors
    } finally {
      clearSession();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
