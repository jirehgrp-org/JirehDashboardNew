/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @/hooks/features/useDashboard.ts

import { useState, useMemo } from "react";
import { useToast } from "@/hooks/shared/useToast";
import { useTransaction } from "./useTransaction";
import { useInventory } from "./useInventory";
import type { DashboardAnalytics, DashboardChartData, DashboardMetrics, TimeframeOption } from "@/types/features/dashboard";
import Papa from "papaparse";

export const useDashboard = () => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("total");
  const { toast } = useToast();

  // Load data from existing hooks
  const { data: orders, isLoading: ordersLoading } = useTransaction({});
  const { data: inventory, isLoading: inventoryLoading } = useInventory({
    endpoint: "items",
  });
  const { data: categories } = useInventory({ endpoint: "categories" });

  const isLoading = ordersLoading || inventoryLoading;

  // Get date range based on timeframe
  const getDateRange = (timeframe: TimeframeOption) => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (timeframe) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start.setDate(start.getDate() - 7);
        break;
      case "month":
        start.setMonth(start.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(start.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(start.getFullYear() - 1);
        break;
      case "total":
        return null;
    }

    return { start, end: now };
  };

  // Filter orders based on timeframe
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (timeframe === "total") return orders;

    const dateRange = getDateRange(timeframe);
    if (!dateRange) return orders;

    return orders.filter((order) => {
      const orderDate = new Date(order.orderDate);
      return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });
  }, [orders, timeframe]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const uniqueCustomers = new Set(
      filteredOrders.map((order) => order.customerPhone)
    ).size;
    const averageOrderValue = totalRevenue / (filteredOrders.length || 1);

    // Calculate growth
    const dateRange = getDateRange(timeframe);
    let growth = 0;

    if (dateRange && orders) {
      const previousStart = new Date(dateRange.start);
      const previousEnd = new Date(dateRange.start);

      switch (timeframe) {
        case "today":
          previousStart.setDate(previousStart.getDate() - 1);
          previousEnd.setDate(previousEnd.getDate() - 1);
          break;
        case "week":
          previousStart.setDate(previousStart.getDate() - 7);
          break;
        case "month":
          previousStart.setMonth(previousStart.getMonth() - 1);
          break;
        case "quarter":
          previousStart.setMonth(previousStart.getMonth() - 3);
          break;
        case "year":
          previousStart.setFullYear(previousStart.getFullYear() - 1);
          break;
      }

      const previousPeriodOrders = orders.filter((order) => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= previousStart && orderDate <= previousEnd;
      });

      const previousTotal = previousPeriodOrders.reduce(
        (sum, order) => sum + order.total,
        0
      );
      growth = previousTotal
        ? ((totalRevenue - previousTotal) / previousTotal) * 100
        : 0;
    }

    return {
      totalRevenue,
      uniqueCustomers,
      averageOrderValue,
      growth,
    };
  }, [filteredOrders, orders, timeframe]);

  // Get chart data
  const chartData = useMemo(() => {
    // Revenue trend data
    const revenueData = filteredOrders
      .reduce((acc: Array<{ date: string; amount: number }>, order) => {
        const date = new Date(order.orderDate).toLocaleDateString();
        const existingDay = acc.find((item) => item.date === date);

        if (existingDay) {
          existingDay.amount += order.total;
        } else {
          acc.push({ date, amount: order.total });
        }

        return acc;
      }, [])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Payment methods data
    const paymentMethods = Object.entries(
      filteredOrders.reduce((acc: Record<string, number>, order) => {
        const status = order.paymentStatus;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    return {
      revenueData,
      paymentMethods,
    };
  }, [filteredOrders]);

  // Get analytics
  const analytics = useMemo(() => {
    const categoryMap = new Map(
      categories?.map((cat) => [cat.id, cat.name]) || []
    );

    const itemDetailsMap = new Map(
      inventory?.map((item) => [
        item.id,
        {
          name: item.name,
          category: item.categoryId
            ? categoryMap.get(item.categoryId) || "Uncategorized"
            : "Uncategorized",
        },
      ]) || []
    );

    // Top selling items
    const itemSales = filteredOrders.reduce(
      (
        acc: Record<
          string,
          {
            total_revenue: number;
            total_quantity: number;
            item_name: string;
            category_name: string;
          }
        >,
        order
      ) => {
        order.items.forEach((item) => {
          const itemDetails = itemDetailsMap.get(item.itemId);
          if (!itemDetails) return;

          const key = item.itemId;
          if (!acc[key]) {
            acc[key] = {
              total_revenue: 0,
              total_quantity: 0,
              item_name: itemDetails.name,
              category_name: itemDetails.category || "Uncategorized",
            };
          }
          acc[key].total_revenue += item.price * item.quantity;
          acc[key].total_quantity += item.quantity;
        });
        return acc;
      },
      {}
    );

    const topSellingItems = Object.entries(itemSales)
      .map(([item_id, data]) => ({
        item_id,
        ...data,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 5);

    // Customer analytics
    const customerAnalytics = Object.values(
      filteredOrders.reduce((acc: Record<string, any>, order) => {
        const key = order.customerPhone;
        if (!acc[key]) {
          acc[key] = {
            customer_id: key,
            customer_name: order.customerName,
            total_orders: 0,
            total_amount: 0,
            average_order_value: 0,
          };
        }
        acc[key].total_orders += 1;
        acc[key].total_amount += order.total;
        acc[key].average_order_value =
          acc[key].total_amount / acc[key].total_orders;
        return acc;
      }, {})
    ).sort((a, b) => b.total_amount - a.total_amount);

    return {
      topSellingItems,
      customerAnalytics,
      categoryAnalytics: Object.values(
        filteredOrders.reduce((acc: Record<string, any>, order) => {
          order.items.forEach((item) => {
            const itemDetails = itemDetailsMap.get(item.itemId);
            if (!itemDetails) return;

            const key = itemDetails.category || "Uncategorized";
            if (!acc[key]) {
              acc[key] = {
                category_name: key,
                total_items: 0,
                total_revenue: 0,
                average_order_value: 0,
              };
            }
            acc[key].total_items += item.quantity;
            acc[key].total_revenue += item.price * item.quantity;
          });

          // Calculate average for each category
          Object.values(acc).forEach((cat) => {
            cat.average_order_value = cat.total_revenue / cat.total_items;
          });

          return acc;
        }, {})
      ).sort((a, b) => b.total_revenue - a.total_revenue),
    };
  }, [filteredOrders, inventory, categories]);

  // Export functionality
  const handleExport = async (type: "pdf" | "csv") => {
    if (type === "csv") {
      const exportData = filteredOrders.map((order) => ({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        orderDate: new Date(order.orderDate).toLocaleDateString(),
      }));

      const csv = Papa.unparse(exportData);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `dashboard-export-${timeframe}-${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: "Feature not available",
        description: "PDF export is not yet implemented",
        variant: "destructive",
      });
    }
  };

  return {
    timeframe,
    setTimeframe,
    metrics: metrics as DashboardMetrics,
    chartData: chartData as DashboardChartData,
    analytics: analytics as DashboardAnalytics,
    isLoading,
    handleExport,
  };
};

export default useDashboard;
