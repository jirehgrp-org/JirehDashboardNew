// @/types/features/dashboard.ts

export type TimeframeOption =
  | "today"
  | "week"
  | "month"
  | "quarter"
  | "year"
  | "total";

export interface DashboardMetrics {
  totalRevenue: number;
  uniqueCustomers: number;
  averageOrderValue: number;
  growth: number;
}

export interface ChartDataPoint {
  date: string;
  amount: number;
}

export interface PaymentMethodData {
  name: string;
  value: number;
}

export interface TopSellingItem {
  item_id: string;
  item_name: string;
  category_name: string;
  total_revenue: number;
  total_quantity: number;
}

export interface CategoryAnalytics {
  category_name: string;
  total_items: number;
  total_revenue: number;
  average_order_value: number;
}

export interface CustomerAnalytics {
  customer_id: string;
  customer_name: string;
  total_orders: number;
  total_amount: number;
  average_order_value: number;
}

export interface DashboardChartData {
  revenueData: ChartDataPoint[];
  paymentMethods: PaymentMethodData[];
}

export interface DashboardAnalytics {
  topSellingItems: TopSellingItem[];
  categoryAnalytics: CategoryAnalytics[];
  customerAnalytics: CustomerAnalytics[];
}
