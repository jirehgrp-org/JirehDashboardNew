// @/components/shared/tables/TableRow.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { InventoryItem } from "@/types/features/inventory";
import type { OperationItem } from "@/types/features/operation";
import type { Column } from "@/types/shared/tables";
import { useCalendar } from "@/hooks/shared/useCalendar";

interface TableRowProps<T extends InventoryItem | OperationItem> {
  row: T;
  columns: Column<T>[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export function TableRow<T extends InventoryItem | OperationItem>({
  row,
  columns,
  onEdit,
  onDelete,
}: TableRowProps<T>) {
  const { toEthiopian } = useCalendar();

  return (
    <tr>
      {columns.map((column) => {
        const value = column.accessorKey
          ? row[column.accessorKey as keyof T]
          : "";
        const displayValue = column.accessorKey?.includes("At")
          ? toEthiopian(new Date(value as string))
          : (value as React.ReactNode);

        return (
          <td
            key={column.id || column.accessorKey}
            className="px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100"
          >
            {column.id === "actions" ? (
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(row)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(row)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : column.cell ? (
              column.cell({ row: { original: row } })
            ) : (
              displayValue
            )}
          </td>
        );
      })}
    </tr>
  );
}
