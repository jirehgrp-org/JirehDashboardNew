// @/app/dashboard/items/page.tsx

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

const ItemsPage = () => {
  const { isMobile } = useResponsive();
  const { language } = useLanguage();
  const t = translations[language].dashboard.inventory.page;
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const {
    isLoading,
    data: items,
    handleSubmit,
    handleDelete: deleteItem,
  } = useInventory({
    endpoint: "items",
  });

  // Filter to only show items and apply search
  const filteredItems = items?.filter(
    (item) =>
      item.categoryId && // Ensure it's an item
      typeof item.price === "number" && // Additional check for item type
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadCSV = () => {
    if (!items) return;

    const date = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    const csv = Papa.unparse(
      items
        .filter((item) => item.categoryId && typeof item.price === "number") // Only include items
        .map((item) => ({
          name: item.name,
          categoryId: item.categoryId,
          price: item.price,
          quantity: item.quantity,
          active: item.active,
        }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `items-export-${date}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmit = async (data: Partial<InventoryItem>) => {
    await handleSubmit(data, editingItem?.id);
    setOpen(false);
    setEditingItem(null);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setOpen(true);
  };

  const handleDelete = async (item: InventoryItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete.id);
      setItemToDelete(null);
      setDeleteDialogOpen(false);
    }
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
            {t.items}
            <p className="text-sm md:text-base font-semibold text-zinc-600 dark:text-zinc-400">
              {t.manageYourItems}
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
              disabled={isLoading}
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
                  {t.addItem}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? t.editItem : t.addItem}
                  </DialogTitle>
                </DialogHeader>
                <InventoryForm
                  variant="item"
                  initialData={editingItem}
                  onSubmit={onSubmit}
                  onCancel={() => {
                    setOpen(false);
                    setEditingItem(null);
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
              placeholder={t.searchItems}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.totalItems}: {filteredItems?.length || 0}
          </div>
        </div>

        <div className="flex-1">
          <DataTable
            columns={getColumns("item", language)}
            data={filteredItems || []}
            variant="item"
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
              {t.thisWillPermanentlyDelete} &quot;{itemToDelete?.name}
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

export default ItemsPage;
