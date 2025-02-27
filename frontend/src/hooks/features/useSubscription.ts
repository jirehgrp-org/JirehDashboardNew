/* eslint-disable @typescript-eslint/no-explicit-any */
// @/hooks/features/useSubscription.ts

import { useState, useCallback } from "react";
import api from "@/lib/axios";
import {
  Subscription,
  SubscriptionResponse,
  CreateSubscriptionDTO,
  TrialResponse,
} from "@/types/features/subscription";

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSubscription = useCallback(async (): Promise<any> => {
    try {
      setIsLoading(true);
      const response = await api.get('/subscription/status/');
      
      if (response.data.has_subscription) {
        setSubscription(response.data.subscription);
      } else {
        setSubscription(null);
      }
      
      setError(null);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch subscription';
      setError(errorMessage);
      console.error('Error fetching subscription:', err);
      return { 
        has_subscription: false, 
        message: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSubscription = async (data: CreateSubscriptionDTO): Promise<SubscriptionResponse> => {
    try {
      setIsLoading(true);
      // Corrected endpoint - remove 'api/' prefix
      const response = await api.post('/subscription/renew/', {
        plan_id: data.planId,
        // Other required data
      });
      
      setSubscription(response.data);
      setError(null);
      return { data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to create subscription';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const renewSubscription = async (planId: number, paymentMethod: string): Promise<SubscriptionResponse> => {
    try {
      setIsLoading(true);
      const response = await api.post('/subscription/renew/', {
        plan_id: planId,
        payment_method: paymentMethod
      });
      
      setSubscription(response.data);
      setError(null);
      return { data: response.data };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to renew subscription';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const activateTrial = async (): Promise<TrialResponse> => {
    try {
      setIsLoading(true);
      const response = await api.post('/subscription/renew/', {
        is_trial: true
      });
      
      setSubscription(response.data);
      return {
        success: true,
        message: "Trial activated successfully",
        data: response.data
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to activate trial';
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSubscription = useCallback(async (): Promise<void> => {
    await getSubscription();
  }, [getSubscription]);

  return {
    subscription,
    isLoading,
    error,
    getSubscription,
    createSubscription,
    renewSubscription,
    activateTrial,
    refreshSubscription
  };
};