// @/types/shared/table.ts

export interface TableRowProps<T> {
  row: T;
  columns: Array<{
    id?: string;
    accessorKey?: string;
    cell?: (props: { row: { original: T } }) => React.ReactNode;
  }>;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onAction?: (row: T, action: ActionType) => void;
  onRowClick?: (row: T) => void;
}

export interface Column<T> {
  accessorKey?: string;
  id?: string;
  header:
    | string
    | ((props: {
        column: Column<T>;
        onSort?: (key: string) => void;
      }) => React.ReactNode);
  cell?: (props: { row: { original: T } }) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  variant: "branch" | "category" | "item" | "user" | "expense" | "order";
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onAction?: (row: T, action: ActionType) => void;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
}

export type ActionType = "mark_paid" | "complete" | "cancel";