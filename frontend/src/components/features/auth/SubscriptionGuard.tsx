// components/features/auth/SubscriptionGuard.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/shared/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

// Routes that should bypass subscription check
const EXEMPT_ROUTES = [
  '/auth/subscription',
  '/auth/login',
  '/dashboard/profile',
  // Add more exempt routes as needed
];

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, checkAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    
    const checkSubscription = async () => {
      if (!isMounted) return;
      
      // Allow exempt routes to bypass subscription check
      if (EXEMPT_ROUTES.some(route => pathname?.startsWith(route))) {
        setIsChecking(false);
        return;
      }
      
      // If auth is still loading, wait for it
      if (isLoading) {
        return;
      }
      
      try {
        // If no user, try refreshing auth once before redirecting
        if (!user) {
          await checkAuth();
          
          // After refresh, if still no user, redirect to login
          if (!user && isMounted) {
            console.log("No user after auth check, redirecting to login");
            router.push("/auth/login");
            return;
          }
        }
        
        // Check for subscription status from user object
        if (user?.subscription) {
          const subscription = user.subscription;
          const isExpired = subscription.subscription_status === 'EXPIRED';
          
          if (isExpired && isMounted) {
            console.log("Subscription expired, redirecting to subscription page");
            router.push("/auth/subscription");
            return;
          }
        } else if (user?.business && !user.subscription) {
          // If user has business but no subscription, redirect to subscription page
          if (isMounted) {
            console.log("User has business but no subscription, redirecting to subscription page");
            router.push("/auth/subscription");
            return;
          }
        }
      } catch (error) {
        console.error("Error checking subscription:", error);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };
    
    checkSubscription();
    
    return () => {
      isMounted = false;
    };
  }, [user, router, pathname, isLoading, checkAuth]);

  // Show a loading spinner while checking 
  // but don't redirect immediately
  if (isChecking || isLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}