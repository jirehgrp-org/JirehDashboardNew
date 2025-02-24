// src/constants/shared/routes.ts

// Public routes that don't require authentication
export const PUBLIC_ROUTES = {
    home: '/',
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      forgotPassword: '/auth/forgotPassword',
      resetPassword: '/auth/resetPassword',
      subscription: '/auth/subscription'
    },
    legal: {
      privacy: '/legal/privacy',
      terms: '/legal/terms'
    }
  } as const;
  
  // Routes that require authentication
  export const PROTECTED_ROUTES = {
    dashboard: {
      root: '/dashboard',
      overview: '/dashboard/overview',
      analytics: '/dashboard/analytics',
      salesReport: '/dashboard/salesReport',
      profitLoss: '/dashboard/profitLoss',
      orders: '/dashboard/orders',
      branches: '/dashboard/branches',
      categories: '/dashboard/categories',
      items: '/dashboard/items',
      expenses: '/dashboard/expenses',
      users: '/dashboard/users'
    }
  } as const;
  
  // Routes to redirect to dashboard if already authenticated
  export const AUTH_ROUTES = [
    PUBLIC_ROUTES.auth.login,
    PUBLIC_ROUTES.auth.register,
    PUBLIC_ROUTES.auth.forgotPassword,
    PUBLIC_ROUTES.auth.resetPassword,
  ] as const;
  
  // Extract all public paths for middleware
  export const PUBLIC_PATHS = [
    PUBLIC_ROUTES.home,
    ...Object.values(PUBLIC_ROUTES.auth),
    ...Object.values(PUBLIC_ROUTES.legal),
  ] as const;
  
  // Extract all protected paths for middleware
  export const PROTECTED_PATHS = [
    ...Object.values(PROTECTED_ROUTES.dashboard),
  ] as const;