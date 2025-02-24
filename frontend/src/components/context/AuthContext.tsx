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
  registerBusiness: (data: any) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Check if there's a token in cookies or storage
        const isAuth = authService.isAuthenticated();
        console.log("Initial auth check - Token exists:", isAuth);
        
        if (isAuth) {
          try {
            // Try to fetch user data with the existing token
            console.log("Attempting to fetch user data with existing token");
            const userData = await authService.fetchUserData();
            
            if (userData) {
              console.log("User data fetched successfully during initial auth check");
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              // Token might be invalid or expired
              console.log("Could not fetch user data with existing token");
              authService.logout();
              setIsAuthenticated(false);
            }
          } catch (fetchError) {
            console.error("Error fetching user data:", fetchError);
            authService.logout();
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
  
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      if (response.success) {
        // Add small delay to ensure token is processed
        await new Promise(resolve => setTimeout(resolve, 300));
        const userData = await authService.fetchUserData();
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          return { success: false, error: "Could not fetch user data" };
        }
      }
      return response;
    } catch (error: any) {
      console.error("Login error:", error);
      return { 
        success: false, 
        error: error.response?.data?.detail || "Invalid credentials"
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterCredentials) => {
    try {
      setIsLoading(true);
      const response = await authService.register(data);
      
      if (response.success) {
        // Add a small delay to ensure token is processed
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Fetch user data after registration
        const userData = await authService.fetchUserData();
        
        if (userData) {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          console.warn("User registration succeeded but could not fetch user data");
          // Still return success since the registration succeeded
        }
      }
      
      return response;
    } catch (error: any) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        error: error.response?.data?.message || "Registration failed"
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  const registerBusiness = async (businessData: any) => {
    try {
      setIsLoading(true);
      const response = await authService.registerBusiness(businessData);
      return response;
    } catch (error: any) {
      console.error("Business registration error:", error);
      return {
        success: false,
        error: error.message || "Business registration failed"
      };
    } finally {
      setIsLoading(false);
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
    registerBusiness,
  };

  // Don't render children until initial auth check is complete
  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

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