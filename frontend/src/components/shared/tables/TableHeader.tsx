/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { InventoryItem } from "@/types/features/inventory";
import type { OperationItem } from "@/types/features/operation";
import type { Column } from "@/types/shared/table";
import { translations } from "@/translations";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/hooks/shared/useCalendar";
import { useInventory } from "@/hooks/features/useInventory";

interface HeaderProps {
  column: Column<any>;
  onSort?: (key: string) => void;
}

type CellProps = {
  row: {
    original: any;
  };
};

// Status badge for active/inactive states
const StatusBadge = ({
  active,
  labels,
}: {
  active: boolean;
  labels: { active: string; inactive: string };
}) => (
  <span
    className={`px-2 py-1 rounded-full text-sm ${
      active
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    }`}
  >
    {active ? labels.active : labels.inactive}
  </span>
);

// Status badge for orders
const OrderStatusBadge = ({
  type,
  status,
}: {
  type: "order" | "payment";
  status: string;
}) => {
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

  return (
    <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor()}`}>
      {status}
    </span>
  );
};

const RoleBadge = ({ role, label }: { role: string; label: string }) => (
  <span
    className={`px-2 py-1 rounded-full text-sm ${
      role === "admin"
        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
        : role === "manager"
        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        : role === "sales"
        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        : role === "warehouse"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }`}
  >
    {label}
  </span>
);

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

export const getColumns = (
  variant: "location" | "category" | "item" | "user" | "expense" | "order",
  language: keyof typeof translations
): Column<any>[] => {
  const t = translations[language].dashboard;
  const { toEthiopian } = useCalendar();

  // Get data for lookups
  const { data: locations } = useInventory({ endpoint: "locations" });
  const { data: categories } = useInventory({ endpoint: "categories" });
  const { data: items } = useInventory({ endpoint: "items" });

  const baseColumns: { [key: string]: Column<any>[] } = {
    location: [
      {
        accessorKey: "name",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.inventory.table.name}
            sortKey="name"
            onSort={onSort}
          />
        ),
      },
      {
        accessorKey: "address",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.inventory.table.address}
            sortKey="address"
            onSort={onSort}
          />
        ),
      },
      {
        accessorKey: "contactNumber",
        header: t.inventory.table.contact,
        cell: ({ row }: CellProps) => {
          const contact = (row.original as InventoryItem).contactNumber || "";
          return contact.startsWith("0")
            ? `+251${contact.slice(1)}`
            : contact.startsWith("9")
            ? `+251${contact}`
            : contact;
        },
      },
      {
        accessorKey: "active",
        header: t.inventory.table.status,
        cell: ({ row }: CellProps) => (
          <StatusBadge
            active={row.original.active}
            labels={{
              active: t.inventory.table.active,
              inactive: t.inventory.table.inactive,
            }}
          />
        ),
      },
      {
        accessorKey: "updatedAt",
        header: t.inventory.table.lastUpdated,
        cell: ({ row }: CellProps) =>
          toEthiopian(new Date(row.original.updatedAt)),
      },
      {
        id: "actions",
        header: t.inventory.table.actions,
      },
    ],
    category: [
      {
        accessorKey: "name",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.inventory.table.name}
            sortKey="name"
            onSort={onSort}
          />
        ),
      },
      {
        accessorKey: "locationId",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.inventory.table.location}
            sortKey="locationId"
            onSort={onSort}
          />
        ),
        cell: ({ row }: CellProps) => {
          const location = locations?.find(
            (loc) => loc.id === row.original.locationId
          );
          return location?.name || row.original.locationId;
        },
      },
      {
        accessorKey: "description",
        header: t.inventory.table.description,
        cell: ({ row }: CellProps) => row.original.description || "-",
      },

      {
        accessorKey: "active",
        header: t.inventory.table.status,
        cell: ({ row }: CellProps) => (
          <StatusBadge
            active={row.original.active}
            labels={{
              active: t.inventory.table.active,
              inactive: t.inventory.table.inactive,
            }}
          />
        ),
      },
      {
        accessorKey: "updatedAt",
        header: t.inventory.table.lastUpdated,
        cell: ({ row }: CellProps) =>
          toEthiopian(new Date(row.original.updatedAt)),
      },
      {
        id: "actions",
        header: t.inventory.table.actions,
      },
    ],
    item: [
      {
        accessorKey: "name",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.inventory.table.name}
            sortKey="name"
            onSort={onSort}
          />
        ),
      },
      {
        accessorKey: "categoryId",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.inventory.table.category}
            sortKey="categoryId"
            onSort={onSort}
          />
        ),
        cell: ({ row }: CellProps) => {
          const category = categories?.find(
            (cat) => cat.id === (row.original as InventoryItem).categoryId
          );
          return category?.name || (row.original as InventoryItem).categoryId;
        },
      },
      {
        accessorKey: "price",
        header: t.inventory.table.price,
        cell: ({ row }: CellProps) => {
          const item = row.original as InventoryItem;
          return (
            <span className="font-mono">
              {item.price?.toLocaleString(language, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: t.inventory.table.quantity,
        cell: ({ row }: CellProps) => {
          const quantity = (row.original as InventoryItem).quantity || 0;
          return <span className="font-mono">{quantity}</span>;
        },
      },
      {
        accessorKey: "active",
        header: t.inventory.table.status,
        cell: ({ row }: CellProps) => (
          <StatusBadge
            active={row.original.active}
            labels={{
              active: t.inventory.table.active,
              inactive: t.inventory.table.inactive,
            }}
          />
        ),
      },
      {
        accessorKey: "updatedAt",
        header: t.inventory.table.lastUpdated,
        cell: ({ row }: CellProps) =>
          toEthiopian(new Date(row.original.updatedAt)),
      },
      {
        id: "actions",
        header: t.inventory.table.actions,
      },
    ],
    user: [
      {
        accessorKey: "name",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.operation.table.name}
            sortKey="name"
            onSort={onSort}
          />
        ),
      },
      {
        accessorKey: "locationId",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.operation.table.location}
            sortKey="locationId"
            onSort={onSort}
          />
        ),
        cell: ({ row }: CellProps) => {
          const location = locations?.find(
            (loc) => loc.id === row.original.locationId
          );
          return location?.name || row.original.locationId;
        },
      },
      {
        accessorKey: "username",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.operation.table.username}
            sortKey="username"
            onSort={onSort}
          />
        ),
      },
      {
        accessorKey: "email",
        header: t.operation.table.email,
      },
      {
        accessorKey: "phone",
        header: t.operation.table.phone,
        cell: ({ row }: CellProps) => {
          const phone = (row.original as OperationItem).phone || "";
          return phone.startsWith("0")
            ? `+251${phone.slice(1)}`
            : phone.startsWith("9")
            ? `+251${phone}`
            : phone;
        },
      },
      {
        accessorKey: "role",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.operation.table.role}
            sortKey="role"
            onSort={onSort}
          />
        ),
        cell: ({ row }: CellProps) => {
          const role =
            ((row.original as OperationItem).role as keyof typeof roleLabels) ||
            "";
          const roleLabels = {
            manager: t.operation.manager,
            admin: t.operation.admin,
            sales: t.operation.sales,
            warehouse: t.operation.warehouse,
          };

          return <RoleBadge role={role} label={roleLabels[role] || role} />;
        },
      },

      {
        accessorKey: "active",
        header: t.operation.table.status,
        cell: ({ row }: CellProps) => (
          <StatusBadge
            active={row.original.active}
            labels={{
              active: t.operation.table.active,
              inactive: t.operation.table.inactive,
            }}
          />
        ),
      },
      {
        accessorKey: "updatedAt",
        header: t.operation.table.lastUpdated,
        cell: ({ row }: CellProps) =>
          toEthiopian(new Date(row.original.updatedAt)),
      },
      {
        id: "actions",
        header: t.operation.table.actions,
      },
    ],
    expense: [
      {
        accessorKey: "name",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.operation.table.name}
            sortKey="name"
            onSort={onSort}
          />
        ),
      },
      {
        accessorKey: "locationId",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.operation.table.location}
            sortKey="locationId"
            onSort={onSort}
          />
        ),
        cell: ({ row }: CellProps) => {
          const location = locations?.find(
            (loc) => loc.id === row.original.locationId
          );
          return location?.name || row.original.locationId;
        },
      },
      {
        accessorKey: "amount",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.operation.table.amount}
            sortKey="amount"
            onSort={onSort}
          />
        ),
        cell: ({ row }: CellProps) => {
          const expense = row.original as OperationItem;
          return (
            <span className="font-mono">
              {expense.amount?.toLocaleString(language, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "frequency",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.operation.table.frequency}
            sortKey="frequency"
            onSort={onSort}
          />
        ),
        cell: ({ row }: CellProps) => {
          const frequency =
            ((row.original as OperationItem)
              .frequency as keyof typeof frequencyLabels) || "";
          const frequencyLabels = {
            once: t.form.oneTime,
            daily: t.form.daily,
            weekly: t.form.weekly,
            monthly: t.form.monthly,
            quarterly: t.form.quarterly,
            halfYearly: t.form.halfYearly,
            yearly: t.form.yearly,
          };

          return frequencyLabels[frequency] || frequency;
        },
      },
      {
        accessorKey: "description",
        header: t.operation.table.description,
        cell: ({ row }: CellProps) => row.original.description || "-",
      },
      {
        accessorKey: "active",
        header: t.operation.table.status,
        cell: ({ row }: CellProps) => (
          <StatusBadge
            active={row.original.active}
            labels={{
              active: t.operation.table.active,
              inactive: t.operation.table.inactive,
            }}
          />
        ),
      },
      {
        accessorKey: "updatedAt",
        header: t.operation.table.lastUpdated,
        cell: ({ row }: CellProps) =>
          toEthiopian(new Date(row.original.updatedAt)),
      },
      {
        id: "actions",
        header: t.operation.table.actions,
      },
    ],

    order: [
      {
        accessorKey: "customerName",
        header: ({ onSort }: HeaderProps) => (
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
        cell: ({ row }: CellProps) => {
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
        cell: ({ row }: CellProps) => {
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
        accessorKey: "status",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.transaction.table.status}
            sortKey="status"
            onSort={onSort}
          />
        ),
        cell: ({ row }: CellProps) => (
          <OrderStatusBadge type="order" status={row.original.status} />
        ),
      },
      {
        accessorKey: "paymentStatus",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.transaction.table.paymentStatus}
            sortKey="paymentStatus"
            onSort={onSort}
          />
        ),
        cell: ({ row }: CellProps) => (
          <OrderStatusBadge
            type="payment"
            status={row.original.paymentStatus}
          />
        ),
      },
      {
        accessorKey: "orderDate",
        header: ({ onSort }: HeaderProps) => (
          <SortableHeader
            label={t.transaction.table.orderDate}
            sortKey="orderDate"
            onSort={onSort}
          />
        ),
        cell: ({ row }: CellProps) =>
          toEthiopian(new Date(row.original.orderDate)),
      },
      {
        id: "actions",
        header: t.transaction.table.actions,
      },
    ],
  };

  return baseColumns[variant];
};
