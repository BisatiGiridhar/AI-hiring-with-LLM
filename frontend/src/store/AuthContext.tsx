/**
 * Global authentication context.
 * Provides user state, login, logout, register functions throughout the app.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, authService } from '../services/api';
import type { User, LoginRequest, RegisterRequest } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login:    (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout:   () => Promise<void>;
  error:    string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]           = useState<User | null>(authService.getStoredUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Validate token on mount
  useEffect(() => {
    if (authService.isAuthenticated() && !user) {
      authAPI.me()
        .then(res => setUser(res.data))
        .catch(() => authService.clearTokens());
    }
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authAPI.login(data);
      const { access_token, refresh_token, user: userObj } = res.data;
      authService.setTokens(access_token, refresh_token, userObj);
      setUser(userObj);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || 'Login failed. Please check your credentials.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await authAPI.register(data);
      // Auto-login after successful registration
      await login({ email: data.email, password: data.password });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || 'Registration failed. Please try again.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authAPI.logout().catch(() => {}); // Best-effort logout
    } finally {
      authService.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      error,
      clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
