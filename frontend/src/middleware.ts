// @/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/auth/login', '/auth/registerUser', '/auth/registerBusiness', '/auth/forgotPassword', '/auth/resetPassword'];

// Helper function to determine landing page based on role
function getRoleLandingPage(role: string | undefined): string {
  switch (role) {
    case 'owner':
    case 'manager':
      return '/dashboard/overview';
    case 'admin':
      return '/dashboard/overview';
    case 'sales':
      return '/dashboard/orders';
    case 'warehouse':
      return '/dashboard/orders';
    default:
      return '/dashboard/overview';
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log every request for debugging
  console.log("Middleware processing:", pathname);
  
  // Check if the user has a token
  const token = request.cookies.get('token')?.value;
  console.log("Has token:", !!token);
  
  // Get user role from cookie or localStorage (if possible)
  // Note: localStorage isn't accessible in middleware, so we need to use cookies for role info
  const role = request.cookies.get('userRole')?.value;
  console.log("User role:", role);
  
  // If accessing login page but already logged in, redirect to appropriate dashboard with toast
  if (publicPaths.includes(pathname) && token) {
    const landingPage = getRoleLandingPage(role);
    console.log(`User already logged in, redirecting to ${landingPage}`);
    
    const url = new URL(landingPage, request.url);
    url.searchParams.set('toast', 'already_authenticated');
    return NextResponse.redirect(url);
  }
  
  // If accessing dashboard without being logged in, redirect to login with toast
  if (pathname.startsWith('/dashboard') && !token) {
    console.log('Unauthorized access to dashboard, redirecting to login');
    
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('toast', 'auth_required');
    return NextResponse.redirect(url);
  }
  
  // Handle initial dashboard route (redirect to appropriate role-based page)
  if (pathname === '/dashboard' && token) {
    const landingPage = getRoleLandingPage(role);
    console.log(`Redirecting to role-specific landing page: ${landingPage}`);
    return NextResponse.redirect(new URL(landingPage, request.url));
  }
  
  // For all other routes, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/dashboard/:path*',
    '/auth/login',
    '/auth/registerUser',
    '/auth/registerBusiness',
    '/auth/forgotPassword',
    '/auth/resetPassword',
  ],
};