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












// /* eslint-disable @typescript-eslint/no-explicit-any */
// // hooks/shared/useAuth.ts

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { roleAccess } from "@/constants/shared/roleConstants";
// import type { LoginCredentials } from "@/types/shared/auth";
// // import { jwtDecode } from "jwt-decode";

// type UserRole = keyof typeof roleAccess;

// interface AuthUser {
//   role: UserRole;
//   username: string;
//   // Add other user fields as needed
// }

// interface TokenPayload {
//   role: UserRole;
//   username: string;
//   exp: number;
//   // Add other token payload fields as needed
// }

// interface AuthState {
//   user: AuthUser | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
// }

// interface LoginResponse {
//   success: boolean;
//   error?: string;
//   redirectTo?: string;
// }

// export const useAuth = () => {
//   const router = useRouter();
//   const [authState, setAuthState] = useState<AuthState>({
//     user: null,
//     isAuthenticated: false,
//     isLoading: true,
//   });

//   // Function to decode and validate token
//   const decodeToken = (token: string): TokenPayload | null => {
//     try {
//       const decoded = jwtDecode<TokenPayload>(token);
//       const currentTime = Math.floor(Date.now() / 1000);

//       if (decoded.exp < currentTime) {
//         return null;
//       }

//       return decoded;
//     } catch {
//       return null;
//     }
//   };

//   // Function to get the first accessible page for a role
//   const getFirstAccessiblePage = (role: UserRole): string => {
//     const pages = roleAccess[role];
//     return Object.keys(pages)[0];
//   };

//   // Initialize auth state
//   useEffect(() => {
//     const initializeAuth = () => {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         setAuthState({
//           user: null,
//           isAuthenticated: false,
//           isLoading: false,
//         });
//         return;
//       }

//       const decoded = decodeToken(token);

//       if (!decoded) {
//         localStorage.removeItem("token");
//         setAuthState({
//           user: null,
//           isAuthenticated: false,
//           isLoading: false,
//         });
//         return;
//       }

//       setAuthState({
//         user: {
//           role: decoded.role,
//           username: decoded.username,
//         },
//         isAuthenticated: true,
//         isLoading: false,
//       });
//     };

//     initializeAuth();
//   }, []);

//   const login = async (
//     credentials: LoginCredentials
//   ): Promise<LoginResponse> => {
//     try {
//       const response = await axios.post<{ access: string }>(
//         "http://127.0.0.1:8000/api/v1/auth/token/",
//         credentials
//       );

//       const { access } = response.data;
//       const decoded = decodeToken(access);

//       if (!decoded) {
//         return {
//           success: false,
//           error: "Invalid token received from server",
//         };
//       }

//       localStorage.setItem("token", access);

//       const user: AuthUser = {
//         role: decoded.role,
//         username: decoded.username,
//       };

//       setAuthState({
//         user,
//         isAuthenticated: true,
//         isLoading: false,
//       });

//       // Determine the redirect path based on user's role
//       const firstPage = getFirstAccessiblePage(decoded.role);
//       const redirectTo = `/dashboard/${firstPage}`;

//       return {
//         success: true,
//         redirectTo,
//       };
//     } catch (error: any) {
//       const message =
//         error.response?.data?.detail || "Login failed. Please try again.";
//       return { success: false, error: message };
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     setAuthState({
//       user: null,
//       isAuthenticated: false,
//       isLoading: false,
//     });
//     router.push("/auth/login");
//   };

//   // Check if user has access to a specific page
//   const hasPageAccess = (page: string): boolean => {
//     if (!authState.user) return false;
//     return page in roleAccess[authState.user.role];
//   };

//   // Refresh token function - implement if needed
//   const refreshToken = async (): Promise<boolean> => {
//     // Implement your token refresh logic here
//     return false;
//   };

//   return {
//     user: authState.user,
//     isAuthenticated: authState.isAuthenticated,
//     isLoading: authState.isLoading,
//     login,
//     logout,
//     hasPageAccess,
//     refreshToken,
//   };
// };

// // Add this type to your auth.ts types file
// export type { UserRole, AuthUser };