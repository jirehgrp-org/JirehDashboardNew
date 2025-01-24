/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/shared/tables/DataTable.tsx
"use client";

import React, { useState } from "react";
import type { DataTableProps } from "@/types/features/inventory";
import { TableRow } from "./TableRow";
import { TablePagination } from "./TablePagination";

export function DataTable<T>({ columns, data, onEdit, onDelete }: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const itemsPerPage = 10;

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;

    const aVal = a[sortConfig.key as keyof typeof a];
    const bVal = b[sortConfig.key as keyof typeof b];

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id || column.accessorKey || (typeof column.header === 'string' ? column.header : undefined)}
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
            {paginatedData.map((row, rowIndex) => (
              <TableRow
                key={(row as any).id || rowIndex}
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
