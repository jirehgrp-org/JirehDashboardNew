// @/app/dashboard/branches/page.tsx

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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

const BranchesPage = () => {
  const { isMobile } = useResponsive();
  const { language } = useLanguage();
  const t = translations[language].dashboard.inventory.page;
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingBranch, setEditingBranch] = useState<InventoryItem | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] =
    useState<InventoryItem | null>(null);

  const handleAddBranchClick = () => {
    if (!filteredBranches || filteredBranches.length < 1) {
      setOpen(true);
    }
  };

  const {
    isLoading,
    data: branches,
    handleSubmit,
    handleDelete: deleteBranch,
  } = useInventory({
    endpoint: "branches",
  });

  // Filter to only show branches and apply search
  const filteredBranches = branches?.filter(
    (item) =>
      item.address && // Ensure it's a branch
      item.contactNumber && // Additional check for branch type
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const downloadCSV = () => {
    if (!branches) return;

    const date = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    const csv = Papa.unparse(
      branches
        .filter((item) => item.address && item.contactNumber) // Only include branches
        .map((branch) => ({
          name: branch.name,
          address: branch.address,
          contactNumber: branch.contactNumber,
          active: branch.active,
        }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `branches-export-${date}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmit = async (data: Partial<InventoryItem>) => {
    await handleSubmit(data, editingBranch?.id);
    setOpen(false);
    setEditingBranch(null);
  };

  const handleEdit = (branch: InventoryItem) => {
    setEditingBranch(branch);
    setOpen(true);
  };

  const handleDelete = async (branch: InventoryItem) => {
    setBranchToDelete(branch);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (branchToDelete) {
      await deleteBranch(branchToDelete.id);
      setBranchToDelete(null);
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
            {t.branches}
            <p className="text-sm md:text-base font-semibold text-zinc-600 dark:text-zinc-400">
              {t.manageYourBranches}
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
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Button
                        disabled={isLoading || (filteredBranches && filteredBranches.length >= 1)}
                        className={cn(isMobile && "w-full")}
                        onClick={handleAddBranchClick}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        {t.addBranch}
                      </Button>
                    </div>
                  </TooltipTrigger>
                  {filteredBranches && filteredBranches.length >= 1 && (
                    <TooltipContent>
                      <p>Can only add one branch on this plan</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              <DialogTrigger asChild>
                <span className="hidden">Trigger</span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingBranch ? t.editBranch : t.addBranch}
                  </DialogTitle>
                </DialogHeader>
                <InventoryForm
                  variant="branch"
                  initialData={editingBranch}
                  onSubmit={onSubmit}
                  onCancel={() => {
                    setOpen(false);
                    setEditingBranch(null);
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
              placeholder={t.searchBranches}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.totalBranches}: {filteredBranches?.length || 0}
          </div>
        </div>

        <div className="flex-1">
          <DataTable
            columns={getColumns("branch", language)}
            data={filteredBranches || []}
            variant="branch"
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
              {t.thisWillPermanentlyDelete} &quot;{branchToDelete?.name}
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

export default BranchesPage;
