/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @/components/shared/tables/useColumns.tsx

import { useLanguage } from "@/components/context/LanguageContext";
import { useCalendar } from "@/hooks/shared/useCalendar";
import { useInventory } from "@/hooks/features/useInventory";
import { useOperation } from "@/hooks/features/useOperation"
import { translations } from "@/translations";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Column } from "@/types/shared/table";
import React from "react";

export function useColumns(
  variant: "branch" | "category" | "item" | "user" | "expense" | "order"
) {
  const { language } = useLanguage();
  const t = translations[language].dashboard;
  const { toEthiopian } = useCalendar();

  // Get data for lookups
  const { data: branches } = useInventory({ endpoint: "branches" });
  const { data: categories } = useInventory({ endpoint: "categories" });
  const { data: items } = useInventory({ endpoint: "items" });
  const { data: users } = useOperation({ endpoint: "users" });

  const SortableHeader = ({
    label,
    sortKey,
    onSort,
  }: {
    label: string;
    sortKey: string;
    onSort?: (key: string) => void;
  }) => (
    <Button variant="ghost" onClick={() => onSort?.(sortKey)}>
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );


  const columns = React.useMemo(() => {
    const baseColumns: { [key: string]: Column<any>[] } = {
      order: [
        {
          accessorKey: "customerName",
          header: ({ onSort }) => (
            <SortableHeader
              label={t.transaction.table.customerName}
              sortKey="customerName"
              onSort={onSort}
            />
          ),
        },
        {
          accessorKey: "customerPhone",
          header: t.transaction.table.customerPhone,
          cell: ({ row }) => {
            const phone = row.original.customerPhone;
            return phone.startsWith("0")
              ? `+251${phone.slice(1)}`
              : phone.startsWith("9")
                ? `+251${phone}`
                : phone;
          },
        },
        {
          accessorKey: "items",
          header: t.transaction.table.item,
          cell: ({ row }) => {
            const orderItems = row.original.items;
            return (
              <div className="space-y-1">
                {orderItems.map((orderItem: any, index: number) => {
                  const item = items?.find((i) => i.id === orderItem.itemId);
                  const total = orderItem.quantity * orderItem.price;

                  return (
                    <div key={index} className="flex flex-col">
                      <span>{item?.name}</span>
                      <span className="text-xs text-neutral-500">
                        {orderItem.quantity} ×{" "}
                        {orderItem.price.toLocaleString(language, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        ={" "}
                        {total.toLocaleString(language, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          },
        },
        {
          accessorKey: "user",
          header: ({ onSort }) => (
            <SortableHeader
              label={t.transaction.table.user || "User"}
              sortKey="user"
              onSort={onSort}
            />
          ),
          cell: ({ row }) => {
            const userId = row.original.user;
            const user = users?.find((u) => u.id === userId.toString());

            // Return the name or fallback to user ID
            return user?.name || `User ${userId}`;
          },
        },
        {
          accessorKey: "status",
          header: ({ onSort }) => (
            <SortableHeader
              label={t.transaction.table.status}
              sortKey="status"
              onSort={onSort}
            />
          ),
          cell: ({ row }) => (
            <OrderStatusBadge type="order" status={row.original.status} />
          ),
        },
        {
          accessorKey: "paymentStatus",
          header: ({ onSort }) => (
            <SortableHeader
              label={t.transaction.table.paymentStatus}
              sortKey="paymentStatus"
              onSort={onSort}
            />
          ),
          cell: ({ row }) => (
            <OrderStatusBadge
              type="payment"
              status={row.original.paymentStatus}
            />
          ),
        },
        {
          accessorKey: "paymentMethod",
          header: ({ onSort }) => (
            <SortableHeader
              label={t.transaction.form.paymentMethod}
              sortKey="paymentMethod"
              onSort={onSort}
            />
          ),
          cell: ({ row }) => (
            <PaymentMethodBadge method={row.original.paymentMethod} />
          ),
        },
        {
          accessorKey: "orderDate",
          header: ({ onSort }) => (
            <SortableHeader
              label={t.transaction.table.orderDate}
              sortKey="orderDate"
              onSort={onSort}
            />
          ),
          cell: ({ row }) => toEthiopian(new Date(row.original.orderDate)),
        },
      ],
    };


    return baseColumns[variant] || [];
  }, [variant, language, items, toEthiopian, t]);

  return columns;
}


const PaymentMethodBadge = ({ method }: { method: string }) => {
  const { language } = useLanguage();
  const t = translations[language].dashboard.transaction.form;

  const getMethodColor = () => {
    switch (method) {
      case "Cash":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Telebirr":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Bank Transfer":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Credit":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTranslatedMethod = () => {
    switch (method) {
      case "Cash":
        return t.paymentMethods.cash;
      case "Telebirr":
        return t.paymentMethods.telebirr;
      case "Bank Transfer":
        return t.paymentMethods.bankTransfer;
      case "Credit":
        return t.paymentMethods.credit;
      default:
        return method;
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${getMethodColor()}`}>
      {getTranslatedMethod()}
    </span>
  );
};


// Status badge components
const OrderStatusBadge = ({
  type,
  status,
}: {
  type: "order" | "payment";
  status: string;
}) => {
  const { language } = useLanguage();
  const t = translations[language].dashboard.transaction.form.status;

  const getStatusColor = () => {
    if (type === "payment") {
      switch (status.toLowerCase()) {
        case "paid":
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "pending":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        case "cancelled":
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      }
    } else {
      switch (status.toLowerCase()) {
        case "completed":
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case "pending":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
        case "cancelled":
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      }
    }
  };

  const getTranslatedStatus = () => {
    switch (status.toLowerCase()) {
      case "completed":
        return t.completed;
      case "pending":
        return t.pending;
      case "cancelled":
        return t.cancelled;
      case "paid":
        return t.paid;
      default:
        return status;
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor()}`}>
      {getTranslatedStatus()}
    </span>
  );
};