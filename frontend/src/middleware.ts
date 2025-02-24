// @/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PUBLIC_PATHS, AUTH_ROUTES } from "@/constants/shared/routes";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get("token")?.value;

  // Helper function to check if path matches any patterns
  const matchesPath = (path: string, patterns: readonly string[]) => 
    patterns.some(pattern => path.startsWith(pattern));

  // Check path types
  const isPublicPath = matchesPath(pathname, PUBLIC_PATHS);
  const isAuthPath = matchesPath(pathname, AUTH_ROUTES);

  // Case 1: User is authenticated
  if (token) {
    // Redirect from auth pages to dashboard
    if (isAuthPath) {
      const dashboardUrl = new URL("/dashboard", request.url);
      dashboardUrl.searchParams.set("toast", "already_authenticated");
      return NextResponse.redirect(dashboardUrl);
    }
    // Allow access to all routes when authenticated
    return NextResponse.next();
  }

  // Case 2: User is not authenticated
  if (!token) {
    // Allow access to public paths
    if (isPublicPath) {
      return NextResponse.next();
    }
    
    // For any other path, redirect to login
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("toast", "auth_required");
    
    const response = NextResponse.redirect(loginUrl);
    
    // Clean up any existing auth cookies
    response.cookies.delete("token");
    response.cookies.delete("refreshToken");
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/'
  ],
};