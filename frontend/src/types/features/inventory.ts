// @/types/features/inventory.ts

export type FormVariant = "location" | "category" | "item";

export interface BaseInventoryItem {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location extends BaseInventoryItem {
  address: string;
  contactNumber: string;
}

export interface Category extends BaseInventoryItem {
  description?: string;
  locationId: string;
}

export interface Item extends BaseInventoryItem {
  description?: string;
  price: number;
  categoryId: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface InventoryFormProps {
  variant: FormVariant;
  initialData?: Partial<Location | Category | Item> | null;
  onSubmit: (data: Partial<Location | Category | Item>) => void;
  onCancel: () => void;
}

export interface Column {
  accessorKey?: string;
  id?: string;
  header:
    | string
    | ((props: {
        column: Column;
        onSort: (key: string) => void;
      }) => React.ReactNode);
  cell?: (props: {
    row: { original: Location | Category | Item };
  }) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export interface InventoryState {
  items: Item[];
  categories: Category[];
  locations: Location[];
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
