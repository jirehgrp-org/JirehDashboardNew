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
  BusinessData,
} from "@/types/shared/auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

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
        role: data.user_role || "owner",
      };

      console.log("Sending registration data:", registerData);

      // Make sure endpoint path has a trailing slash
      const response = await axios.post(
        `${API_URL}/register/user/`,
        registerData
      );

      console.log("Registration response:", response.data);

      // Handle various token formats that might be returned
      let tokenFound = false;

      if (response.data.access) {
        console.log("Found access token in response");
        this.setTokens(response.data.access, response.data.refresh || "");
        tokenFound = true;
      } else if (response.data.key) {
        console.log("Found key token in response");
        this.setTokens(response.data.key, "");
        tokenFound = true;
      } else if (response.data.token) {
        console.log("Found token in response");
        this.setTokens(response.data.token, response.data.refresh_token || "");
        tokenFound = true;
      }

      // If no token was found but registration was successful, try to login automatically
      if (!tokenFound) {
        console.log(
          "Registration successful but no token found. Attempting auto-login..."
        );

        try {
          const loginResponse = await this.login({
            username: data.username,
            password: data.password1,
          });

          if (!loginResponse.success) {
            console.warn("Auto-login failed after registration");
            return {
              success: true,
              warning:
                "Account created, but auto-login failed. Please log in manually.",
            };
          }

          tokenFound = true;
        } catch (loginError) {
          console.error("Auto-login after registration failed:", loginError);
          // Return success anyway since registration worked
          return {
            success: true,
            warning:
              "Registration successful but auto-login failed. Please log in manually.",
          };
        }
      }

      if (tokenFound) {
        try {
          console.log("Token found, attempting to fetch user data");
          const userData = await this.fetchUserData();
          console.log(
            "User data fetch result:",
            userData ? "SUCCESS" : "FAILED"
          );

          if (!userData) {
            console.warn("Token is valid but fetchUserData returned null");
          }
        } catch (fetchError) {
          console.error(
            "Error fetching user data after registration:",
            fetchError
          );
        }
      }

      return { success: true };
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
        error:
          error.response?.data?.detail ||
          error.message ||
          "Registration failed",
      };
    }
  }

  async registerBusiness(businessData: BusinessData): Promise<AuthResponse> {
    try {
      // Check for token
      if (!this.accessToken) {
        console.error("Cannot register business: No access token");
        return {
          success: false,
          error: "Authentication required. Please log in first.",
        };
      }

      console.log(
        "Using access token for business registration:",
        this.accessToken.substring(0, 10) + "..."
      );

      // Format phone number
      const formattedBusinessData = {
        ...businessData,
        contact_number: businessData.contact_number.startsWith("+251")
          ? businessData.contact_number
          : businessData.contact_number.startsWith("251")
          ? `+${businessData.contact_number}`
          : `+251${businessData.contact_number}`,
      };

      console.log("Sending business registration data:", formattedBusinessData);

      // Make the API request
      try {
        const response = await axios.post(
          `${API_URL}/register/business/`,
          formattedBusinessData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );

        console.log("Business registration successful:", response.data);

        // After business is registered, update user data
        await this.fetchUserData();

        return { success: true, data: response.data };
      } catch (apiError: any) {
        console.error("Business registration API error:");
        console.error("Status:", apiError.response?.status);
        console.error("Data:", apiError.response?.data);

        // Handle token expiration
        if (apiError.response?.status === 401) {
          console.log(
            "Token expired during business registration, attempting refresh..."
          );
          const refreshed = await this.refreshAccessToken();

          if (refreshed) {
            console.log("Token refreshed, retrying business registration");
            // Retry with new token
            try {
              const retryResponse = await axios.post(
                `${API_URL}/register/business/`,
                formattedBusinessData,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.accessToken}`,
                  },
                }
              );

              console.log(
                "Business registration retry successful:",
                retryResponse.data
              );

              // After business is registered on retry, update user data
              await this.fetchUserData();

              return { success: true, data: retryResponse.data };
            } catch (retryError: any) {
              console.error("Business registration retry failed:", retryError);

              // Extract detailed error message
              const errorDetail =
                retryError.response?.data?.detail ||
                "Business registration failed after token refresh";

              return { success: false, error: errorDetail };
            }
          } else {
            return {
              success: false,
              error:
                "Your session has expired. Please log in again before registering a business.",
            };
          }
        }

        // Process error response for better user feedback
        let errorMessage = "Business registration failed";

        if (apiError.response?.data) {
          if (typeof apiError.response.data === "string") {
            errorMessage = apiError.response.data;
          } else if (apiError.response.data.detail) {
            errorMessage = apiError.response.data.detail;
          } else {
            // Try to extract field-specific errors
            const fieldErrors = [];
            for (const field in apiError.response.data) {
              if (Array.isArray(apiError.response.data[field])) {
                fieldErrors.push(
                  `${field}: ${apiError.response.data[field].join(", ")}`
                );
              } else if (typeof apiError.response.data[field] === "string") {
                fieldErrors.push(`${field}: ${apiError.response.data[field]}`);
              }
            }

            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join("; ");
            }
          }
        }

        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.error("Business registration error:", error);
      return {
        success: false,
        error: error.message || "Business registration failed",
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log("Logging in with username:", credentials.username);

      // Always ensure endpoint has trailing slash
      const response = await axios.post<LoginResponse>(
        `${API_URL}/auth/token/`,
        credentials
      );

      console.log("Login response:", response.data);

      if (response.data.access) {
        this.setTokens(response.data.access, response.data.refresh || "");
        this.setupAxiosInterceptors();
        return { success: true };
      } else {
        return {
          success: false,
          error: "Login successful but no token provided",
        };
      }
    } catch (error: any) {
      console.error("Login error:", error);

      return {
        success: false,
        error: error.response?.data?.detail || "Invalid credentials",
      };
    }
  }

  async fetchUserData(): Promise<User | null> {
    try {
      if (!this.accessToken) {
        console.warn("Cannot fetch user data: No token available");
        return null;
      }

      console.log(
        "Fetching user data with token:",
        this.accessToken.substring(0, 10) + "..."
      );

      try {
        console.log("API endpoint for user data:", `${API_URL}/auth/user/`);

        const response = await axios.get(`${API_URL}/auth/user/`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        });

        console.log("User data response status:", response.status);
        console.log("User data received:", response.data);

        this.currentUser = response.data;
        return response.data;
      } catch (apiError: any) {
        console.error("API error when fetching user data:");
        console.error("Status:", apiError.response?.status);
        console.error("Response:", apiError.response?.data);

        if (apiError.response?.status === 401) {
          // Try to refresh the token
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry with new token
            const retryResponse = await axios.get(`${API_URL}/auth/user/`, {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
              },
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
        refresh: this.refreshToken,
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
      maxAge: 2 * 60 * 60, // 2 hours
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from "strict"
      httpOnly: false,
    });

    if (refreshToken) {
      setCookie(null, "refreshToken", refreshToken, {  // Fixed name and value
        maxAge: 2 * 60 * 60, // 2 hours
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        httpOnly: false,
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

          // Instead of redirecting, just log the error
          console.error("Token validation failed and refresh was unsuccessful");
          // Only redirect if it's not during registration flow
          const isRegisterFlow =
            window.location.pathname.includes("/auth/register") ||
            window.location.pathname.includes("/auth/businessSetup");
          if (!isRegisterFlow && typeof window !== "undefined") {
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
