// @/components/auth/RouteGuard.tsx

'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/shared/useAuth';
import { toast } from 'sonner';
import { AUTH_ROUTES, PUBLIC_PATHS } from '@/constants/shared/routes';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  
  useEffect(() => {
    // Don't check authorization until auth has loaded
    if (isLoading) return;
    
    // Check if the path is publicly accessible
    const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname?.startsWith(path));
    
    // Check if authenticated user is trying to access auth pages
    if (isAuthenticated && AUTH_ROUTES.some(route => pathname?.startsWith(route))) {
      toast.info('You are already logged in', {
        description: 'Redirecting to dashboard...',
        duration: 3000,
      });
      router.push('/dashboard');
      return;
    }
    
    // Allow authenticated users to access protected routes
    if (isAuthenticated || isPublicPath) {
      setAuthorized(true);
    } else {
      // Redirect unauthenticated users trying to access protected routes
      setAuthorized(false);
      toast.error('Authentication required', {
        description: 'Please log in to access this page',
        duration: 3000,
      });
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname || '/')}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  // Render children only when authorized
  return authorized ? <>{children}</> : null;
}