// @/types/shared/tables.ts

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
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}