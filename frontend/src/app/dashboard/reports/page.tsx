/* eslint-disable @typescript-eslint/no-explicit-any */
// @/app/dashboard/reports/page.tsx

"use client";
import React, { useState } from "react";
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  Download,
  FileText,
  Table,
  FileDown,
  CalendarIcon,
  Calendar as CalendarIcon2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ResponsiveWrapper } from "@/components/common/ResponsiveWrapper";
import { useResponsive } from "@/hooks/shared/useResponsive";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransaction } from "@/hooks/features/useTransaction";
import { useInventory } from "@/hooks/features/useInventory";
import { useOperation } from "@/hooks/features/useOperation";
import Papa from "papaparse";
import { DateRange } from "react-day-picker";

interface SalesReportItem {
  Items_Ordered: string;
  Customer: string;
  Total: number;
  Status: string;
  Payment_Status: string;
  Payment_Method: string;
  Date: string;
}

interface InventoryReportItem {
  Item_Name: string;
  Price: number;
  Quantity: number;
  Status: string;
  Last_Updated: string;
}

interface FinancialReportItem {
  Name: string;
  Amount: number;
  Frequency: string;
  Date: string;
}

type ReportType = "sales" | "inventory" | "financial";
type TimeframeType = "all" | "today" | "week" | "month" | "year" | "custom";

const ReportsPage = () => {
  const [reportType, setReportType] = useState<ReportType>("sales");
  const { isMobile } = useResponsive();
  const [isLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<TimeframeType>("all");
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const { data: orders } = useTransaction({});
  const { data: inventory } = useInventory({ endpoint: "items" });
  const { data: expenses } = useOperation({ endpoint: "expenses" });

  const getDateRange = () => {
    const now = new Date();
    let start: Date | undefined;
    let end: Date | undefined;

    if (timeframe === "custom" && date?.from) {
      start = startOfDay(date.from);
      end = date.to ? endOfDay(date.to) : endOfDay(now);
    } else {
      switch (timeframe) {
        case "today":
          start = startOfDay(now);
          end = endOfDay(now);
          break;
        case "week":
          start = startOfDay(subDays(now, 7));
          end = endOfDay(now);
          break;
        case "month":
          start = startOfDay(subMonths(now, 1));
          end = endOfDay(now);
          break;
        case "year":
          start = startOfDay(subYears(now, 1));
          end = endOfDay(now);
          break;
        default:
          return { start: undefined, end: undefined };
      }
    }

    return { start, end };
  };

  const filterDataByDateRange = <T extends { Date: string }>(
    data: T[]
  ): T[] => {
    const { start, end } = getDateRange();
    if (!start && !end) return data;

    return data.filter((item) => {
      const itemDate = new Date(item.Date);
      const isAfterStart = !start || itemDate >= start;
      const isBeforeEnd = !end || itemDate <= end;
      return isAfterStart && isBeforeEnd;
    });
  };

  const getReportData = () => {
    switch (reportType) {
      case "sales": {
        const data = orders.map(
          (order): SalesReportItem => ({
            Customer: order.customerName,
            Items_Ordered: order.items?.map((item: any) => item.name).join(", ") || "",
            Total: order.total,
            Status: order.status,
            Payment_Status: order.paymentStatus,
            Payment_Method: order.paymentMethod,
            Date: new Date(order.orderDate).toLocaleDateString(),
          })
        );        
        return filterDataByDateRange(data);
      }
      case "inventory": {
        const data = inventory.map(
          (item): InventoryReportItem => ({
            Item_Name: item.name,
            Price: item.price || 0,
            Quantity: item.quantity || 0,
            Status: item.active ? "Active" : "Inactive",
            Last_Updated: new Date(item.updatedAt).toLocaleDateString(),
          })
        );
        return data;
      }
      case "financial": {
        const data = expenses.map(
          (exp): FinancialReportItem => ({
            Name: exp.name,
            Amount: exp.amount || 0,
            Frequency: exp.frequency || "One-time",
            Date: new Date(exp.createdAt).toLocaleDateString(),
          })
        );
        return filterDataByDateRange(data);
      }
      default:
        return [];
    }
  };

  const downloadCSV = () => {
    const data = getReportData();
    const csv = Papa.unparse(data as any);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const dateStr =
      timeframe === "custom" && date?.from
        ? `${format(date.from, "yyyy-MM-dd")}_to_${
            date.to ? format(date.to, "yyyy-MM-dd") : "now"
          }`
        : timeframe;
    link.download = `${reportType}_report_${dateStr}.csv`;
    link.click();
  };

  const downloadPDF = () => {
    const data = getReportData();
    const headers = Object.keys(data[0] || {});
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${
          reportType.charAt(0).toUpperCase() + reportType.slice(1)
        } Report</title>
        <style>
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          h1 { color: #333; }
          .meta { color: #666; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${
          reportType.charAt(0).toUpperCase() + reportType.slice(1)
        } Report</h1>
        <div class="meta">
          Generated on: ${new Date().toLocaleString()}<br>
          ${timeframe !== "all" ? `Period: ${timeframe}` : ""}
        </div>
        <table>
          <thead>
            <tr>${headers
              .map((h) => `<th>${h.replace(/_/g, " ")}</th>`)
              .join("")}</tr>
          </thead>
          <tbody>
            ${data
              .map(
                (row) => `
              <tr>
                ${headers
                  .map(
                    (header) => `<td>${row[header as keyof typeof row]}</td>`
                  )
                  .join("")}
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([pdfContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    win?.print();
  };

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value as TimeframeType);
    if (value !== "custom") {
      setDate(undefined);
    }
  };

  return (
    <div className="flex flex-1 h-full flex-col overflow-y-auto">
      <ResponsiveWrapper className="pb-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2
            className={cn(
              "text-2xl md:text-3xl font-bold",
              isMobile && "w-full"
            )}
          >
            Reports
            <p className="text-sm md:text-base font-semibold text-zinc-600 dark:text-zinc-400">
              Download your business reports in various formats
            </p>
          </h2>
        </div>

        {/* Report Generator Card */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>
              Select the type of report and time range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Select
                  value={reportType}
                  onValueChange={(value) => setReportType(value as ReportType)}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                    <SelectItem value="financial">Financial Report</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timeframe} onValueChange={handleTimeframeChange}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>

                {timeframe === "custom" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[240px] justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={downloadCSV}
                >
                  <Table className="h-4 w-4" />
                  Download CSV
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={downloadPDF}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled
                >
                  <FileText className="h-4 w-4" />
                  {isLoading ? "Creating Sheet..." : "Open in Google Sheets"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards Grid */}
        <div
          className={cn("grid gap-6", isMobile ? "grid-cols-1" : "grid-cols-3")}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Reports
              </CardTitle>
              <FileDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Sales, Inventory, and Financial reports
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Download Formats
              </CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                CSV, PDF, and Google Sheets
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last Generated
              </CardTitle>
              <CalendarIcon2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date().toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Updated in real-time
              </p>
            </CardContent>
          </Card>
        </div>
      </ResponsiveWrapper>
    </div>
  );
};

export default ReportsPage;