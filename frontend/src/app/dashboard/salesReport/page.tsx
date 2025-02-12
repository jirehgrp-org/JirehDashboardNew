// @/app/dashboard/salesReport/page.tsx

"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { DollarSign, Package, Users, Clock } from "lucide-react";
import { ResponsiveWrapper } from "@/components/common/ResponsiveWrapper";
import { useResponsive } from "@/hooks/shared/useResponsive";
import { MetricCard } from "@/components/shared/cards/MetricCard";
import { ChartCard } from "@/components/shared/cards/ChartCard";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PieChart } from "@/components/shared/charts/PieChart";
import { LineChart } from "@/components/shared/charts/LineChart";
import { useDashboard } from "@/hooks/features/useDashboard";
import {
  CHART_COLORS,
  TIMEFRAME_OPTIONS,
} from "@/constants/features/dashboard";
import { useLanguage } from "@/components/context/LanguageContext";

const SalesReport = () => {
  const { isMobile } = useResponsive();
  const { language } = useLanguage();
  const { timeframe, setTimeframe, metrics, chartData, analytics } =
    useDashboard();
  const [sortBy, setSortBy] = useState("revenue");

  // Product performance calculations
  const productPerformance = analytics.topSellingItems.map((item) => ({
    name: item.item_name,
    unitsSold: item.total_quantity,
    revenue: item.total_revenue,
    averagePrice: item.total_revenue / item.total_quantity,
  }));

  // Sort product performance data
  const sortedProductPerformance = [...productPerformance].sort((a, b) => {
    switch (sortBy) {
      case "revenue":
        return b.revenue - a.revenue;
      case "units":
        return b.unitsSold - a.unitsSold;
      case "average":
        return b.averagePrice - a.averagePrice;
      default:
        return 0;
    }
  });

  return (
    <div className="flex flex-1 h-full flex-col overflow-y-auto">
      <ResponsiveWrapper className="pb-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Sales Report
              <p className="text-sm md:text-base font-semibold text-zinc-600 dark:text-zinc-400">
                Complete sales report on products sold
              </p>
            </h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 w-full md:w-auto"
              >
                <Clock className="h-4 w-4" />
                <span>Time Range</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {TIMEFRAME_OPTIONS(language).map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTimeframe(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Summary Metrics */}
        <div
          className={cn(
            "grid gap-4 mb-6",
            isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"
          )}
        >
          <MetricCard
            title="Total Revenue"
            value={metrics.totalRevenue}
            icon={DollarSign}
            description={
              <span
                className={cn(
                  "inline-flex items-center",
                  metrics.growth >= 0 ? "text-green-600" : "text-red-600"
                )}
              >
                {metrics.growth >= 0 ? "↑" : "↓"}
                {Math.abs(metrics.growth).toFixed(1)}% from{" "}
                {timeframe === "today"
                  ? "yesterday"
                  : timeframe === "week"
                  ? "last week"
                  : timeframe === "month"
                  ? "last month"
                  : timeframe === "quarter"
                  ? "last quarter"
                  : timeframe === "year"
                  ? "last year"
                  : "overall"}
              </span>
            }
            valuePrefix="ETB "
            iconColor="text-green-600"
          />
          <MetricCard
            title="Total Units Sold"
            value={productPerformance.reduce(
              (sum, item) => sum + item.unitsSold,
              0
            )}
            icon={Package}
            description={`${(
              productPerformance.reduce(
                (sum, item) => sum + item.unitsSold,
                0
              ) / productPerformance.length
            ).toFixed(1)} units per product`}
            iconColor="text-blue-600"
          />
          <MetricCard
            title="Unique Customers"
            value={metrics.uniqueCustomers}
            icon={Users}
            description={`${(
              analytics.customerAnalytics.reduce(
                (sum, customer) => sum + customer.total_orders,
                0
              ) / metrics.uniqueCustomers
            ).toFixed(1)} orders per customer`}
            iconColor="text-purple-600"
          />
          <MetricCard
            title="Average Order Value"
            value={metrics.averageOrderValue}
            icon={DollarSign}
            description="Per transaction"
            valuePrefix="ETB "
            iconColor="text-orange-600"
          />
        </div>

        {/* Charts Section */}
        <div
          className={cn(
            "grid gap-4 mb-6",
            isMobile ? "grid-cols-1" : "grid-cols-2"
          )}
        >
          <ChartCard
            title="Top Products by Sales"
            description={`Distribution of top 5 selling products ${
              timeframe === "today"
                ? "today"
                : timeframe === "week"
                ? "this week"
                : timeframe === "month"
                ? "this month"
                : timeframe === "quarter"
                ? "this quarter"
                : timeframe === "year"
                ? "this year"
                : "overall"
            }`}
          >
            <div className="h-[300px]">
              <PieChart
                data={productPerformance.slice(0, 5).map((item) => ({
                  name: item.name,
                  value: item.unitsSold,
                }))}
                colors={[
                  CHART_COLORS.primary,
                  CHART_COLORS.secondary,
                  CHART_COLORS.success,
                  CHART_COLORS.warning,
                  CHART_COLORS.error,
                ]}
              />
            </div>
          </ChartCard>

          <ChartCard
            title="Sales Trends"
            description={`Revenue overview for ${
              timeframe === "today"
                ? "today"
                : timeframe === "week"
                ? "the past week"
                : timeframe === "month"
                ? "the past month"
                : timeframe === "quarter"
                ? "the past quarter"
                : timeframe === "year"
                ? "the past year"
                : "all time"
            }`}
          >
            <div className="h-[300px]">
              <LineChart
                data={chartData.revenueData}
                xDataKey="date"
                yDataKey="amount"
                stroke={CHART_COLORS.primary}
                tooltipFormatter={(value) => `ETB ${value.toLocaleString()}`}
              />
            </div>
          </ChartCard>
        </div>

        {/* Product Performance Table */}
        <div className="mb-6">
          <ChartCard
            title="Product Performance"
            description="Detailed breakdown of product sales and revenue"
            action={
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Sort by Revenue</SelectItem>
                  <SelectItem value="units">Sort by Units Sold</SelectItem>
                  <SelectItem value="average">Sort by Average Price</SelectItem>
                </SelectContent>
              </Select>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg. Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProductPerformance.map((product) => (
                  <TableRow key={product.name}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.unitsSold.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ETB {product.revenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ETB {product.averagePrice.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ChartCard>
        </div>
      </ResponsiveWrapper>
    </div>
  );
};

export default SalesReport;
