// @/app/dashboard/categories/page.tsx

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
import { InventoryForm } from "@/components/shared/forms/InventoryForm";
import { getColumns } from "@/components/shared/tables/TableHeader";
import { useInventory } from "@/hooks/features/useInventory";
import type { InventoryItem } from "@/types/features/inventory";

const CategoriesPage = () => {
  const { language } = useLanguage();
  const t = translations[language].dashboard.inventory.page;
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCategory, setEditingCategory] = useState<InventoryItem | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    useState<InventoryItem | null>(null);

  const {
    isLoading,
    data: categories,
    handleSubmit,
    handleDelete: deleteCategory,
  } = useInventory({
    endpoint: "categories",
  });

  // Filter to only show categories and apply search
  const filteredCategories = categories?.filter(
    (item) =>
      item.locationId && // Ensure it's a category
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadCSV = () => {
    if (!categories) return;

    const date = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    const csv = Papa.unparse(
      categories
        .filter((item) => item.locationId) // Only include categories
        .map((category) => ({
          name: category.name,
          description: category.description || "",
          locationId: category.locationId,
          active: category.active,
        }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `categories-export-${date}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmit = async (data: Partial<InventoryItem>) => {
    await handleSubmit(data, editingCategory?.id);
    setOpen(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: InventoryItem) => {
    setEditingCategory(category);
    setOpen(true);
  };

  const handleDelete = async (category: InventoryItem) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await deleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-1 h-full flex-col">
      <div className="flex flex-1 h-full">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">
              {t.categories}
              <p className="text-base font-semibold text-zinc-600 dark:text-zinc-400">
                {t.manageYourCategories}
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
                    {t.addCategory}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategory ? t.editCategory : t.addCategory}
                    </DialogTitle>
                  </DialogHeader>
                  <InventoryForm
                    variant="category"
                    initialData={editingCategory}
                    onSubmit={onSubmit}
                    onCancel={() => {
                      setOpen(false);
                      setEditingCategory(null);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="w-full max-w-sm">
              <Input
                placeholder={t.searchCategories}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {t.totalCategories}: {filteredCategories?.length || 0}
            </div>
          </div>

          <div className="flex-1">
            <DataTable
              columns={getColumns("category", language)}
              data={filteredCategories || []}
              variant="category"
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
              {t.thisWillPermanentlyDelete} &quot;{categoryToDelete?.name}&quot;{" "}
              {t.actionCannotBeUndone}
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

export default CategoriesPage;
