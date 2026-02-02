import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { LoginRequest, LoginResponse } from '../services/types';
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
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
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

  const initializeAuth = async () => {
    try {
      const token = authService.getToken();
      if (token) {
        // Check if token is expired
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        
        if (currentTime < expiryTime - AUTH_CONSTANTS.TOKEN_EXPIRY_BUFFER) {
          const currentUser = {
            id: payload.sub,
            username: payload.sub,
            role: payload.roles?.[0] || 'USER',
          };
          
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Token expired, clear it
          authService.clearToken();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      authService.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response: LoginResponse = await authService.login(credentials);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
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
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
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
