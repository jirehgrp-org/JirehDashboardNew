// @/types/features/subscription.ts
import { Plan } from "./plan";

export type PaymentStatus = "PENDING" | "PAID" | "EXPIRED";
export type SubscriptionStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface TrialResponse {
  success: boolean;
  message?: string;
  trialEndDate?: Date;
  data?: {
    trialStarted: boolean;
    trialEndDate: Date;
  };
  error?: string;
}

export interface Subscription {
  id: number;
  businessId: number;
  planId: number;
  startDate: Date;
  endDate: Date;
  paymentStatus: PaymentStatus;
  subscriptionStatus: SubscriptionStatus;
  lastPaymentDate?: Date;
  nextBillingDate: Date;
  retryCount: number;
  lastRetryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  plan?: Plan;
}

export interface CreateSubscriptionDTO {
  businessId: number;
  planId: number;
  startDate: Date;
  paymentStatus?: PaymentStatus;
}

export interface UpdateSubscriptionDTO {
  paymentStatus?: PaymentStatus;
  subscriptionStatus?: SubscriptionStatus;
  nextBillingDate?: Date;
  retryCount?: number;
  lastRetryDate?: Date;
}

export interface SubscriptionResponse {
  data: Subscription | null;
  error?: string;
  message?: string;
}

export interface SubscriptionListResponse {
  data: Subscription[];
  total: number;
  page: number;
  limit: number;
  error?: string;
  message?: string;
}

export interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  createSubscription: (
    data: CreateSubscriptionDTO
  ) => Promise<SubscriptionResponse>;
  updateSubscription: (
    id: number,
    data: UpdateSubscriptionDTO
  ) => Promise<SubscriptionResponse>;
  cancelSubscription: (id: number) => Promise<SubscriptionResponse>;
  getSubscription: (id: number) => Promise<SubscriptionResponse>;
  refreshSubscription: () => Promise<void>;
  activateTrial: () => Promise<TrialResponse>; // Added trial activation
}