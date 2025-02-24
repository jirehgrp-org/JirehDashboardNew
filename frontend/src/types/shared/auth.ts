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
  access: string;
  refresh?: string;
}

export interface PageInfo {
  icon: React.ComponentType;
  label: string;
  section: string;
}

export interface User {
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
}