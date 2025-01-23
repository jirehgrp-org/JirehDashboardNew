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
import { HardHat, User } from "lucide-react";

export const roleIcons = {
  owner: (
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
    section: "operations",
  },
  expenses: {
    icon: IconFileDollar,
    label: "Expenses",
    section: "operations",
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
  employees: {
    icon: HardHat,
    label: "Employees",
    section: "people",
  },
  users: {
    icon: User,
    label: "Users",
    section: "people",
  },
  reports: {
    icon: IconReport,
    label: "Reports",
    section: "others",
  },
} as const;

export const roleAccess = {
  owner: pages,
  admin: {
    overview: pages.overview,
    analytics: pages.analytics,
    salesReport: pages.salesReport,
    profitLoss: pages.profitLoss,
    orders: pages.orders,
    expenses: pages.expenses,
    locations: pages.locations,
    categories: pages.categories,
    items: pages.items,
    employees: pages.employees,
    reports: pages.reports,
  },
  sales: {
    overview: pages.overview,
    orders: pages.orders,
  },
  warehouse: {
    overview: pages.overview,
    items: pages.items,
    orders: pages.orders,
  },
} as const;