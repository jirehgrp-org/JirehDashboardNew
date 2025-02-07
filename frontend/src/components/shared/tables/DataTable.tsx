// @/components/shared/tables/DataTable.tsx

"use client";

import React, { useState, useMemo } from "react";
import type { InventoryItem } from "@/types/features/inventory";
import type { OperationItem } from "@/types/features/operation";
import type { TransactionItem } from "@/types/features/transaction";
import type { DataTableProps, Column } from "@/types/shared/table";
import { TableRow } from "./TableRow";
import { TablePagination } from "./TablePagination";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import { Loader2 } from "lucide-react";

export function DataTable<
  T extends InventoryItem | OperationItem | TransactionItem
>({
  columns,
  data,
  variant,
  onEdit,
  onDelete,
  onAction,
  onRowClick,
  isLoading = false,
}: DataTableProps<T>) {
  const { language } = useLanguage();
  const t = translations[language].dashboard.table.message;
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

  const getColumnKey = (column: Column<T>) => {
    return column.id || column.accessorKey || column.header.toString();
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      if (!sortConfig.key) return 0;

      const aVal = a[sortConfig.key as keyof T];
      const bVal = b[sortConfig.key as keyof T];

      // Handle nullish values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle different types of values
      if (typeof aVal === "string" && typeof bVal === "string") {
        // Special handling for order number sorting
        if (sortConfig.key === "orderNumber") {
          const aNum = parseInt(aVal.split("-")[1]);
          const bNum = parseInt(bVal.split("-")[1]);
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }
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

      // Handle dates
      if (
        sortConfig.key === "createdAt" ||
        sortConfig.key === "updatedAt" ||
        sortConfig.key === "orderDate"
      ) {
        const dateA = new Date(aVal as string).getTime();
        const dateB = new Date(bVal as string).getTime();
        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Handle status sorting
      if (sortConfig.key === "status" || sortConfig.key === "paymentStatus") {
        const statusOrder = {
          pending: 0,
          completed: 1,
          paid: 1,
          cancelled: 2,
        };
        const aStatus = statusOrder[aVal as keyof typeof statusOrder] || 0;
        const bStatus = statusOrder[bVal as keyof typeof statusOrder] || 0;
        return sortConfig.direction === "asc"
          ? aStatus - bStatus
          : bStatus - aStatus;
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

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="flex flex-col items-center justify-center h-[150px] bg-white dark:bg-neutral-900">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!data.length) {
    const emptyMessages = {
      location: t.location,
      category: t.category,
      item: t.item,
      user: t.user,
      order: t.order,
      expense: t.expense,
    };

    return (
      <div className="rounded-md border">
        <div className="flex flex-col items-center justify-center h-[150px] bg-white dark:bg-neutral-900">
          <p className="text-neutral-600 dark:text-neutral-400 text-sm">
            {emptyMessages[variant]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={getColumnKey(column)}
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
                onAction={onAction}
                onRowClick={onRowClick}
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
