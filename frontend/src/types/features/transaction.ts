// @/types/features/transaction.ts

import { z } from "zod";
import { Column } from "@/types/shared/table";
import { OrderSchema } from "@/lib/schemas/transaction";
import { UserRole } from "../shared/auth";

export interface OrderItem {
  itemId: string;
  quantity: number;
  price: number;
}

export interface TransactionAction {
  type: "mark_paid" | "complete" | "cancel";
  timestamp: Date;
  performedBy: UserRole;
}

export interface TransactionItem {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderItem[];
  user: number;
  total: number;
  status: "pending" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "cancelled";
  paymentMethod: "Cash" | "Telebirr" | "Bank Transfer" | "Credit";
  orderNumber: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
  actions: TransactionAction[];
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
