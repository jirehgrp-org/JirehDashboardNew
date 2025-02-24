/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/context/AuthContext.tsx

"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  User, 
  LoginCredentials,
  RegisterCredentials,
  AuthResponse 
} from '@/types/shared/auth';
import { authService } from '@/lib/services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      if (isAuth) {
        const userData = await authService.fetchUserData();
        setUser(userData);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        const userData = await authService.fetchUserData();
        setUser(userData);
        setIsAuthenticated(true);
      }
      return response;
    } catch (error: any) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.response?.data?.detail || "Invalid credentials"
      };
    }
  };

  const register = async (data: RegisterCredentials) => {
    try {
      const response = await authService.register(data);
      if (response.success) {
        setIsAuthenticated(true);
        const userData = await authService.fetchUserData();
        setUser(userData);
      }
      return response;
    } catch (error: any) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Registration failed"
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}