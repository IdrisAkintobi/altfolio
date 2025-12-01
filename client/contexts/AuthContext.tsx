import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@shared/types';
import { authService } from '../services/auth.service';
import { apiClient } from '../lib/api';
import { useLogin, useRegister } from '../hooks/mutations/useAuthMutations';
import { queryClient } from '../lib/query-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('authUser');
    queryClient.clear();
  }, []);

  useEffect(() => {
    // Check for stored token and user on mount
    const storedToken = authService.getStoredToken();
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (_error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
    setIsLoading(false);

    // Set up 401 unauthorized handler
    apiClient.setUnauthorizedCallback(logout);
  }, [logout]);

  const login = async (email: string, password: string) => {
    const { user: userData, token: authToken } = await loginMutation.mutateAsync({
      email,
      password,
    });
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  const register = async (name: string, email: string, password: string) => {
    const { user: userData, token: authToken } = await registerMutation.mutateAsync({
      name,
      email,
      password,
    });
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('authUser', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
