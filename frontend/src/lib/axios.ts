// @/lib/axios.ts

import axios, { InternalAxiosRequestConfig } from 'axios';
import { authService } from './services/auth';

// Create a custom instance to avoid polluting the global axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1",
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authService.getToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if the error is due to an expired token
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshed = await authService.refreshAccessToken();
        if (refreshed) {
          // Update the Authorization header with the new token
          originalRequest.headers['Authorization'] = `Bearer ${authService.getToken()}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
      }
      
      // If we reach here, refresh failed, so log out
      authService.removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?expired=true';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;