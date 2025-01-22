// @/hooks/features/useSubscription.ts

import { useState, useCallback } from "react";
import {
  Subscription,
  SubscriptionResponse,
  CreateSubscriptionDTO,
  UpdateSubscriptionDTO,
  TrialResponse,
} from "@/types/features/subscription";
import { usePlans } from "./usePlan";

interface UseSubscriptionProps {
  businessId?: number;
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
  createSubscription: (
    data: CreateSubscriptionDTO
  ) => Promise<SubscriptionResponse>;
  activateTrial: () => Promise<TrialResponse>;
  updateSubscription: (
    id: number,
    data: UpdateSubscriptionDTO
  ) => Promise<SubscriptionResponse>;
  cancelSubscription: (id: number) => Promise<SubscriptionResponse>;
  getSubscription: (id: number) => Promise<SubscriptionResponse>;
  refreshSubscription: () => Promise<void>;
}

// Mock subscriptions data
const MOCK_SUBSCRIPTIONS: Record<number, Subscription> = {
  1: {
    id: 1,
    businessId: 1,
    planId: 1,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    paymentStatus: "PAID",
    subscriptionStatus: "ACTIVE",
    lastPaymentDate: new Date("2024-01-01"),
    nextBillingDate: new Date("2024-02-01"),
    retryCount: 0,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
};

export const useSubscription = ({
  businessId,
}: UseSubscriptionProps = {}): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getPlan } = usePlans();

  const fetchSubscription = useCallback(async () => {
    if (!businessId) return;

    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockSubscription = MOCK_SUBSCRIPTIONS[businessId];

      if (!mockSubscription) {
        throw new Error("Subscription not found");
      }

      // Attach plan data to subscription
      const plan = getPlan(mockSubscription.planId);
      setSubscription({ ...mockSubscription, plan });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [businessId, getPlan]);

  const createSubscription = async (
    data: CreateSubscriptionDTO
  ): Promise<SubscriptionResponse> => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const plan = getPlan(data.planId);
      if (!plan) {
        throw new Error("Plan not found");
      }

      const newSubscription: Subscription = {
        id: Date.now(),
        businessId: data.businessId,
        planId: data.planId,
        startDate: data.startDate,
        endDate: new Date(data.startDate.getTime() + 365 * 24 * 60 * 60 * 1000),
        paymentStatus: data.paymentStatus || "PENDING",
        subscriptionStatus: "INACTIVE",
        nextBillingDate: new Date(
          data.startDate.getTime() + 30 * 24 * 60 * 60 * 1000
        ),
        retryCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        plan,
      };

      setSubscription(newSubscription);
      return { data: newSubscription };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to create subscription";
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const activateTrial = async (): Promise<TrialResponse> => {
    try {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if there's an existing active subscription
      if (subscription?.subscriptionStatus === "ACTIVE") {
        throw new Error("You already have an active subscription");
      }

      // Calculate trial end date (15 days from now)
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 15);

      // Create trial response with success
      const trialResponse: TrialResponse = {
        success: true,
        message: "Trial activated successfully",
        trialEndDate: trialEndDate,
        data: {
          trialStarted: true,
          trialEndDate: trialEndDate,
        },
      };

      // Update subscription state with trial information
      const trialSubscription: Subscription = {
        id: Date.now(),
        businessId: businessId || 0,
        planId: 1, // Assuming trial uses basic plan ID
        startDate: new Date(),
        endDate: trialEndDate,
        paymentStatus: "PENDING",
        subscriptionStatus: "ACTIVE",
        nextBillingDate: trialEndDate,
        retryCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSubscription(trialSubscription);
      return trialResponse;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to activate trial";

      // Return error response with properly typed data field
      return {
        success: false,
        message: errorMessage,
        error: errorMessage,
        // Don't include the data field when there's an error
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateSubscription = async (
    id: number,
    data: UpdateSubscriptionDTO
  ): Promise<SubscriptionResponse> => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!subscription) {
        throw new Error("No subscription found to update");
      }

      const updatedSubscription = {
        ...subscription,
        ...data,
        updatedAt: new Date(),
      };

      setSubscription(updatedSubscription);
      return { data: updatedSubscription };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to update subscription";
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (): Promise<SubscriptionResponse> => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (!subscription) {
        throw new Error("No subscription found to cancel");
      }

      const canceledSubscription = {
        ...subscription,
        subscriptionStatus: "INACTIVE" as const,
        updatedAt: new Date(),
      };

      setSubscription(canceledSubscription);
      return { data: canceledSubscription };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to cancel subscription";
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscription = async (id: number): Promise<SubscriptionResponse> => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockSubscription = MOCK_SUBSCRIPTIONS[id];
      if (!mockSubscription) {
        throw new Error("Subscription not found");
      }

      // Attach plan data to subscription
      const plan = getPlan(mockSubscription.planId);
      return { data: { ...mockSubscription, plan } };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to fetch subscription";
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscription = async (): Promise<void> => {
    await fetchSubscription();
  };

  return {
    subscription,
    isLoading,
    error,
    createSubscription,
    activateTrial,
    updateSubscription,
    cancelSubscription,
    getSubscription,
    refreshSubscription,
  };
};
