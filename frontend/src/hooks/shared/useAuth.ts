/* eslint-disable @typescript-eslint/no-explicit-any */
// @/hooks/shared/useAuth.ts

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  BusinessData,
  AuthResponse,
} from "@/types/shared/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Function to check if user is authenticated
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      // First check if we have a token
      const isAuth = authService.isAuthenticated();
      console.log("Auth check - Is authenticated:", isAuth);

      if (isAuth) {
        // First try to get cached user
        let userData = authService.getUser();
        
        // If no cached user, fetch from backend
        if (!userData) {
          console.log("No cached user, fetching from backend");
          userData = await authService.fetchUserData();
        }
        
        if (userData) {
          setUser(userData);
        } else {
          console.warn("Has token but couldn't get user data - possible auth issue");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      console.log("Attempting login with username:", credentials.username);
      const result = await authService.login(credentials);
      
      if (result.success) {
        console.log("Login successful, checking auth...");
        await checkAuth(); // Make sure we update the user state
        return { success: true };
      }
      
      console.log("Login failed:", result.error);
      return { success: false, error: result.error };
    } catch (error: any) {
      console.error("Login error in hook:", error);
      return {
        success: false,
        error: error.message || "Login failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  // Register function
  const register = async (data: RegisterCredentials, businessData?: BusinessData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      console.log("Starting registration process with username:", data.username);
      const result = await authService.register(data);
      
      if (result.success) {
        console.log("Registration successful, checking auth...");
        
        // Wait longer to ensure backend processes complete and token is set
        await new Promise(resolve => setTimeout(resolve, 2000));
        await checkAuth();
        
        // If business data is provided, automatically register the business
        if (businessData && authService.isAuthenticated()) {
          try {
            console.log("Registering business with data:", businessData);
            const businessResult = await authService.registerBusiness(businessData);
            
            if (!businessResult.success) {
              console.error("Business registration failed:", businessResult.error);
              return { 
                success: true, 
                warning: "User created but business registration failed: " + businessResult.error 
              };
            }
          } catch (bizError) {
            console.error("Business registration error:", bizError);
            return { 
              success: true, 
              warning: "User created but business registration failed" 
            };
          }
        }
        
        return { success: true };
      }
      
      console.log("Registration failed:", result.error);
      return { success: false, error: result.error };
    } catch (error: any) {
      console.error("Registration error in hook:", error);
      return {
        success: false,
        error: error.message || "Registration failed"
      };
    } finally {
      setIsLoading(false);
    }
  }

  const registerBusiness = async (businessData: BusinessData): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      console.log("Starting business registration");
      
      if (!authService.isAuthenticated()) {
        console.error("Not authenticated for business registration");
        return {
          success: false,
          error: "Authentication required to register a business",
        };
      }

      // Use the method from authService
      const result = await authService.registerBusiness(businessData);
      
      if (result.success) {
        // Refresh auth to get updated user info
        await checkAuth();
      }
      
      return result;
    } catch (error: any) {
      console.error("Business registration error:", error);
      return {
        success: false,
        error: error.message || "Business registration failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      // Assuming your backend has an API to update user data
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
      const token = authService.getToken();
      
      if (!token) {
        return { success: false, error: "Authentication required" };
      }
      
      const response = await fetch(`${API_URL}/user/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const updatedData = await response.json();
        
        // Update local user state
        setUser(prev => prev ? { ...prev, ...updatedData } : updatedData);
        
        // Update cached user in authService
        authService.updateUserCache(updatedData);
        
        return { success: true };
      }
      
      const errorData = await response.json();
      return { 
        success: false, 
        error: errorData.detail || "Failed to update user data" 
      };
    } catch (error: any) {
      console.error("Update user error:", error);
      return {
        success: false,
        error: error.message || "Update failed"
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    login,
    logout,
    register,
    registerBusiness,
    updateUser, 
    isLoading,
    isAuthenticated: !!user,
    checkAuth,
  };
}