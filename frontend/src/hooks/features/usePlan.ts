// @/hooks/features/usePlans.ts

import { useState, useCallback } from "react";
import { Plan, UsePlansReturn, GetPlansResponse } from "@/types/features/plan";

// Mock Data
const MOCK_PLANS: Plan[] = [
  {
    id: 1,
    name_en: "Business",
    name_am: "ለቢዝነስ",
    monthlyPrice: 5000,
    yearlyPrice: 50400,
    duration: 30,
    description_en:
      "Perfect for businesses wanting advanced features, unlimited storage, and businesses support.",
    description_am: "ለቢዝነሶች ተዘጋጅቶ የተጨመሩ ባህሪያት፣ ያልተገደበ ይዘት፣ እና የቢዝነስ ድጋፍ የያዘ።",
    isActive: true,
    isHidden: false,
    features_en: [
      { title: "Unlimited locations", included: true },
      { title: "Unlimited accounts", included: true },
      { title: "Real-time inventory sync", included: true },
      { title: "businesses analytics dashboard", included: true },
      { title: "Email support", included: true },
      { title: "businesses reporting", included: true },
      { title: "Unlimited storage", included: true },
      { title: "businesses security features", included: true },
      { title: "businesses employee management", included: true },
      { title: "Manual operations", included: true },
    ],
    features_am: [
      { title: "ያልተገደበ ቦታዎች", included: true },
      { title: "ያልተገደበ አካውንቶች", included: true },
      { title: "ፈጣን የክምችት ይዘት", included: true },
      { title: "የቢዝነሶች ትንተና", included: true },
      { title: "የኢሜይል ድጋፍ", included: true },
      { title: "የቢዝነሶች ሪፖርት", included: true },
      { title: "ያልተገደበ ቦታ", included: true },
      { title: "የቢዝነሶች ደህንነት ባህሪ", included: true },
      { title: "የቢዝነሶች የሰራተኛ አስተዳደር", included: true },
      { title: "አካላዊ ሥራ ክዋኔዎች", included: true },
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: 2,
    name_en: "Enterprise",
    name_am: "ለኩባንያዎች",
    duration: 30,
    description_en:
      "Full-featured solution for large enterprises with businesses support.",
    description_am: "ማበርከት የምንችለውን ሙሉ ባህሪያት ይዞ ለትልቅ ኩባንያዎች ከፕሪሚየም ድጋፍ ጋር",
    isActive: true,
    isHidden: false,
    features_en: [
      { title: "Everything in Business", included: true },
      { title: "Advanced employee management", included: true },
      { title: "High level security", included: true },
      { title: "Bulk operations", included: true },
      { title: "Integration capabilities", included: true },
      { title: "Automated notifications", included: true },
    ],
    features_am: [
      { title: "በቢዝነስ ያለው ባህሪያት ሁሉ", included: true },
      { title: "የላቀ የሰራተኛ አስተዳደር", included: true },
      { title: "ከፍተኛ ደረጃ ደህንነት", included: true },
      { title: "ጅምላ ክዋኔዎች", included: true },
      { title: "የውህደት አቅም", included: true },
      { title: "ራስ-ሰር ማሳወቂያዎች", included: true },
    ],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

export const usePlans = (): UsePlansReturn => {
  const [plans, setPlans] = useState<Plan[]>(MOCK_PLANS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async (): Promise<GetPlansResponse> => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filter out hidden plans
      const visiblePlans = MOCK_PLANS.filter((plan) => !plan.isHidden);
      return { data: visiblePlans };
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to fetch plans";
      return { data: [], error };
    } finally {
      setIsLoading(false);
    }
  };

  const refetchPlans = async () => {
    const response = await fetchPlans();
    if (response.error) {
      setError(response.error);
    } else {
      setPlans(response.data);
      setError(null);
    }
  };

  const getPlan = useCallback(
    (id: number) => {
      return plans.find((plan) => plan.id === id);
    },
    [plans]
  );

  return {
    plans,
    isLoading,
    error,
    getPlan,
    refetchPlans,
  };
};
