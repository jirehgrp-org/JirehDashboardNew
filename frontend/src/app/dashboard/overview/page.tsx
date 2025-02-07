// @/app/dashboard/overview/page.tsx

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Users,
  TrendingUp,
  ShoppingCart,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import { ResponsiveWrapper } from "@/components/common/ResponsiveWrapper";
import { useResponsive } from "@/hooks/shared/useResponsive";
import { MetricCard } from "@/components/shared/cards/MetricCard";
import { ChartCard } from "@/components/shared/cards/ChartCard";
import { ListCard } from "@/components/shared/cards/ListCard";
import { LineChart } from "@/components/shared/charts/LineChart";
import { PieChart } from "@/components/shared/charts/PieChart";
import { useDashboard } from "@/hooks/features/useDashboard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  TIMEFRAME_OPTIONS,
  METRIC_CARD_VARIANTS,
  CHART_COLORS,
} from "@/constants/features/dashboard";

const OverviewPage = () => {
  const { isMobile } = useResponsive();
  const { language } = useLanguage();
  const t = translations[language].dashboard.overview.page;

  const { setTimeframe, metrics, chartData, analytics } = useDashboard();

  return (
    // Added overflow-y-auto to fix scrolling while maintaining flex layout
    <div className="flex flex-1 h-full flex-col overflow-y-auto">
      {/* Added pb-6 to prevent content cutoff at the bottom */}
      <ResponsiveWrapper className="pb-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2
            className={cn(
              "text-2xl md:text-3xl font-bold",
              isMobile && "w-full"
            )}
          >
            {t.businessOverview}
            <p className="text-sm md:text-base font-semibold text-zinc-600 dark:text-zinc-400">
              {t.performanceMetrics}
            </p>
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 w-full md:w-auto"
              >
                <Clock className="h-4 w-4" />
                <span>{t.timeframes}</span>
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

        {/* Metrics Grid - Adjusted breakpoints */}
        <div
          className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"
          )}
        >
          <MetricCard
            title={t.metrics.revenue}
            value={metrics.totalRevenue}
            icon={DollarSign}
            description={t.metrics.revenueDesc}
            {...METRIC_CARD_VARIANTS(language).revenue}
          />
          <MetricCard
            title={t.customers}
            value={metrics.uniqueCustomers}
            icon={Users}
            description={t.metrics.customersDesc}
            {...METRIC_CARD_VARIANTS(language).customers}
          />
          <MetricCard
            title={t.metrics.averageOrder}
            value={metrics.averageOrderValue}
            icon={ShoppingCart}
            description={t.metrics.averageOrderDesc}
            valuePrefix={t.birr + " "}
            {...METRIC_CARD_VARIANTS(language).orders}
          />
          <MetricCard
            title={t.metrics.growth}
            value={Math.abs(metrics.growth)}
            icon={TrendingUp}
            description={t.metrics.growthDesc}
            trend={{
              value: metrics.growth,
              isPositive: metrics.growth >= 0,
            }}
            {...METRIC_CARD_VARIANTS(language).growth}
          />
        </div>

        {/* Charts Section - Added responsive height */}
        <div
          className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2")}
        >
          <ChartCard
            title={t.charts.revenueTrend}
            description={t.charts.revenueTrendDesc}
          >
            <div className="h-[250px] md:h-[300px]">
              <LineChart
                data={chartData.revenueData}
                xDataKey="date"
                yDataKey="amount"
                stroke={CHART_COLORS.primary}
                tooltipFormatter={(value) =>
                  `${t.birr} ${" "} ${value.toLocaleString()}`
                }
              />
            </div>
          </ChartCard>

          <ChartCard
            title={t.charts.paymentMethods}
            description={t.charts.paymentMethodsDesc}
          >
            <div className="h-[250px] md:h-[300px]">
              <PieChart
                data={chartData.paymentMethods}
                colors={Object.values(CHART_COLORS)}
                tooltipFormatter={(value) => `${value} ${t.orders}`}
              />
            </div>
          </ChartCard>
        </div>

        {/* Analytics Lists - Added gap-6 for better spacing */}
        <div
          className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-2")}
        >
          <ListCard
            title={t.lists.topItems}
            description={t.lists.topItemsDesc}
            items={analytics.topSellingItems.map((item) => ({
              title: item.item_name,
              subtitle: item.category_name,
              value: item.total_revenue,
              subvalue: `${item.total_quantity} ${t.lists.units}`,
            }))}
          />

          <ListCard
            title={t.lists.categories}
            description={t.lists.categoriesDesc}
            items={(analytics?.categoryAnalytics || [])
              .slice(0, 5)
              .map((category) => ({
                title: category.category_name,
                subtitle: `${category.total_items} ${t.lists.itemsSold}`,
                value: category.total_revenue,
                subvalue: `${t.lists.avg} ${
                  t.birr
                }${" "}${category.average_order_value.toFixed(2)}`,
              }))}
          />
        </div>

        {/* Customer Section - Improved spacing */}
        <div
          className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-2")}
        >
          <ListCard
            title={t.lists.topCustomers}
            description={t.lists.topCustomersDesc}
            items={analytics.customerAnalytics.slice(0, 5).map((customer) => ({
              title: customer.customer_name,
              subtitle: `${customer.total_orders} ${t.orders}`,
              value: customer.total_amount,
              subvalue: `${t.lists.avg} ${
                t.birr + " "
              } ${customer.average_order_value.toFixed(2)}`,
            }))}
          />

          <ChartCard
            title={t.customerRetention}
            description={t.customerRetentionDesc}
          >
            <div className="space-y-4">
              <div
                className={cn(
                  "grid gap-4",
                  isMobile ? "grid-cols-1" : "grid-cols-2"
                )}
              >
                <div>
                  <p className="text-sm font-medium">{t.returningCustomers}</p>
                  <p className="text-2xl font-bold">
                    {(
                      (analytics.customerAnalytics.filter(
                        (c) => c.total_orders > 1
                      ).length /
                        analytics.customerAnalytics.length) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {t.avgOrdersPerCustomer}
                  </p>
                  <p className="text-2xl font-bold">
                    {(
                      analytics.customerAnalytics.reduce(
                        (acc, curr) => acc + curr.total_orders,
                        0
                      ) / analytics.customerAnalytics.length
                    ).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </ResponsiveWrapper>
    </div>
  );
};

export default OverviewPage;
