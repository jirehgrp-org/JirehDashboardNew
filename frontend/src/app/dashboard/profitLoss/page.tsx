// @/app/dashboard/proftLoss/page.tsx

"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Receipt,
  PiggyBank,
  TrendingUp,
  Clock,
} from "lucide-react";
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
import { useOperation } from "@/hooks/features/useOperation";

const ProfitLoss = () => {
  const { isMobile } = useResponsive();
  const { language } = useLanguage();
  const { timeframe, setTimeframe, metrics, chartData, analytics } =
    useDashboard();
  const { data: expenses } = useOperation({ endpoint: "expenses" });
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  // Calculate profit & loss metrics
  const netProfit = metrics.totalRevenue - metrics.totalExpenses;
  const profitMargin = (netProfit / metrics.totalRevenue) * 100;

  // Profit distribution data
  const profitData = [
    { name: "Sales", value: metrics.totalRevenue * 0.7 },
    { name: "Other Income", value: metrics.totalRevenue * 0.3 },
  ];

  // Expense distribution data
  const expenseData = useMemo(() => {
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.frequency || "Other";
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += expense.amount || 0;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value,
    }));
  }, [expenses]);

  // Recent transactions
  const transactions = useMemo(
    () => [
      ...analytics.topSellingItems.map((item) => ({
        date: new Date().toLocaleDateString(),
        type: "Revenue",
        description: `Sale of ${item.item_name}`,
        amount: item.total_revenue,
        isProfit: true,
      })),
      ...expenses.map((expense) => ({
        date: new Date(expense.createdAt).toLocaleDateString(),
        type: "Expense",
        description: expense.name,
        amount: expense.amount || 0,
        isProfit: false,
      })),
    ],
    [analytics.topSellingItems, expenses]
  );

  // Sort and filter transactions
  const sortedTransactions = useMemo(() => {
    return [...transactions]
      .filter((transaction) =>
        transactionFilter === "all"
          ? true
          : transactionFilter === "revenue"
          ? transaction.isProfit
          : !transaction.isProfit
      )
      .sort((a, b) => {
        const aValue = a[sortBy as keyof typeof a];
        const bValue = b[sortBy as keyof typeof b];

        if (sortBy === "date") {
          return sortOrder === "asc"
            ? new Date(a.date).getTime() - new Date(b.date).getTime()
            : new Date(b.date).getTime() - new Date(a.date).getTime();
        }

        if (sortBy === "amount") {
          return sortOrder === "asc"
            ? a.amount - b.amount
            : b.amount - a.amount;
        }

        return sortOrder === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
  }, [transactions, sortBy, sortOrder, transactionFilter]);

  const handleSort = (key: React.SetStateAction<string>) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="flex flex-1 h-full flex-col overflow-y-auto">
      <ResponsiveWrapper className="pb-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Profit & Loss
              <p className="text-sm md:text-base font-semibold text-zinc-600 dark:text-zinc-400">
                Complete breakdown of profit & loss analysis
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
                  : "previous period"}
              </span>
            }
            valuePrefix="ETB "
            iconColor="text-green-600"
          />
          <MetricCard
            title="Total Expenses"
            value={metrics.totalExpenses}
            icon={Receipt}
            description="Operating costs and expenses"
            valuePrefix="ETB "
            iconColor="text-red-600"
          />
          <MetricCard
            title="Net Profit"
            value={netProfit}
            icon={PiggyBank}
            description="Net earnings after expenses"
            valuePrefix="ETB "
            iconColor="text-blue-600"
          />
          <MetricCard
            title="Profit Margin"
            value={profitMargin}
            icon={TrendingUp}
            description="Of total revenue"
            valueSuffix="%"
            iconColor="text-purple-600"
          />
        </div>

        {/* Distribution Charts */}
        <div
          className={cn(
            "grid gap-4 mb-6",
            isMobile ? "grid-cols-1" : "grid-cols-2"
          )}
        >
          <ChartCard
            title="Profit Distribution"
            description={`Revenue breakdown for ${
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
                : "all time"
            }`}
          >
            <div className="h-[300px]">
              <PieChart
                data={profitData}
                colors={[CHART_COLORS.primary, CHART_COLORS.secondary]}
              />
            </div>
          </ChartCard>

          <ChartCard
            title="Expense Distribution"
            description={`Expense breakdown for ${
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
                : "all time"
            }`}
          >
            <div className="h-[300px]">
              <PieChart
                data={expenseData}
                colors={[CHART_COLORS.warning, CHART_COLORS.error]}
              />
            </div>
          </ChartCard>
        </div>

        {/* Profit & Loss Trend */}
        <div className="mb-6">
          <ChartCard
            title="Profit & Loss Trends"
            description="Revenue vs Expenses over time"
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

        {/* Recent Transactions */}
        <div className="mb-6">
          <ChartCard
            title="Recent Transactions"
            description="Latest financial activities"
            action={
              <Select
                value={transactionFilter}
                onValueChange={setTransactionFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter transactions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="revenue">Revenue Only</SelectItem>
                  <SelectItem value="expenses">Expenses Only</SelectItem>
                </SelectContent>
              </Select>
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    onClick={() => handleSort("date")}
                    className="cursor-pointer"
                  >
                    Date{" "}
                    {sortBy === "date" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("type")}
                    className="cursor-pointer"
                  >
                    Type{" "}
                    {sortBy === "type" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("description")}
                    className="cursor-pointer"
                  >
                    Description{" "}
                    {sortBy === "description" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("amount")}
                    className="cursor-pointer text-right"
                  >
                    Amount{" "}
                    {sortBy === "amount" && (sortOrder === "asc" ? "↑" : "↓")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell
                      className={cn(
                        "text-right",
                        transaction.isProfit ? "text-green-600" : "text-red-600"
                      )}
                    >
                      {transaction.isProfit ? "+" : "-"}ETB{" "}
                      {transaction.amount.toLocaleString()}
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

export default ProfitLoss;