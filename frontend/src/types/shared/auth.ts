// @/types/shared/auth.ts

export type UserRole = "manager" | "admin" | "sales" | "warehouse";

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
  role: UserRole;
  email?: string;
  phone?: string;
}
