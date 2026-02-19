import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { LoginRequest, LoginResponse, UserRole } from '../services/types';
import { handleError } from '../utils';
import { AUTH_CONSTANTS } from '../constants';

interface User {
  id: number;
  username: string;
  role: string;
  holisticProfileCompleted?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginRequest, role: UserRole) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const persistUser = (userData: User | null) => {
    if (userData) {
      localStorage.setItem(AUTH_CONSTANTS.USER_KEY, JSON.stringify(userData));
    } else {
      localStorage.removeItem(AUTH_CONSTANTS.USER_KEY);
    }
  };

  const getPersistedUser = (): User | null => {
    try {
      const userData = localStorage.getItem(AUTH_CONSTANTS.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };

  // Try to resolve a numeric user ID from various sources
  const resolveNumericId = (...candidates: unknown[]): number => {
    for (const val of candidates) {
      if (typeof val === 'number' && val > 0) return val;
      if (typeof val === 'string' && val !== '') {
        const n = Number(val);
        if (!isNaN(n) && n > 0) return n;
      }
    }
    return 0;
  };

  // Build a User from the login response (handles flat or nested shapes)
  // and/or the JWT payload. Returns null only if nothing useful is found.
  const resolveUser = (response: Record<string, unknown>, token: string | null): User | null => {
    // --- 1. Try nested  response.user  ---
    const nestedUser = response.user as Record<string, unknown> | undefined;

    // --- 2. Decode JWT payload ---
    let jwtPayload: Record<string, unknown> = {};
    if (token) {
      try {
        jwtPayload = JSON.parse(atob(token.split('.')[1]));
        console.log('[Auth] JWT payload claims:', JSON.stringify(jwtPayload, null, 2));
      } catch { /* ignore */ }
    }

    // --- 3. Resolve numeric ID from every possible location ---
    const id = resolveNumericId(
      // nested user object
      nestedUser?.id, nestedUser?.userId, nestedUser?.studentId,
      // flat response fields
      response.id, response.userId, response.studentId,
      // JWT claims
      jwtPayload.userId, jwtPayload.user_id, jwtPayload.studentId, jwtPayload.id,
      // JWT sub (last resort — might be a numeric string)
      jwtPayload.sub,
    );

    // --- 4. Resolve username ---
    const username = (
      (nestedUser?.username as string) ||
      (response.username as string) ||
      (jwtPayload.sub as string) ||
      (jwtPayload.username as string) ||
      ''
    );

    // --- 5. Resolve role ---
    const roleFromNested = nestedUser?.role as string | undefined;
    const roleFromFlat = response.role as string | undefined;
    const rolesArr = (jwtPayload.roles ?? jwtPayload.authorities) as string[] | undefined;
    const roleFromJwt = Array.isArray(rolesArr) ? rolesArr[0] : (jwtPayload.role as string | undefined);
    const role = roleFromNested || roleFromFlat || roleFromJwt || 'USER';

    console.log('[Auth] Resolved user — id:', id, 'username:', username, 'role:', role);

    if (!username && id === 0) return null;

    return { id, username, role };
  };

  const initializeAuth = async () => {
    try {
      const token = authService.getToken();
      if (token) {
        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();

        if (currentTime < expiryTime - AUTH_CONSTANTS.TOKEN_EXPIRY_BUFFER) {
          // Restore user data from localStorage (persisted during login)
          const persistedUser = getPersistedUser();

          if (persistedUser && persistedUser.id && persistedUser.id > 0) {
            setUser(persistedUser);
            setIsAuthenticated(true);
          } else {
            // Fallback: reconstruct user from JWT payload
            const currentUser = resolveUser({}, token);
            if (currentUser) {
              setUser(currentUser);
              setIsAuthenticated(true);
              persistUser(currentUser);
            }
          }
        } else {
          // Token expired, clear it
          authService.clearToken();
          persistUser(null);
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      authService.clearToken();
      persistUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest, role: UserRole): Promise<LoginResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response: LoginResponse = await authService.login(credentials, role);

      // Debug: log the raw login response to understand backend data shape
      console.log('[Auth] Raw login response keys:', Object.keys(response));
      console.log('[Auth] Login response:', JSON.stringify(response, null, 2));

      // Resolve user from any combination of response fields + JWT claims
      const token = authService.getToken();
      const userData = resolveUser(response as unknown as Record<string, unknown>, token);

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        persistUser(userData);
      } else {
        console.error('[Auth] Login succeeded but could not determine user info');
        setIsAuthenticated(true);
      }

      return response;
    } catch (error) {
      const errorMessage = handleError(error, 'login');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      persistUser(null);
      setLoading(false);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      persistUser(updated);
      return updated;
    });
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUser,
    loading,
    error,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
