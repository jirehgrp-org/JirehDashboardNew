/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @/hooks/features/usePlan.ts

import { useState, useCallback, useEffect } from "react";
import api from "@/lib/axios";
import { Plan, UsePlansReturn, GetPlansResponse } from "@/types/features/plan";

export const usePlans = (): UsePlansReturn => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch features for a specific plan
  const fetchFeaturesForPlan = async (planId: number) => {
    try {
      const response = await api.get(`/features/list/?plan_id=${planId}`);
      return response.data || [];
    } catch (err) {
      console.error(`Error fetching features for plan ${planId}:`, err);
      return [];
    }
  };

  // Transform the server plan format to client format
  const transformPlan = async (serverPlan: any): Promise<Plan> => {
    try {
      // Fetch features for this specific plan
      const featuresResponse = await api.get(`/features/list/?plan_id=${serverPlan.id}`);
      const features = featuresResponse.data || [];
      
      console.log(`Fetched ${features.length} features for plan: ${serverPlan.name_en}`, features);
      
      return {
        id: serverPlan.id,
        name_en: serverPlan.name_en,
        name_am: serverPlan.name_am,
        monthlyPrice: serverPlan.monthly_price,
        yearlyPrice: serverPlan.yearly_price,
        duration: serverPlan.duration,
        description_en: serverPlan.description_en,
        description_am: serverPlan.description_am,
        isActive: serverPlan.is_active,
        isHidden: serverPlan.is_hidden,
        features_en: features.filter((f: any) => f.title_en).map((f: any) => ({
          title: f.title_en,
          included: f.included
        })) || [],
        features_am: features.filter((f: any) => f.title_am).map((f: any) => ({
          title: f.title_am, 
          included: f.included
        })) || [],
        createdAt: new Date(serverPlan.created_at),
        updatedAt: new Date(serverPlan.updated_at)
      };
    } catch (error) {
      console.error(`Error transforming plan ${serverPlan.id}:`, error);
      // Return plan without features in case of error
      return {
        id: serverPlan.id,
        name_en: serverPlan.name_en,
        name_am: serverPlan.name_am,
        monthlyPrice: serverPlan.monthly_price,
        yearlyPrice: serverPlan.yearly_price,
        duration: serverPlan.duration,
        description_en: serverPlan.description_en,
        description_am: serverPlan.description_am,
        isActive: serverPlan.is_active,
        isHidden: serverPlan.is_hidden,
        features_en: [],
        features_am: [],
        createdAt: new Date(serverPlan.created_at),
        updatedAt: new Date(serverPlan.updated_at)
      };
    }
  };

  // Fetch plans from Django backend
  const fetchPlans = async (): Promise<GetPlansResponse> => {
    try {
      setIsLoading(true);
      const response = await api.get('/plans/list/');
      
      // Transform plans with their features (this is now async)
      const transformPromises = response.data.map(transformPlan);
      const transformedPlans = await Promise.all(transformPromises);
      
      // Cache the plans in state
      setPlans(transformedPlans);
      setError(null);
      
      return { data: transformedPlans };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch plans';
      setError(errorMessage);
      console.error('Error fetching plans:', err);
      return { data: [], error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const getPlan = useCallback(
    (id: number) => {
      return plans.find((plan) => plan.id === id);
    },
    [plans]
  );

  const refetchPlans = async () => {
    await fetchPlans();
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  return {
    plans,
    isLoading,
    error,
    getPlan,
    refetchPlans,
  };
};