/* eslint-disable @typescript-eslint/no-explicit-any */
// @/types/features/plan.ts

export interface PlanFeature {
  title: string;
  included: boolean;
}

export interface Plan {
  isHidden: any;
  id: number;
  name_en: string;
  name_am: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  duration: number;
  description_en?: string;
  description_am?: string;
  isActive: boolean;
  features_en: PlanFeature[];
  features_am: PlanFeature[];
  createdAt: Date;
  updatedAt: Date;
}


export interface GetPlanResponse {
  data: Plan | null;
  error?: string;
  message?: string;
}

export interface GetPlansResponse {
  data: Plan[];
  error?: string;
  message?: string;
}

export interface UsePlansReturn {
  plans: Plan[];
  isLoading: boolean;
  error: string | null;
  getPlan: (id: number) => Plan | undefined;
  refetchPlans: () => Promise<void>;
}

export interface FilterPlansParams {
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

// Type for plan update operations (if needed in the future)
export interface UpdatePlanDTO {
  name?: string;
  price?: number;
  duration?: number;
  description?: string;
  isActive?: boolean;
  features?: PlanFeature[];
}

export interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  isYearly: boolean;
  onConfirm: (data: PaymentData) => void;
  isTrial?: boolean;
}

export interface PaymentData {
  paymentMethod?: string;
  reference?: string;
  total?: number;
  isYearly?: boolean;
}