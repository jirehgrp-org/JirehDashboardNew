/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @/hooks/shared/useAuth.ts
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import type { LoginCredentials, RegisterCredentials, User } from "@/types/shared/auth";

const API_URL = "http://127.0.0.1:8000/api/v1";

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Fetch user details function
  const fetchUserDetails = async (token: string) => {
    try {
      const response = await axios.get(`${API_URL}/auth/user/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        await fetchUserDetails(token);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);


  const register = async (data: RegisterCredentials) => {
    try {
      // Register user first
      const registerData = {
        ...data,
        user_role: data.user_role || 'owner'
      };

      const response = await axios.post(
        `${API_URL}/register/user`,
        registerData
      );
      
      if (response.status === 201) {
        const { access } = response.data;
        if (access) {
          localStorage.setItem("token", access);
          setIsAuthenticated(true);
        }
        return { success: true };
      }
      
      return { success: false, error: "Registration failed" };
    } catch (error: any) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      return { success: false, error: message };
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      // First login to get token
      const response = await axios.post(
        `${API_URL}/auth/token/`,
        credentials
      );
      const { access } = response.data;
      localStorage.setItem("token", access);
      
      // Then fetch user details
      const userDetails = await fetchUserDetails(access);
      
      if (userDetails) {
        setIsAuthenticated(true);
        return { success: true, user: userDetails };
      }
      
      return { success: false, error: "Failed to fetch user details" };
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Login failed. Please try again.";
      return { success: false, error: message };
    }
  };

  const registerBusiness = async (businessData: any) => {
    try {
      const response = await axios.post(
        `${API_URL}/register/business`,
        businessData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || "Business registration failed";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
    router.push("/auth/login");
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    register,
    registerBusiness,
    login,
    logout,
  };
};