/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @/lib/services/auth.ts - Enhanced version with better error handling

import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { parseCookies, setCookie, destroyCookie } from 'nookies';
import type { 
  User, 
  LoginCredentials, 
  RegisterCredentials,
  LoginResponse,
  AuthResponse 
} from '@/types/shared/auth';

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
    destroyCookie(null, 'token', { path: '/' });
    destroyCookie(null, 'refreshToken', { path: '/' });
  }

  // Update the register method in AuthService to properly extract and handle JWT tokens

async register(data: RegisterCredentials): Promise<AuthResponse> {
  try {
    // Simplify registration data to match API expectations
    const registerData = {
      username: data.username,
      email: data.email,
      password1: data.password1,
      password2: data.password2,
      fullname: data.fullname,
      phone: data.phone.startsWith("+251") ? data.phone : `+251${data.phone}`
    };
    
    console.log("Sending registration data:", registerData);
    
    try {
      const response = await axios.post(`${API_URL}/register/user`, registerData);
      console.log("Registration successful. Raw response:", response);
      
      if (response.status === 201 || response.status === 200) {
        console.log("Registration successful. Response data:", response.data);
        
        // Based on your API, we need to look for the correct token format
        // DRF Simple JWT typically returns 'access' and 'refresh' tokens
        if (response.data.access) {
          console.log("Found 'access' token in response");
          this.setTokens(response.data.access, response.data.refresh || "");
          this.setupAxiosInterceptors(); // Reset interceptors with new token
          return { success: true };
        } 
        // dj-rest-auth might return a key
        else if (response.data.key) {
          console.log("Found 'key' token in response");
          this.setTokens(response.data.key, "");
          this.setupAxiosInterceptors();
          return { success: true };
        }
        // Check for other token formats
        else if (response.data.token) {
          console.log("Found 'token' in response");
          this.setTokens(response.data.token, response.data.refresh_token || "");
          this.setupAxiosInterceptors();
          return { success: true };
        }
        
        // If we couldn't find a token but registration was successful,
        // we can try to login immediately to get the token
        console.log("Registration successful but no token found. Attempting login...");
        
        try {
          const loginResponse = await this.login({
            username: data.username,
            password: data.password1
          });
          
          return loginResponse;
        } catch (loginError) {
          console.error("Auto-login after registration failed:", loginError);
          // Still return success since registration worked
          return { success: true, error: "Registration successful but auto-login failed" };
        }
      }
      
      return { success: false, error: "Unknown registration error" };
    } catch (axiosError: any) {
      // Error handling code as before
      console.error("Axios error during registration:", axiosError);
      
      if (axiosError.response) {
        console.error("Server response status:", axiosError.response.status);
        console.error("Server response data:", axiosError.response.data);
        
        // Extract detailed validation errors if available
        if (axiosError.response.data) {
          const errorMessages = [];
          
          for (const field in axiosError.response.data) {
            if (Array.isArray(axiosError.response.data[field])) {
              axiosError.response.data[field].forEach((msg: string) => {
                errorMessages.push(`${field}: ${msg}`);
              });
            } else if (typeof axiosError.response.data[field] === 'string') {
              errorMessages.push(`${field}: ${axiosError.response.data[field]}`);
            }
          }
          
          if (errorMessages.length > 0) {
            return { success: false, error: errorMessages.join(', ') };
          }
        }
        
        return { 
          success: false, 
          error: axiosError.response.data?.detail || 
                axiosError.response.data?.non_field_errors?.[0] || 
                "Registration failed with errors" 
        };
      } else if (axiosError.request) {
        console.error("No response received:", axiosError.request);
        return { success: false, error: "No response from server" };
      } else {
        console.error("Error setting up request:", axiosError.message);
        return { success: false, error: axiosError.message };
      }
    }
  } catch (error: any) {
    console.error("Unexpected registration error:", error);
    return { success: false, error: error.message || "Registration failed" };
  }
}

  async registerBusiness(businessData: any): Promise<AuthResponse> {
    try {
      if (!this.accessToken) {
        return { success: false, error: "Authentication required" };
      }
      
      console.log("Registering business with data:", businessData);
      console.log("Using token:", this.accessToken.substring(0, 10) + "...");
  
      // Use the direct fetch method for more control
      const response = await fetch(`${API_URL}/register/business`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(businessData)
      });
      
      const responseText = await response.text();
      console.log("Business registration response:", responseText);
      
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.warn("Could not parse response as JSON:", responseText);
        responseData = {};
      }
      
      if (response.ok) {
        return { success: true };
      }
      
      return { 
        success: false, 
        error: responseData?.detail || `Business registration failed with status ${response.status}` 
      };
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
      console.log("Logging in with:", { username: credentials.username });
      
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/token/`,
        credentials
      );
      
      console.log("Login response:", response.data);
      
      if (response.data.access) {
        this.setTokens(response.data.access, response.data.refresh || "");
        this.setupAxiosInterceptors(); // Reset interceptors with new token
        
        return { success: true };
      } else {
        return { success: false, error: "Login successful but no token provided" };
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.response) {
        return { 
          success: false, 
          error: error.response.data?.detail || "Invalid credentials" 
        };
      }
      
      return { success: false, error: error.message || "Login failed" };
    }
  }

  async fetchUserData(): Promise<User | null> {
    try {
      if (!this.accessToken) {
        console.error("No token available when fetching user data");
        return null;
      }
      
      console.log("Fetching user data with token:", this.accessToken.substring(0, 10) + "...");
      
      // Use the correct endpoint from your backend
      const userEndpoint = `${API_URL}/auth/user/`;
      
      console.log(`Trying to fetch user data from ${userEndpoint}`);
      
      try {
        const response = await fetch(userEndpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log("User data fetched successfully:", userData);
          console.log("Raw user data from API:", userData);
          this.currentUser = userData;
          return userData;
        } else {
          const errorText = await response.text();
          console.error(`Error fetching user data: ${response.status}`, errorText);
        }
      } catch (error) {
        console.error(`Error with endpoint ${userEndpoint}:`, error);
      }
      
      console.error("Could not fetch user data from endpoint");
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) return false;

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
        return true;
      }
      
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
    setCookie(null, 'token', accessToken, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      httpOnly: false // Must be false for browser-side JavaScript
    });
  
    if (refreshToken) {
      setCookie(null, 'refreshToken', refreshToken, {
        maxAge: 90 * 24 * 60 * 60, // 90 days
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        httpOnly: false // Change to false to avoid the error
      });
    }
    
    console.log("Tokens set successfully. Access token:", !!this.accessToken);
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      const cookies = parseCookies();
      return !!cookies.token;
    }
    return !!this.accessToken;
  }

  getUser(): User | null {
    return this.currentUser;
  }

  getAuthHeader(): Record<string, string> | undefined {
    return this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : undefined;
  }

  setupAxiosInterceptors(): void {
    // Remove previous interceptors if any
    axios.interceptors.request.eject(0);
    axios.interceptors.response.eject(0);
    
    axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token) {
          config.headers.set('Authorization', `Bearer ${token}`);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshed = await this.refreshAccessToken();
          if (refreshed && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${this.getToken()}`;
            return axios(originalRequest);
          }

          if (typeof window !== 'undefined') {
            this.logout();
            window.location.href = '/auth/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export const authService = AuthService.getInstance();