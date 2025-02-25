// @/types/features/inventory.ts

import { Column } from "@/types/shared/table";
export type FormVariant = "branch" | "category" | "item";

export interface InventoryItem {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;

  // branch fields
  address?: string;
  contactNumber?: string;

  // Category fields
  description?: string;

  // Item fields
  categoryId?: string;
  branchId?: string;
  price?: number;
  quantity?: number;
  unitOfMeasure?: string;
}

export interface InventoryFormProps {
  variant: FormVariant;
  initialData?: Partial<InventoryItem> | null;
  onSubmit: (data: Partial<InventoryItem>) => void;
  onCancel: () => void;
}

export type InventoryColumn = Column<InventoryItem>;

export interface InventoryState {
  items: InventoryItem[];
  categories: InventoryItem[];
  branches: InventoryItem[];
  isLoading: boolean;
  error: string | null;
}

export interface InventoryAction {
  type: "SET_DATA" | "SET_LOADING" | "SET_ERROR";
  payload: Partial<InventoryState>;
}

export interface UseInventoryOptions {
  endpoint: string;
  onSuccess?: () => void;
}

// Type guards to check what type of inventory item we're dealing with
export const isBranch = (item: InventoryItem): boolean => {
  return Boolean(item.address && item.contactNumber);
};

export const isCategory = (item: InventoryItem): boolean => {
  return Boolean(
    item.description !== undefined && !item.categoryId && !item.branchId
  );
};

export const isItem = (item: InventoryItem): boolean => {
  return Boolean(
    item.categoryId && item.branchId && typeof item.price === "number"
  );
};

// Helper types for more specific type checking when needed
export type BranchItem = Required<
  Pick<
    InventoryItem,
    | "id"
    | "name"
    | "active"
    | "createdAt"
    | "updatedAt"
    | "address"
    | "contactNumber"
  >
>;

export type CategoryItem = Required<
  Pick<InventoryItem, "id" | "name" | "active" | "createdAt" | "updatedAt">
> & { description?: string };

export type StockItem = Required<
  Pick<
    InventoryItem,
    | "id"
    | "name"
    | "active"
    | "createdAt"
    | "updatedAt"
    | "price"
    | "categoryId"
    | "branchId"
    | "quantity"
  >
> & { unitOfMeasure?: string };