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
  locations: {
    icon: IconMapRoute,
    label: "Locations",
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
  manager: pages,
  admin: {
    overview: pages.overview,
    analytics: pages.analytics,
    salesReport: pages.salesReport,
    profitLoss: pages.profitLoss,
    orders: pages.orders,
    locations: pages.locations,
    categories: pages.categories,
    items: pages.items,
    expenses: pages.expenses,
    reports: pages.reports,
  },
  sales: {
    overview: pages.overview,
    orders: pages.orders,
  },
  warehouse: {
    overview: pages.overview,
    orders: pages.orders,
  },
} as const;