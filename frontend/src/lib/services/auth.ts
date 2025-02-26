/* eslint-disable @typescript-eslint/no-explicit-any */
// @/lib/services/auth.ts

import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  AuthResponse,
  BusinessData
} from "@/types/shared/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

class AuthService {
  private static instance: AuthService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private currentUser: User | null = null;

  private constructor() {
    if (typeof window !== "undefined") {
      const cookies = parseCookies();
      this.accessToken = cookies.token || null;
      this.refreshToken = cookies.refreshToken || null;
    }
    this.setupAxiosInterceptors();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  removeToken(): void {
    this.accessToken = null;
    this.refreshToken = null;
    destroyCookie(null, "token", { path: "/" });
    destroyCookie(null, "refreshToken", { path: "/" });
  }

  async register(data: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Ensure phone is properly formatted with +251
      const formattedPhone = data.phone.startsWith("+251") 
        ? data.phone 
        : data.phone.startsWith("251")
          ? `+${data.phone}`
          : `+251${data.phone}`;

      // Prepare registration data
      const registerData = {
        username: data.username,
        email: data.email,
        password1: data.password1,
        password2: data.password2,
        fullname: data.fullname,
        phone: formattedPhone,
      };

      console.log("Sending registration data:", registerData);

      // Make sure endpoint path has a trailing slash
      const response = await axios.post(`${API_URL}/register/user/`, registerData);
      
      console.log("Registration response:", response.data);

      // Handle various token formats that might be returned
      if (response.data.access) {
        console.log("Found access token in response");
        this.setTokens(response.data.access, response.data.refresh || "");
        return { success: true };
      } 
      else if (response.data.key) {
        console.log("Found key token in response");
        this.setTokens(response.data.key, "");
        return { success: true };
      }
      else if (response.data.token) {
        console.log("Found token in response");
        this.setTokens(response.data.token, response.data.refresh_token || "");
        return { success: true };
      }

      // If no token was found but registration was successful, try to login
      console.log("Registration successful but no token found. Attempting login...");
      
      try {
        const loginResponse = await this.login({
          username: data.username,
          password: data.password1,
        });
        
        return loginResponse;
      } catch (loginError) {
        console.error("Auto-login after registration failed:", loginError);
        // Return success anyway since registration worked
        return {
          success: true,
          error: "Registration successful but auto-login failed",
        };
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Extract error details
      if (error.response?.data) {
        const errorMessages = [];
        
        for (const field in error.response.data) {
          if (Array.isArray(error.response.data[field])) {
            error.response.data[field].forEach((msg: string) => {
              errorMessages.push(`${field}: ${msg}`);
            });
          } else if (typeof error.response.data[field] === "string") {
            errorMessages.push(`${field}: ${error.response.data[field]}`);
          }
        }
        
        if (errorMessages.length > 0) {
          return { success: false, error: errorMessages.join(", ") };
        }
      }
      
      return {
        success: false,
        error: error.response?.data?.detail || error.message || "Registration failed"
      };
    }
  }

  async registerBusiness(businessData: BusinessData): Promise<AuthResponse> {
    try {
      if (!this.accessToken) {
        return { success: false, error: "Authentication required" };
      }

      console.log("Registering business with data:", businessData);
    
      // Make sure endpoint has trailing slash
      const response = await axios.post(`${API_URL}/register/business/`, businessData, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });

      console.log("Business registration response:", response.data);

      
      
      try {
        // Always ensure the endpoint has a trailing slash
        const response = await axios.post(`${API_URL}/register/business/`, businessData, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        });

        console.log("Business registration response:", response.data);
        return { success: true };
      } catch (apiError: any) {
        console.error("Business registration API error:", apiError.response?.data || apiError);
        
        // Check for token expiration
        if (apiError.response?.status === 401) {
          console.log("Token expired during business registration, attempting refresh...");
          const refreshed = await this.refreshAccessToken();
          
          if (refreshed) {
            console.log("Token refreshed, retrying business registration");
            // Retry with new token
            const retryResponse = await axios.post(`${API_URL}/register/business/`, businessData, {
              headers: {
                Authorization: `Bearer ${this.accessToken}`
              }
            });
            
            console.log("Business registration retry response:", retryResponse.data);
            return { success: true };
          }
        }
        
        return {
          success: false, 
          error: apiError.response?.data?.detail || "Business registration failed"
        };
      }
    } catch (error: any) {
      console.error("Business registration error:", error);
      return {
        success: false,
        error: error.message || "Business registration failed"
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log("Logging in with username:", credentials.username);

      // Always ensure endpoint has trailing slash
      const response = await axios.post<LoginResponse>(`${API_URL}/auth/token/`, credentials);

      console.log("Login response:", response.data);

      if (response.data.access) {
        this.setTokens(response.data.access, response.data.refresh || "");
        this.setupAxiosInterceptors();
        return { success: true };
      } else {
        return {
          success: false,
          error: "Login successful but no token provided"
        };
      }
    } catch (error: any) {
      console.error("Login error:", error);

      return { 
        success: false, 
        error: error.response?.data?.detail || "Invalid credentials" 
      };
    }
  }

