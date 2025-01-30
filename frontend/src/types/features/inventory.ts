// @/types/features/inventory.ts

import { Column } from "@/types/shared/tables";
export type FormVariant = "location" | "category" | "item";

export interface InventoryItem {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;

  // Location fields
  address?: string;
  contactNumber?: string;

  // Category fields
  description?: string;
  locationId?: string;

  // Item fields
  categoryId?: string;
  price?: number;
  quantity?: number;
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
  locations: InventoryItem[];
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
export const isLocation = (item: InventoryItem): boolean => {
  return Boolean(item.address && item.contactNumber);
};

export const isCategory = (item: InventoryItem): boolean => {
  return Boolean(item.locationId);
};

export const isItem = (item: InventoryItem): boolean => {
  return Boolean(item.categoryId && typeof item.price === "number");
};

// Helper types for more specific type checking when needed
export type LocationItem = Required<
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
  Pick<
    InventoryItem,
    "id" | "name" | "active" | "createdAt" | "updatedAt" | "locationId"
  >
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
    | "quantity"
  >
>;
