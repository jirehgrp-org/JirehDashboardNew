// src/lib/services/auth.ts
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/v1";

export interface RegisterData {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password1: string;
  password2: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh?: string;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;

  private constructor() {
    // Initialize token from localStorage if it exists
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(data: RegisterData): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/registration/`, data);
      return response.status === 201;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async login(data: LoginData): Promise<boolean> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/token/`,
        data
      );
      const token = response.data.access;
      this.setToken(token);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  logout(): void {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private setToken(token: string): void {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Add this to your axios interceptors or API client setup
  getAuthHeader(): Record<string, string> | undefined {
    return this.token ? { Authorization: `Bearer ${this.token}` } : undefined;
  }
}

export const authService = AuthService.getInstance();
