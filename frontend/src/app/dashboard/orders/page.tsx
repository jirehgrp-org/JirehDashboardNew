// @/app/dashboard/orders/page.tsx

"use client";
import React, { useState } from "react";
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
import type { TransactionItem } from "@/types/features/transaction";

const OrdersPage = () => {
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
    handleStatusChange,
  } = useTransaction();

  // Filter orders based on search query
  const filteredOrders = orders?.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadCSV = () => {
    if (!orders) return;

    const date = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    const csv = Papa.unparse(
      orders.map((order) => ({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail || "",
        itemId: order.itemId,
        quantity: order.quantity,
        status: order.status,
        paymentStatus: order.paymentStatus,
        orderDate: order.orderDate,
      }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `orders-export-${date}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmit = async (data: Partial<TransactionItem>) => {
    await handleSubmit(data, editingOrder?.id);
    setOpen(false);
    setEditingOrder(null);
  };

  const handleEdit = (order: TransactionItem) => {
    setEditingOrder(order);
    setOpen(true);
  };

  const handleDelete = async (order: TransactionItem) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete.id);
      setOrderToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleActionClick = async (
    order: TransactionItem,
    action: "mark_paid" | "cancel"
  ) => {
    await handleStatusChange(order.id, action);
  };

  return (
    <div className="flex flex-1 h-full flex-col">
      <div className="flex flex-1 h-full">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">
              {t.orders}
              <p className="text-base font-semibold text-zinc-600 dark:text-zinc-400">
                {t.manageYourOrders}
              </p>
            </h2>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={downloadCSV}
                disabled={isLoading}
              >
                <Download />
              </Button>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button disabled={isLoading}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t.addOrder}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingOrder ? t.editOrder : t.addOrder}
                    </DialogTitle>
                  </DialogHeader>
                  <OrderForm
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

          <div className="flex justify-between items-center">
            <div className="w-full max-w-sm">
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
            />
          </div>
        </div>
      </div>
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
