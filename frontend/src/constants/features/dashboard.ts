// @/constants/features/dashboard.ts

import { TimeframeOption } from "@/types/features/dashboard";
import { translations } from "@/translations";

// Get translations for current language
const getT = (language: "en" | "am") =>
  translations[language].dashboard.overview.page;

export const TIMEFRAME_OPTIONS = (
  language: "en" | "am"
): Array<{
  value: TimeframeOption;
  label: string;
}> => [
  { value: "today", label: getT(language).timeframe.today },
  { value: "week", label: getT(language).timeframe.week },
  { value: "month", label: getT(language).timeframe.month },
  { value: "quarter", label: getT(language).timeframe.quarter },
  { value: "year", label: getT(language).timeframe.year },
  { value: "total", label: getT(language).timeframe.total },
];

export const CHART_COLORS = {
  primary: "#8884d8",
  secondary: "#82ca9d",
  success: "#4caf50",
  warning: "#ff9800",
  error: "#f44336",
};

export const METRIC_CARD_VARIANTS = (language: "en" | "am") => ({
  revenue: {
    iconColor: "text-green-600",
    valuePrefix: `${translations[language].dashboard.overview.page.birr} `,
  },
  orders: {
    iconColor: "text-blue-600",
    valueSuffix: ` ${translations[language].dashboard.overview.page.orders}`,
  },
  customers: {
    iconColor: "text-purple-600",
    valueSuffix: ` ${translations[language].dashboard.overview.page.customers}`,
  },
  growth: {
    iconColor: "text-orange-600",
    valueSuffix: "%",
  },
});
