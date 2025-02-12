// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};










// /* eslint-disable @typescript-eslint/no-unused-vars */
// // middleware.ts

// // import { jwtDecode } from "jwt-decode";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { roleAccess } from "@/constants/shared/roleConstants";

// type UserRole = keyof typeof roleAccess;

// interface DecodedToken {
//   exp: number;
//   role: UserRole;
//   // Add other token payload fields as needed
// }

// export function middleware(request: NextRequest) {
//   const token = request.cookies.get("token");
//   const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

//   // If no token and trying to access protected routes, redirect to login
//   if (!token) {
//     if (isAuthPage) {
//       return NextResponse.next();
//     }
//     return NextResponse.redirect(new URL("/auth/login", request.url));
//   }

//   try {
//     // Decode the token (implement your token decoding logic here)
//     // This is a placeholder - replace with your actual token decoding
//     const decodedToken = decodeToken(token.value) as DecodedToken;
//     const userRole = decodedToken.role;

//     // If authenticated user tries to access auth pages, redirect to dashboard
//     if (isAuthPage) {
//       return NextResponse.redirect(new URL("/dashboard", request.url));
//     }

//     // Get the current page from the URL
//     const currentPath = request.nextUrl.pathname.split("/").pop() || "overview";

//     // Check if the user has access to the current page based on their role
//     const hasAccess = checkPageAccess(userRole, currentPath);

//     if (!hasAccess) {
//       // Redirect to the first accessible page for their role
//       const firstAccessiblePage = getFirstAccessiblePage(userRole);
//       return NextResponse.redirect(
//         new URL(`/dashboard/${firstAccessiblePage}`, request.url)
//       );
//     }

//     return NextResponse.next();
//   } catch (error) {
//     // If token is invalid, clear it and redirect to login
//     const response = NextResponse.redirect(new URL("/auth/login", request.url));
//     response.cookies.delete("token");
//     return response;
//   }
// }

// // Helper function to check if a user has access to a specific page
// function checkPageAccess(role: UserRole, page: string): boolean {
//   const allowedPages = roleAccess[role];
//   return Object.keys(allowedPages).includes(page);
// }

// // Helper function to get the first accessible page for a role
// function getFirstAccessiblePage(role: UserRole): string {
//   const allowedPages = roleAccess[role];
//   return Object.keys(allowedPages)[0];
// }

// // Placeholder function for token decoding - replace with your implementation
// function decodeToken(token: string): DecodedToken {
//   try {
//     const decoded = jwtDecode<DecodedToken>(token);
//     const currentTime = Math.floor(Date.now() / 1000);

//     if (decoded.exp < currentTime) {
//       throw new Error("Token expired");
//     }

//     return decoded;
//   } catch (error) {
//     throw new Error("Invalid token");
//   }
// }

// export const config = {
//   matcher: [
//     "/dashboard/:path*",
//     "/auth/:path*",
//     // Add other protected routes as needed
//   ],
// };
