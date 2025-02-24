/* eslint-disable @typescript-eslint/no-explicit-any */
// @/lib/services/auth.ts

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

  async register(data: RegisterCredentials): Promise<AuthResponse> {
    try {
      const registerData = {
        username: data.username,
        email: data.email,
        fullname: data.fullname,
        phone: data.phone,
        password1: data.password1,
        password2: data.password2,
        user_role: data.user_role || 'owner'
      };

      const response = await axios.post(`${API_URL}/registration/`, registerData);
      
      if (response.status === 201) {
        if (response.data.access) {
          this.setTokens(response.data.access, response.data.refresh);
        }
        return { success: true };
      }
      return { success: false, error: "Registration failed" };
    } catch (error: any) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        error: error.response?.data?.detail || "Registration failed"
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/token/`,
        credentials
      );
      
      const { access, refresh } = response.data;
      this.setTokens(access, refresh || '');
      
      await this.fetchUserData();
      return { success: true };
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
      const response = await axios.get(`${API_URL}/auth/user/`, {
        headers: this.getAuthHeader()
      });
      this.currentUser = response.data;
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.refreshToken) return false;

      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/token/refresh/`,
        { refresh: this.refreshToken }
      );

      const { access, refresh } = response.data;
      this.setTokens(access, refresh || this.refreshToken);
      return true;
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
      httpOnly: false // Set to false so we can access it in the middleware
    });
  
    if (refreshToken) {
      setCookie(null, 'refreshToken', refreshToken, {
        maxAge: 90 * 24 * 60 * 60, // 90 days
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        httpOnly: true
      });
    }
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
    axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const authHeader = this.getAuthHeader();
        if (authHeader) {
          config.headers.set('Authorization', authHeader.Authorization);
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
            const authHeader = this.getAuthHeader();
            if (authHeader) {
              originalRequest.headers.Authorization = authHeader.Authorization;
            }
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