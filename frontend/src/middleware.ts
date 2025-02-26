// @/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Log every request for debugging
  console.log("Middleware processing:", pathname);
  console.log("Has token:", !!request.cookies.get('token')?.value);
  
  // Temporarily bypass all middleware rules for debugging
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/registerUser',
    '/auth/businessSetup',
  ],
};