  async fetchUserData(): Promise<User | null> {
    try {
      if (!this.accessToken) {
        console.warn("Cannot fetch user data: No token available");
        return null;
      }
      
      console.log("Fetching user data with token");
      
      try {
        // Always ensure endpoint has trailing slash
        const response = await axios.get(`${API_URL}/auth/user/`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`
          }
        });
        
        console.log("User data fetched successfully");
        this.currentUser = response.data;
        return response.data;
      } catch (apiError: any) {
        console.error("API error when fetching user data:", apiError.response?.status);
        
        if (apiError.response?.status === 401) {
          // Try to refresh the token
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry with new token
            const retryResponse = await axios.get(`${API_URL}/auth/user/`, {
              headers: {
                Authorization: `Bearer ${this.accessToken}`
              }
            });
            
            this.currentUser = retryResponse.data;
            return retryResponse.data;
          }
          
          // If refresh failed, clear tokens
          this.removeToken();
        }
        
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) {
        console.warn("Cannot refresh: No refresh token available");
        return false;
      }

      // Always ensure endpoint has trailing slash
      const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
        refresh: this.refreshToken
      });

      let newAccessToken = null;

      if (response.data.access_token) {
        newAccessToken = response.data.access_token;
      } else if (response.data.access) {
        newAccessToken = response.data.access;
      } else if (response.data.token) {
        newAccessToken = response.data.token;
      }

      if (newAccessToken) {
        this.setTokens(newAccessToken, this.refreshToken);
        console.log("Token refreshed successfully");
        return true;
      }

      console.warn("Token refresh response didn't contain a new token");
      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      this.logout();
      return false;
    }
  }

  logout(): void {
    this.removeToken();
    this.currentUser = null;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    // Set cookies with strict options
    setCookie(null, "token", accessToken, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: false, // Must be false for browser-side JavaScript
    });

    if (refreshToken) {
      setCookie(null, "refreshToken", refreshToken, {
        maxAge: 90 * 24 * 60 * 60, // 90 days
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        httpOnly: false, // Must be false for browser access
      });
    }

    console.log("Tokens set successfully");
  }

  isAuthenticated(): boolean {
    if (typeof window === "undefined") {
      const cookies = parseCookies();
      return !!cookies.token;
    }
    return !!this.accessToken;
  }

  getUser(): User | null {
    return this.currentUser;
  }

  updateUserCache(userData: User): void {
    this.currentUser = { ...this.currentUser, ...userData };
  }

  getAuthHeader(): Record<string, string> | undefined {
    return this.accessToken
      ? { Authorization: `Bearer ${this.accessToken}` }
      : undefined;
  }

  setupAxiosInterceptors(): void {
    // Remove previous interceptors if any
    axios.interceptors.request.eject(0);
    axios.interceptors.response.eject(0);

    axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token) {
          config.headers.set("Authorization", `Bearer ${token}`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshed = await this.refreshAccessToken();
          if (refreshed && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${this.getToken()}`;
            return axios(originalRequest);
          }

          if (typeof window !== "undefined") {
            this.logout();
            window.location.href = "/auth/login?expired=true";
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export const authService = AuthService.getInstance();