/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/shared/tables/TableRow.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import type { Column } from "@/types/features/inventory";
import { useCalendar } from "@/hooks/shared/useCalendar";

interface TableRowProps {
  row: any;
  columns: Column[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}

export function TableRow({ row, columns, onEdit, onDelete }: TableRowProps) {
  const { toEthiopian } = useCalendar();

  return (
    <tr>
      {columns.map((column) => {
        const value = column.accessorKey ? row[column.accessorKey] : "";
        const displayValue = column.accessorKey?.includes("At")
          ? toEthiopian(new Date(value))
          : value;

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