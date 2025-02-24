// @/constants/shared/roleConstants.ts

import {
  IconTower,
  IconCash,
  IconTruck,
  IconUsers,
  IconBinoculars,
  IconChartHistogram,
  IconReceiptDollar,
  IconClipboardList,
  IconReportAnalytics,
  IconMapRoute,
  IconCashRegister,
  IconFileDollar,
  IconCategory,
  IconReport,
} from "@tabler/icons-react";
import { User } from "lucide-react";

export const roleIcons = {
  owner: (
    <IconTower className="h-5 w-6 text-black dark:text-white flex-shrink-0" />
  ),
  manager: (
    <IconTower className="h-5 w-6 text-black dark:text-white flex-shrink-0" />
  ),
  admin: (
    <IconUsers className="h-5 w-6 text-black dark:text-white flex-shrink-0" />
  ),
  sales: (
    <IconCash className="h-5 w-6 text-black dark:text-white flex-shrink-0" />
  ),
  warehouse: (
    <IconTruck className="h-5 w-6 text-black dark:text-white flex-shrink-0" />
  ),
};

const pages = {
  overview: {
    icon: IconBinoculars,
    label: "Overview",
    section: "analytics",
  },
  analytics: {
    icon: IconChartHistogram,
    label: "Analytics",
    section: "analytics",
  },
  salesReport: {
    icon: IconReportAnalytics,
    label: "Sales Report",
    section: "analytics",
  },
  profitLoss: {
    icon: IconCashRegister,
    label: "Profit & Loss",
    section: "analytics",
  },
  orders: {
    icon: IconReceiptDollar,
    label: "Orders",
    section: "transactions",
  },
  branches: {
    icon: IconMapRoute,
    label: "Branches",
    section: "inventory",
  },
  categories: {
    icon: IconCategory,
    label: "Categories",
    section: "inventory",
  },
  items: {
    icon: IconClipboardList,
    label: "Items",
    section: "inventory",
  },
  expenses: {
    icon: IconFileDollar,
    label: "Expenses",
    section: "operations",
  },
  users: {
    icon: User,
    label: "Users",
    section: "operations",
  },
  reports: {
    icon: IconReport,
    label: "Reports",
    section: "others",
  },
} as const;

export const roleAccess = {
  owner: pages,
  manager: pages,
  admin: {
    orders: pages.orders,
    branches: pages.branches,
    categories: pages.categories,
    items: pages.items,
    expenses: pages.expenses,
  },
  sales: {
    orders: pages.orders,
  },
  warehouse: {
    orders: pages.orders,
  },
} as const;