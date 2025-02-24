// @/components/auth/RouteGuard.tsx

'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/shared/useAuth';
import { toast } from 'sonner';
import { AUTH_ROUTES } from '@/constants/shared/routes';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Check for authenticated users trying to access auth pages
      if (isAuthenticated && AUTH_ROUTES.some(route => pathname?.startsWith(route))) {
        toast.error('You are already logged in', {
          description: 'Redirecting to dashboard...',
          duration: 3000,
        });
        router.push('/dashboard');
        return;
      }

      // Check for unauthenticated users
      if (!isAuthenticated) {
        toast.error('Authentication required', {
          description: 'Please log in to access this page',
          duration: 3000,
        });
        router.push(`/auth/login?callbackUrl=${pathname}`);
      }
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return isAuthenticated ? <>{children}</> : null;
}