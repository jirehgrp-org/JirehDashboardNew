/* eslint-disable @typescript-eslint/no-unused-vars */
// @/app/dashboard/analytics/page.tsx

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Users,
  Clock,
  ShoppingBag,
  Percent,
  Target,
  Activity,
  CreditCard,
} from "lucide-react";
import { ResponsiveWrapper } from "@/components/common/ResponsiveWrapper";
import { useResponsive } from "@/hooks/shared/useResponsive";
import { MetricCard } from "@/components/shared/cards/MetricCard";
import { ChartCard } from "@/components/shared/cards/ChartCard";
import { ListCard } from "@/components/shared/cards/ListCard";
import { LineChart } from "@/components/shared/charts/LineChart";
import { PieChart } from "@/components/shared/charts/PieChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboard } from "@/hooks/features/useDashboard";
import {
  CHART_COLORS,
  TIMEFRAME_OPTIONS,
} from "@/constants/features/dashboard";

const AnalyticsPage = () => {
  const { isMobile } = useResponsive();
  const {
    timeframe,
    setTimeframe,
    metrics,
    chartData,
    analytics,
  } = useDashboard();

  const [view, setView] = useState("sales");

  // Calculate conversion rates and advanced metrics
  const conversionRate =
    metrics.uniqueCustomers > 0
      ? (
          (analytics.customerAnalytics.filter((c) => c.total_orders > 0)
            .length /
            metrics.uniqueCustomers) *
          100
        ).toFixed(1)
      : 0;

  const averageTimeToComplete = 25; // In minutes, replace with actual calculation
  const customerLifetimeValue =
    analytics.customerAnalytics.length > 0
      ? (
          analytics.customerAnalytics.reduce(
            (acc, curr) => acc + curr.total_amount,
            0
          ) / analytics.customerAnalytics.length
        ).toFixed(2)
      : 0;

  const repeatPurchaseRate =
    analytics.customerAnalytics.length > 0
      ? (
          (analytics.customerAnalytics.filter((c) => c.total_orders > 1)
            .length /
            analytics.customerAnalytics.length) *
          100
        ).toFixed(1)
      : 0;

  return (
    <div className="flex flex-1 h-full flex-col overflow-y-auto">
      <ResponsiveWrapper className="pb-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Advanced Analytics
              <p className="text-sm md:text-base font-semibold text-zinc-600 dark:text-zinc-400">
                In-depth performance analysis and insights
              </p>
            </h2>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Time Range
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {TIMEFRAME_OPTIONS("en").map((option) => (
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
        </div>

        {/* View Selector */}
        <Tabs value={view} onValueChange={setView} className="mb-6">
          <TabsList>
            <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
            <TabsTrigger value="customers">Customer Insights</TabsTrigger>
            <TabsTrigger value="products">Product Performance</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === "sales" && (
          <>
            {/* Sales Analysis Metrics */}
            <div
              className={cn(
                "grid gap-4 mb-6",
                isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"
              )}
            >
              <MetricCard
                title="Average Transaction Value"
                value={metrics.averageOrderValue}
                icon={Activity}
                description="Per transaction value trend"
                valuePrefix="ETB "
                iconColor="text-blue-600"
              />
              <MetricCard
                title="Conversion Rate"
                value={conversionRate}
                icon={Target}
                description="Visitor to customer rate"
                valueSuffix="%"
                iconColor="text-green-600"
              />
              <MetricCard
                title="Processing Time"
                value={averageTimeToComplete}
                icon={Clock}
                description="Average order completion"
                valueSuffix=" min"
                iconColor="text-orange-600"
              />
              <MetricCard
                title="Payment Success"
                value={95.5}
                icon={CreditCard}
                description="Successful payment rate"
                valueSuffix="%"
                iconColor="text-purple-600"
              />
            </div>

            {/* Sales Trend Analysis */}
            <div className="grid gap-4 mb-6">
              <ChartCard
                title="Sales Trend Analysis"
                description="Revenue and order volume comparison"
              >
                <div className="h-[400px]">
                  <LineChart
                    data={chartData.revenueData}
                    xDataKey="date"
                    yDataKey="amount"
                    stroke={CHART_COLORS.primary}
                    tooltipFormatter={(value) =>
                      `ETB ${value.toLocaleString()}`
                    }
                  />
                </div>
              </ChartCard>
            </div>

            {/* Sales Distribution */}
            <div
              className={cn(
                "grid gap-4 mb-6",
                isMobile ? "grid-cols-1" : "grid-cols-2"
              )}
            >
              <ChartCard
                title="Payment Methods"
                description="Distribution by payment type"
              >
                <div className="h-[300px]">
                  <PieChart
                    data={chartData.paymentMethods}
                    colors={[
                      CHART_COLORS.primary,
                      CHART_COLORS.secondary,
                      CHART_COLORS.success,
                      CHART_COLORS.warning,
                    ]}
                  />
                </div>
              </ChartCard>

              <ListCard
                title="Peak Sales Hours"
                description="Most active selling periods"
                items={[
                  {
                    title: "2:00 PM - 3:00 PM",
                    value: "ETB 12,450",
                    subvalue: "125 orders",
                  },
                  {
                    title: "1:00 PM - 2:00 PM",
                    value: "ETB 10,200",
                    subvalue: "98 orders",
                  },
                  {
                    title: "3:00 PM - 4:00 PM",
                    value: "ETB 9,850",
                    subvalue: "87 orders",
                  },
                  {
                    title: "12:00 PM - 1:00 PM",
                    value: "ETB 8,300",
                    subvalue: "76 orders",
                  },
                ]}
              />
            </div>
          </>
        )}

        {view === "customers" && (
          <>
            {/* Customer Insights Metrics */}
            <div
              className={cn(
                "grid gap-4 mb-6",
                isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-4"
              )}
            >
              <MetricCard
                title="Customer Lifetime Value"
                value={customerLifetimeValue}
                icon={Users}
                description="Average customer value"
                valuePrefix="ETB "
                iconColor="text-blue-600"
              />
              <MetricCard
                title="Repeat Purchase Rate"
                value={repeatPurchaseRate}
                icon={TrendingUp}
                description="Returning customer rate"
                valueSuffix="%"
                iconColor="text-green-600"
              />
              <MetricCard
                title="Average Items per Order"
                value={2.8}
                icon={ShoppingBag}
                description="Items per transaction"
                iconColor="text-orange-600"
              />
              <MetricCard
                title="Customer Satisfaction"
                value={96.5}
                icon={Percent}
                description="Overall satisfaction score"
                valueSuffix="%"
                iconColor="text-purple-600"
              />
            </div>

            {/* Customer Analysis */}
            <div
              className={cn(
                "grid gap-4 mb-6",
                isMobile ? "grid-cols-1" : "grid-cols-2"
              )}
            >
              <ListCard
                title="Customer Segments"
                description="Analysis by customer type"
                items={[
                  {
                    title: "Loyal Customers",
                    subtitle: "5+ orders",
                    value: "45%",
                    subvalue: "ETB 25,000 avg. value",
                  },
                  {
                    title: "Regular Customers",
                    subtitle: "2-4 orders",
                    value: "35%",
                    subvalue: "ETB 15,000 avg. value",
                  },
                  {
                    title: "New Customers",
                    subtitle: "First order",
                    value: "20%",
                    subvalue: "ETB 5,000 avg. value",
                  },
                ]}
              />

              <ListCard
                title="Customer Retention"
                description="Retention by timeframe"
                items={[
                  {
                    title: "30-Day Retention",
                    value: "78%",
                    subvalue: "vs 75% last period",
                  },
                  {
                    title: "60-Day Retention",
                    value: "65%",
                    subvalue: "vs 62% last period",
                  },
                  {
                    title: "90-Day Retention",
                    value: "52%",
                    subvalue: "vs 48% last period",
                  },
                ]}
              />
            </div>
          </>
        )}

        {view === "products" && (
          <>
            {/* Product Analysis */}
            <div
              className={cn(
                "grid gap-4 mb-6",
                isMobile ? "grid-cols-1" : "grid-cols-2"
              )}
            >
              <ListCard
                title="Product Performance"
                description="Top performing products"
                items={analytics.topSellingItems.map((item) => ({
                  title: item.item_name,
                  subtitle: item.category_name,
                  value: `ETB ${item.total_revenue.toLocaleString()}`,
                  subvalue: `${item.total_quantity} units sold`,
                }))}
              />

              <ListCard
                title="Category Analytics"
                description="Performance by category"
                items={analytics.categoryAnalytics.map((category) => ({
                  title: category.category_name,
                  subtitle: `${category.total_items} items`,
                  value: `ETB ${category.total_revenue.toLocaleString()}`,
                  subvalue: `Avg. ETB ${category.average_order_value.toFixed(
                    2
                  )}`,
                }))}
              />
            </div>

            {/* Product Insights */}
            <div
              className={cn(
                "grid gap-4",
                isMobile ? "grid-cols-1" : "grid-cols-2"
              )}
            >
              <ChartCard
                title="Stock Turnover"
                description="Product turnover rate"
              >
                <div className="h-[300px] flex items-center justify-center">
                  {/* Add stock turnover visualization */}
                  <p className="text-muted-foreground">
                    Stock turnover chart coming soon
                  </p>
                </div>
              </ChartCard>

              <ChartCard
                title="Product Mix"
                description="Sales distribution by product type"
              >
                <div className="h-[300px] flex items-center justify-center">
                  {/* Add product mix visualization */}
                  <p className="text-muted-foreground">
                    Product mix chart coming soon
                  </p>
                </div>
              </ChartCard>
            </div>
          </>
        )}
      </ResponsiveWrapper>
    </div>
  );
};

export default AnalyticsPage;