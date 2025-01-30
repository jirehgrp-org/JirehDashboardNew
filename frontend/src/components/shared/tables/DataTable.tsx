// @/components/shared/tables/DataTable.tsx
"use client";

import React, { useState, useMemo } from "react";
import type { InventoryItem } from "@/types/features/inventory";
import type { OperationItem } from "@/types/features/operation";
import type { DataTableProps } from "@/types/shared/tables";
import { TableRow } from "./TableRow";
import { TablePagination } from "./TablePagination";

export function DataTable<T extends InventoryItem | OperationItem>({
  columns,
  data,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const itemsPerPage = 10;

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof T];
      const bVal = b[sortConfig.key as keyof T];

      // Handle nullish values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle different types of values
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === "boolean" && typeof bVal === "boolean") {
        return sortConfig.direction === "asc"
          ? aVal === bVal
            ? 0
            : aVal
            ? 1
            : -1
          : aVal === bVal
          ? 0
          : aVal
          ? -1
          : 1;
      }

      // Handle date strings
      if (
        sortConfig.key === "createdAt" ||
        sortConfig.key === "updatedAt"
      ) {
        const dateA = new Date(aVal as string).getTime();
        const dateB = new Date(bVal as string).getTime();
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Fallback
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const paginatedData = useMemo(() => {
    return sortedData.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedData, currentPage]);

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={
                    column.id ||
                    column.accessorKey ||
                    (typeof column.header === "string"
                      ? column.header
                      : "column")
                  }
                  className="px-4 py-3 text-left text-sm font-medium text-neutral-500 dark:text-neutral-400"
                >
                  {typeof column.header === "function"
                    ? column.header({ column, onSort: handleSort })
                    : column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700 bg-white dark:bg-neutral-900">
            {paginatedData.map((row) => (
              <TableRow<T>
                key={row.id}
                row={row}
                columns={columns}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={currentPage}
        totalItems={data.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}