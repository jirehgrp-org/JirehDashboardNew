// src/components/dashboard/DashboardClient.tsx
"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { SidebarDashboard } from "@/components/layout/dashboard/Sidebar";
import { SubscriptionGuard } from "@/components/features/auth/SubscriptionGuard";


export function DashboardClient({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const authToast = searchParams?.get('toast');
  
  useEffect(() => {
    if (authToast === 'already-logged-in') {
      toast.info('Already logged in', {
        description: 'You are already logged in to your account'
      });
    }
  }, [authToast]);

  return (
    <SubscriptionGuard>
    <div className="h-screen flex">
      <SidebarDashboard>{children}</SidebarDashboard>
    </div>
    </SubscriptionGuard>
  );
}