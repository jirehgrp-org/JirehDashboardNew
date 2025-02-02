// @/app/dashboard/categories/page.tsx

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
import { InventoryForm } from "@/components/shared/forms/InventoryForm";
import { getColumns } from "@/components/shared/tables/TableHeader";
import { useInventory } from "@/hooks/features/useInventory";
import type { InventoryItem } from "@/types/features/inventory";
import { ResponsiveWrapper } from "@/components/common/ResponsiveWrapper";
import { useResponsive } from "@/hooks/shared/useResponsive";

const CategoriesPage = () => {
  const { isMobile } = useResponsive();
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
      <ResponsiveWrapper>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold">
            {t.categories}
            <p className="text-sm md:text-base font-semibold text-zinc-600 dark:text-zinc-400">
              {t.manageYourCategories}
            </p>
          </h2>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={downloadCSV}
              disabled={isLoading}
              className="flex-1 md:flex-none"
            >
              <Download className={cn(isMobile ? "mr-2 h-4 w-4" : "h-4 w-4")} />
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

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:max-w-sm">
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

        <div className="flex-1 -mx-2 md:mx-0">
          <DataTable
            columns={getColumns("category", language)}
            data={filteredCategories || []}
            variant="category"
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </ResponsiveWrapper>
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
