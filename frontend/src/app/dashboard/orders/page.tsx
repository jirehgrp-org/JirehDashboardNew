// @/app/dashboard/orders/page.tsx

"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import Papa from "papaparse";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import { DataTable } from "@/components/shared/tables/DataTable";
import { getColumns } from "@/components/shared/tables/TableHeader";
import { useTransaction } from "@/hooks/features/useTransaction";
import { TransactionForm } from "@/components/shared/forms/TransactionForm";
import type { TransactionItem } from "@/types/features/transaction";
import type { ActionType } from "@/types/shared/table";
import { ResponsiveWrapper } from "@/components/common/ResponsiveWrapper";
import { useResponsive } from "@/hooks/shared/useResponsive";

const OrdersPage = () => {
  const { isMobile } = useResponsive();
  const { language } = useLanguage();
  const t = translations[language].dashboard.transaction.page;
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingOrder, setEditingOrder] = useState<TransactionItem | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<TransactionItem | null>(
    null
  );

  const {
    isLoading,
    data: orders,
    handleSubmit,
    handleDelete: deleteOrder,
    handleUpdate,
  } = useTransaction({
    onSuccess: () => {
      setOpen(false);
      setEditingOrder(null);
      setDeleteDialogOpen(false);
    },
  });

  // Filter orders based on search query
  const filteredOrders = React.useMemo(() => {
    return orders?.filter((order) => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.orderNumber.toLowerCase().includes(searchTerm) ||
        order.customerPhone.toLowerCase().includes(searchTerm)
      );
    });
  }, [orders, searchQuery]);

  const downloadCSV = () => {
    if (!orders?.length) return;

    const date = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    // Flatten orders with their items for CSV export
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

  const onSubmit = async (data: Partial<TransactionItem>) => {
    await handleSubmit(data, editingOrder?.id);
  };

  const handleEdit = (order: TransactionItem) => {
    setEditingOrder(order);
    setOpen(true);
  };

  const handleDelete = (order: TransactionItem) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete.id);
    }
  };

  const handleActionClick = async (
    order: TransactionItem,
    action: ActionType
  ) => {
    if (action !== "mark_paid" && action !== "cancel") return;

    const updates: Partial<TransactionItem> = {
      id: order.id,
      status: action === "cancel" ? "cancelled" : order.status,
      paymentStatus: action === "mark_paid" ? "paid" : order.paymentStatus,
      actions: [
        ...(order.actions || []),
        {
          type: action,
          timestamp: new Date(),
          performedBy: "user",
        },
      ],
    };

    await handleUpdate(order.id, updates);
  };

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
                  <DialogTitle>
                    {editingOrder ? t.editOrder : t.addOrder}
                  </DialogTitle>
                </DialogHeader>
                <TransactionForm
                  initialData={editingOrder}
                  onSubmit={onSubmit}
                  onCancel={() => {
                    setOpen(false);
                    setEditingOrder(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div
          className={cn(
            "flex justify-between items-center",
            isMobile ? "flex-col gap-4" : "flex-row"
          )}
        >
          <div className={cn("w-full", !isMobile && "max-w-sm")}>
            <Input
              placeholder={t.searchOrders}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.totalOrders}: {filteredOrders?.length || 0}
          </div>
        </div>

        <div className="flex-1">
          <DataTable
            columns={getColumns("order", language)}
            data={filteredOrders || []}
            variant="order"
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAction={handleActionClick}
            isLoading={isLoading}
          />
        </div>
      </ResponsiveWrapper>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.areYouSure}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.thisWillPermanentlyDelete} &quot;{orderToDelete?.orderNumber}
              &quot; {t.actionCannotBeUndone}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersPage;
