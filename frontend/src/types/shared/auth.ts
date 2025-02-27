/* eslint-disable @typescript-eslint/no-explicit-any */
// @/types/shared/auth.ts

export type UserRole = "owner" | "manager" | "admin" | "sales" | "warehouse";
export interface SectionLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface Section {
  label: string;
  links: SectionLink[];
}

export interface UserRoleInfo {
  title: string;
  description: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password1: string;
  password2: string;
  fullname: string; 
  phone: string;
  user_role?: string;
}

export interface LoginResponse {
  access_token: any;
  refresh_token: string;
  token: any;
  key: any;
  access: string;
  refresh?: string;
}

export interface PageInfo {
  icon: React.ComponentType;
  label: string;
  section: string;
}

export interface User {
  business: User;
  subscription: any;
  id: string;
  username: string;
  email: string;
  fullname: string;
  phone: string;
  role: UserRole;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  warning?: string;
  data?: any;
}

export interface BusinessData {
  name: string;
  address_street: string;
  address_city: string;
  address_country: string;
  contact_number: string;
  registration_number: string;
  owner?: string | null;
  admin?: string | null;
}

export interface UseAuthReturn {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  register: (data: RegisterCredentials) => Promise<AuthResponse>;
  registerBusiness: (businessData: BusinessData) => Promise<AuthResponse>;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
}