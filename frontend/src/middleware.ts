// @/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware function
export function middleware(request: NextRequest) {
  // Get the pathname from the request
  const { pathname } = request.nextUrl;

  // Get auth token from cookie
  const token = request.cookies.get('token')?.value;

  // If no token, redirect to login with toast message
  if (!token && pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/auth/login', request.url);
    // Add a query parameter to trigger a toast
    loginUrl.searchParams.set('toast', 'auth-required');
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to continue if token exists for dashboard paths
  if (token && pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  // For logged-in users trying to access login or register, redirect to dashboard
  if (token && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    const dashboardUrl = new URL('/dashboard/overview', request.url);
    // Add a query parameter to trigger a toast
    dashboardUrl.searchParams.set('toast', 'already-logged-in');
    return NextResponse.redirect(dashboardUrl);
  }

  // For all other cases, just continue
  return NextResponse.next();
}

// Matching paths that should run the middleware
export const config = {
  matcher: [
    // Match all dashboard routes
    '/dashboard/:path*',
    // Match auth routes
    '/auth/login',
    '/auth/register',
  ],
};