/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/shared/useAuth.ts
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import type { LoginCredentials } from "@/types/shared/auth";

export const useAuth = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/v1/auth/token/",
        credentials
      );
      const { access } = response.data;
      localStorage.setItem("token", access);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error: any) {
      const message =
        error.response?.data?.detail || "Login failed. Please try again.";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/auth/login");
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};
