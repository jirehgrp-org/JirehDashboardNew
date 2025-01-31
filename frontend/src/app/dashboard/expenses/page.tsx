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
import { OperationForm } from "@/components/shared/forms/operationForm";
import { getColumns } from "@/components/shared/tables/TableHeader";
import { useOperation } from "@/hooks/features/useOperation";
import type { OperationItem } from "@/types/features/operation";

const ExpensesPage = () => {
  const { language } = useLanguage();
  const t = translations[language].dashboard.operation.page;
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingExpense, setEditingExpense] = useState<OperationItem | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<OperationItem | null>(
    null
  );

  const {
    isLoading,
    data: expenses,
    handleSubmit,
    handleDelete: deleteExpense,
  } = useOperation({
    endpoint: "expenses",
  });

  // Filter expenses and apply search
  const filteredExpenses = expenses?.filter(
    (item) =>
      item.amount !== undefined && // Ensure it's an expense
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.frequency?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const downloadCSV = () => {
    if (!expenses) return;

    const date = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    const csv = Papa.unparse(
      expenses
        .filter((item) => item.amount !== undefined) // Only include expenses
        .map((expense) => ({
          name: expense.name,
          amount: expense.amount,
          frequency: expense.frequency,
          description: expense.description || "",
          active: expense.active,
        }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `expenses-export-${date}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmit = async (data: Partial<OperationItem>) => {
    await handleSubmit(data, editingExpense?.id);
    setOpen(false);
    setEditingExpense(null);
  };

  const handleEdit = (expense: OperationItem) => {
    setEditingExpense(expense);
    setOpen(true);
  };

  const handleDelete = async (expense: OperationItem) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (expenseToDelete) {
      await deleteExpense(expenseToDelete.id);
      setExpenseToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-1 h-full flex-col">
      <div className="flex flex-1 h-full">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">
              {t.expenses}
              <p className="text-base font-semibold text-zinc-600 dark:text-zinc-400">
                {t.manageYourExpenses}
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
                    {t.addExpense}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingExpense ? t.editExpense : t.addExpense}
                    </DialogTitle>
                  </DialogHeader>
                  <OperationForm
                    variant="expense"
                    initialData={editingExpense}
                    onSubmit={onSubmit}
                    onCancel={() => {
                      setOpen(false);
                      setEditingExpense(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="w-full max-w-sm">
              <Input
                placeholder={t.searchExpenses}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t.totalExpenses}: {filteredExpenses?.length || 0}
            </div>
          </div>

          <div className="flex-1">
            <DataTable
              columns={getColumns("expense", language)}
              data={filteredExpenses || []}
              variant="expense"
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.areYouSure}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.thisWillPermanentlyDelete} &quot;{expenseToDelete?.name}&quot;{" "}
              {t.actionCannotBeUndone}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExpensesPage;