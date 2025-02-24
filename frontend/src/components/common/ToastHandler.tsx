'use client';
// @/components/common/ToastHandler.tsx

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function ToastHandler() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const toastType = searchParams.get('toast');
    
    if (!toastType) return;

    switch (toastType) {
      case 'auth_required':
        toast.error('Authentication Required', {
          description: 'Please log in to access this page',
          duration: 3000,
        });
        break;
      case 'already_authenticated':
        toast.warning('Already Logged In', {
          description: 'You are already authenticated',
          duration: 3000,
        });
        break;
      case 'session_expired':
        toast.error('Session Expired', {
          description: 'Please log in again',
          duration: 3000,
        });
        break;
      // Add more toast types as needed
    }
  }, [searchParams]);

  return null;
}