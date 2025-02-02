// @/types/features/transaction.ts

import { z } from "zod";
import { Column } from "@/types/shared/table";
import { OrderSchema } from "@/lib/schemas/transaction";

export interface OrderItem {
  itemId: string;
  quantity: number;
  price: number;
}

export interface TransactionItem {
  itemId: any;
  quantity: any;
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  total: number;
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
export interface TransactionFormProps {
  initialData?: Partial<TransactionItem> | null;
  onSubmit: (data: Partial<TransactionItem>) => void;
  onCancel: () => void;
}

export type TransactionColumn = Column<TransactionItem>;

export interface TransactionState {
  orders: TransactionItem[];
  isLoading: boolean;
  error: string | null;
}

export interface OrderAction {
  type: "SET_DATA" | "SET_LOADING" | "SET_ERROR";
  payload: Partial<TransactionState>;
}

export interface UseTransactionOptions {
  onSuccess?: () => void;
}

// Schema type inference
export type OrderSchemaType = z.infer<ReturnType<typeof OrderSchema>>;