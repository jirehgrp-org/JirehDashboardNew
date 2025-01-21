// @/types/features/subscription.ts

interface Subscription {
  id: number;
  businessId: number;
  startDate: Date;
  endDate: Date;
  amount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'EXPIRED';
  subscriptionStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastPaymentDate: Date;
  nextBillingDate: Date;
}

// hooks/features/useSubscription.ts
export function useSubscription() {
  const { currentBusiness } = useTenant();
  
  return {
    subscription: subscriptionData,
    isActive: subscriptionData?.subscriptionStatus === 'ACTIVE',
    daysRemaining: calculateDaysRemaining(subscriptionData?.endDate),
    renewSubscription: (plan: Plan) => void
  };
}