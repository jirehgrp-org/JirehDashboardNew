// @/types/features/operation.ts

import { z } from "zod";
import { Column } from "@/types/shared/table";
import { UserSchema, ExpenseSchema } from "@/lib/schemas/operation";

export type FormVariant = "user" | "expense";

export interface OperationItem {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  locationId: string;

  // User fields
  username?: string;
  email?: string;
  phone?: string;
  role?: string;

  // Expense fields
  amount?: number;
  description?: string;
  frequency?: string;
}

export interface OperationFormProps {
  variant: FormVariant;
  initialData?: Partial<OperationItem> | null;
  onSubmit: (data: Partial<OperationItem>) => void;
  onCancel: () => void;
}

export type OperationColumn = Column<OperationItem>;

export interface OperationState {
  users: OperationItem[];
  expenses: OperationItem[];
  isLoading: boolean;
  error: string | null;
}

export interface OperationAction {
  type: "SET_DATA" | "SET_LOADING" | "SET_ERROR";
  payload: Partial<OperationState>;
}

export interface UseOperationOptions {
  endpoint: string;
  onSuccess?: () => void;
}

// Type guards to check what type of operation item we're dealing with
export const isUser = (item: OperationItem): boolean => {
  return Boolean(item.username && item.email && item.role);
};

export const isExpense = (item: OperationItem): boolean => {
  return Boolean(item.amount && item.frequency);
};

// Helper types for more specific type checking
export type UserItem = Required<
  Pick<
    OperationItem,
    | "id"
    | "name"
    | "active"
    | "createdAt"
    | "updatedAt"
    | "locationId"
    | "username"
    | "email"
    | "phone"
    | "role"
  >
>;

export type ExpenseItem = Required<
  Pick<
    OperationItem,
    | "id"
    | "name"
    | "active"
    | "createdAt"
    | "updatedAt"
    | "locationId"
    | "amount"
    | "frequency"
  >
> & { description?: string };

// Schema type inference
export type UserSchemaType = z.infer<ReturnType<typeof UserSchema>>;
export type ExpenseSchemaType = z.infer<ReturnType<typeof ExpenseSchema>>;
