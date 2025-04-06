// @/app/dashboard/orders/page.tsx

"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Download, Settings2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Bold } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import { DataTable } from "@/components/shared/tables/DataTable";
import { useColumns } from "@/components/shared/tables/useColumn";
import { useTransaction } from "@/hooks/features/useTransaction";
import { TransactionForm } from "@/components/shared/forms/TransactionForm";
import OrderDetailsDialog from "@/components/features/dashboard/OrderDetailsDialog";
import type { TransactionItem } from "@/types/features/transaction";
import type { UserRole } from "@/types/shared/auth";
import { ResponsiveWrapper } from "@/components/common/ResponsiveWrapper";
import { useResponsive } from "@/hooks/shared/useResponsive";

const OrdersPage = () => {
  const { isMobile } = useResponsive();
  const { language } = useLanguage();
  const t = translations[language].dashboard.transaction.page;
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<TransactionItem | null>(
    null
  );
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [serviceType, setServiceType] = useState<"retail" | "foodService">("retail");

  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Get user role from localStorage
  const userRole = (localStorage.getItem("userRole") as UserRole) || "manager";
  console.log("Current user role in OrdersPage:", userRole);
  const canAddOrders = ["sales"].includes(userRole);

  const {
    isLoading,
    data: orders,
    handleSubmit,
    handleUpdate,
  } = useTransaction({
    onSuccess: () => {
      setOpen(false);
      setSelectedOrder(null);
      setDetailsDialogOpen(false);
    },
  });

  // Filter orders based on search query
  const filteredOrders = React.useMemo(() => {
    const filtered = orders?.filter((order) => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.customerPhone.toLowerCase().includes(searchTerm) ||
        order.items.some((item) => item.name.toLowerCase().includes(searchTerm))
      );
    }) || [];

    // Sort by orderDate
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.orderDate).getTime();
      const dateB = new Date(b.orderDate).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [orders, searchQuery, sortOrder]);


  const downloadCSV = () => {
    if (!orders?.length) return;

    const date = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    const flattenedOrders = orders.flatMap((order) =>
      order.items.map((item) => ({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail || "",
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price,
        status: order.status,
        paymentStatus: order.paymentStatus,
        orderDate: new Date(order.orderDate).toLocaleDateString(),
        total: order.total,
        userId: order.user,
      }))
    );

    const csv = Papa.unparse(flattenedOrders);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `orders-export-${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOrderAction = async (
    order: TransactionItem,
    action: "mark_paid" | "complete" | "cancel"
  ) => {
    const updates: Partial<TransactionItem> = {
      id: order.id,
      status:
        action === "cancel"
          ? "cancelled"
          : action === "complete"
            ? "completed"
            : order.status,
      paymentStatus:
        action === "cancel"
          ? "cancelled"
          : action === "mark_paid"
            ? "paid"
            : order.paymentStatus,
      actions: [
        ...(order.actions || []),
        {
          type: action,
          timestamp: new Date(),
          performedBy: userRole,
        },
      ],
    };

    await handleUpdate(order.id, updates);
  };

  const handleRowClick = (order: TransactionItem) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const onSubmit = async (data: Partial<TransactionItem>) => {
    await handleSubmit(data);
  };

  const columns = useColumns("order");
  const tableColumns = React.useMemo(() => {
    return columns.filter((column) => column.id !== "actions");
  }, [columns]);

  return (
    <div className="flex flex-1 h-full flex-col">
      <ResponsiveWrapper>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2
            className={cn(
              "text-2xl md:text-3xl font-bold",
              isMobile && "w-full"
            )}
          >
            {t.orders}
            <p className="text-sm md:text-base font-semibold text-zinc-600 dark:text-zinc-400">
              {t.manageYourOrders}
            </p>
          </h2>

          <div
            className={cn(
              "flex items-center gap-2",
              isMobile ? "w-full flex-col" : "flex-row"
            )}
          >

            <Button
              variant="outline"
              onClick={downloadCSV}
              disabled={isLoading || !orders?.length}
              className={cn(isMobile && "w-full")}
            >
              <Download className={cn(isMobile ? "mr-2 h-4 w-4" : "h-4 w-4")} />
            </Button>

            {/* ServiceType Toggle placed next to the buttons */}
            <Toggle
              aria-label="Toggle service type"
              pressed={serviceType === "foodService"}
              onPressedChange={(pressed: boolean) => {
                setServiceType(pressed ? "foodService" : "retail");
              }}
              className="bg-neutral-200 dark:bg-neutral-700 inline-flex items-center p-1 rounded-full shadow-lg"
            >
              <Bold className="h-4 w-4" />
            </Toggle>


            {canAddOrders && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={isLoading}
                    className={cn(isMobile && "w-full")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t.addOrder}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>{t.addOrder}</DialogTitle>
                  </DialogHeader>
                  <TransactionForm
                    initialData={selectedOrder}
                    onSubmit={onSubmit}
                    onCancel={() => {
                      setOpen(false);
                      setSelectedOrder(null);
                    }}
                    serviceType={serviceType}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div
          className={cn(
            "flex justify-between items-center",
            isMobile ? "flex-col gap-4" : "flex-row"
          )}
        >
          <div className={cn("w-full flex items-center gap-2", !isMobile && "max-w-sm")}>
            <Input
              placeholder={t.searchOrders}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={isLoading || !orders?.length}
                  className="flex items-center justify-center h-10 w-10"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortOrder("desc")}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("asc")}>
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>View Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setItemsPerPage(10)}>
                  Show 10 per page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setItemsPerPage(25)}>
                  Show 25 per page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setItemsPerPage(50)}>
                  Show 50 per page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.totalOrders}: {filteredOrders?.length || 0}
          </div>
        </div>

        <div className="flex-1">
          <DataTable
            columns={tableColumns}
            data={filteredOrders || []}
            variant="order"
            onRowClick={handleRowClick}
            isLoading={isLoading}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
          />
        </div>
      </ResponsiveWrapper>

      <OrderDetailsDialog
        order={selectedOrder}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onAction={handleOrderAction}
      />
    </div>
  );
};

export default OrdersPage;
