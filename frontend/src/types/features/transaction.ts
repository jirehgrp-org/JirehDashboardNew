// @/types/features/transaction.ts

import { z } from "zod";
import { Column } from "@/types/shared/table";
import { OrderSchema } from "@/lib/schemas/transaction";

export interface TransactionItem {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  itemId: string; // Changed from 'item' to 'itemId'
  quantity: number;
  status: "pending" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "cancelled";
  orderNumber: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  actions: {
    type: "mark_paid" | "cancel";
    timestamp: Date;
    performedBy: string;
  }[];
}

export interface OrderFormProps {
  initialData?: Partial<TransactionItem> | null;
  onSubmit: (data: Partial<TransactionItem>) => void;
  onCancel: () => void;
}

export type OrderColumn = Column<TransactionItem>;

export interface OrderState {
  orders: TransactionItem[];
  isLoading: boolean;
  error: string | null;
}

export interface OrderAction {
  type: "SET_DATA" | "SET_LOADING" | "SET_ERROR";
  payload: Partial<OrderState>;
}

export interface UseOrderOptions {
  onSuccess?: () => void;
}

// Schema type inference
export type OrderSchemaType = z.infer<ReturnType<typeof OrderSchema>>;