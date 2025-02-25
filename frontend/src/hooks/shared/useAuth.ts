/* eslint-disable @typescript-eslint/no-explicit-any */
// @/hooks/shared/useAuth.ts - Fixed implementation

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
import api from "@/lib/axios";

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
        
        console.log("Auth check - User data:", userData ? "Found" : "Not found");
        
        if (userData) {
          setUser(userData);
        } else {
          // If we couldn't get user data but have a token, something's wrong
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
  const register = async (data: RegisterCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      console.log("Starting registration process with username:", data.username);
      const result = await authService.register(data);
      
      if (result.success) {
        console.log("Registration successful, checking auth...");
        // Add a delay to ensure backend processes are complete
        await new Promise(resolve => setTimeout(resolve, 500));
        await checkAuth();
        
        // Double-check we have a valid user/token
        if (!authService.isAuthenticated() || !authService.getUser()) {
          console.warn("Registration succeeded but auth check failed. Attempting login...");
          
          // Try explicit login as fallback
          try {
            const loginResult = await authService.login({
              username: data.username,
              password: data.password1
            });
            
            if (loginResult.success) {
              await checkAuth();
            } else {
              console.error("Post-registration login failed:", loginResult.error);
            }
          } catch (loginError) {
            console.error("Error during post-registration login:", loginError);
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
  };

  const registerBusiness = async (
    businessData: BusinessData
  ): Promise<AuthResponse> => {
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

      // Use the method from authService directly
      const result = await authService.registerBusiness(businessData);
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
      const response = await api.put('/user/', userData);
      
      if (response.data) {
        // Update local user state
        setUser(prev => prev ? { ...prev, ...response.data } : response.data);
        // Update cached user in authService
        authService.updateUserCache(response.data);
        return { success: true };
      }
      
      return { success: false, error: "Failed to update user data" };
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