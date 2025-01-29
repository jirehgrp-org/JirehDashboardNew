/* eslint-disable react-hooks/rules-of-hooks */
// @/components/shared/tables/TableHeader.ts

import type { Column } from "@/types/features/inventory";
import { translations } from "@/translations";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/hooks/shared/useCalendar";

interface HeaderProps {
  column: Column;
  onSort?: (key: string) => void;
}

export const getColumns = (
  variant: "location" | "category" | "item",
  language: keyof typeof translations
): Column[] => {
  const t = translations[language].dashboard.inventory.locations.table;
  const { toEthiopian } = useCalendar();

  const baseColumns: { [key: string]: Column[] } = {
    location: [
      {
        accessorKey: "name",
        header: ({ onSort }: HeaderProps) => (
          <Button variant="ghost" onClick={() => onSort?.("name")}>
            {t.name}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "address",
        header: ({ onSort }: HeaderProps) => (
          <Button variant="ghost" onClick={() => onSort?.("address")}>
            {t.address}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "contactNumber",
        header: t.contact,
      },
      {
        accessorKey: "active",
        header: t.status,
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-full text-sm ${
              row.original.active
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {row.original.active ? t.active : t.inactive}
          </span>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: t.lastUpdated,
        cell: ({ row }) => toEthiopian(new Date(row.original.updatedAt)),
      },
      {
        id: "actions",
        header: t.actions,
      },
    ],
    category: [],
    item: [],
  };

  return baseColumns[variant];
};
