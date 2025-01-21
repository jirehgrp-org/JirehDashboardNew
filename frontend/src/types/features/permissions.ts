// @/types/features/permissions.ts

type UserRole = "admin" | "sales" | "warehouse";

interface User {
  id: number;
  businessId: number;
  locationId: number;
  fullname: string;
  username: string;
  email: string;
  phone: string;
  userRole: UserRole;
  isActive: boolean;
  lastLogin: Date;
}

// hooks/features/usePermissions.ts
export function usePermissions() {
  const { user } = useAuth();

  const rolePermissions = {
    admin: ["manage_users", "manage_inventory", "view_reports"],
    sales: ["create_orders", "view_inventory"],
    warehouse: ["manage_inventory", "view_orders"],
  };

  return {
    userRole: user?.userRole,
    permissions: rolePermissions[user?.userRole] || [],
    can: (action: string) => rolePermissions[user?.userRole]?.includes(action),
  };
}
