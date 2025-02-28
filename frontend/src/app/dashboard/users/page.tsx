// @/app/dashboard/users/page.tsx
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
import { OperationForm } from "@/components/shared/forms/operationForm";
import { getColumns } from "@/components/shared/tables/TableHeader";
import { useOperation } from "@/hooks/features/useOperation";
import type { OperationItem } from "@/types/features/operation";
import { ResponsiveWrapper } from "@/components/common/ResponsiveWrapper";
import { useResponsive } from "@/hooks/shared/useResponsive";
import { useAuth } from "@/hooks/shared/useAuth"; // Import your auth hook

const UsersPage = () => {
  const { isMobile } = useResponsive();
  const { language } = useLanguage();
  const { user: currentUser } = useAuth(); // Get the current logged-in user
  const t = translations[language].dashboard.operation.page;
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<OperationItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<OperationItem | null>(null);

  const {
    isLoading,
    data: users,
    handleSubmit,
    handleDelete: deleteUser,
  } = useOperation({
    endpoint: "users",
  });

  // Filter users:
  // 1. Apply search query
  // 2. Exclude the current logged-in user
  // 3. Exclude users with roles "owner" or "manager"
  const filteredUsers = users?.filter(
    (item) =>
      item.username && // Ensure it's a user
      // Apply search filter
      (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.username.toLowerCase().includes(searchQuery.toLowerCase())) &&
      // Exclude the current logged-in user
      item.id !== currentUser?.id &&
      // Exclude users with "owner" or "manager" roles
      item.role !== "owner" &&
      item.role !== "manager"
  );

  const downloadCSV = () => {
    if (!filteredUsers) return;

    const date = new Date()
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    const csv = Papa.unparse(
      filteredUsers
        .filter((item) => item.username && item.email) // Only include users
        .map((user) => ({
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          active: user.active,
        }))
    );

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `users-export-${date}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onSubmit = async (data: Partial<OperationItem>) => {
    await handleSubmit(data, editingUser?.id);
    setOpen(false);
    setEditingUser(null);
  };

  const handleEdit = (user: OperationItem) => {
    setEditingUser(user);
    setOpen(true);
  };

  const handleDelete = async (user: OperationItem) => {
    // Prevent deleting if the user is a manager or owner (extra safety)
    if (user.role === "owner" || user.role === "manager") {
      console.warn("Cannot delete users with role 'owner' or 'manager'");
      return;
    }
    
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setUserToDelete(null);
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
            {t.users}
            <p className="text-sm md:text-base font-semibold text-zinc-600 dark:text-zinc-400">
              {t.manageYourUsers}
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
                  {t.addUser}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUser ? t.editUser : t.addUser}
                  </DialogTitle>
                </DialogHeader>
                <OperationForm
                  variant="user"
                  initialData={editingUser}
                  onSubmit={onSubmit}
                  onCancel={() => {
                    setOpen(false);
                    setEditingUser(null);
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
              placeholder={t.searchUsers}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.totalUsers}: {filteredUsers?.length || 0}
          </div>
        </div>

        <div className="flex-1">
          <DataTable
            columns={getColumns("user", language)}
            data={filteredUsers || []}
            variant="user"
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
              {t.thisWillPermanentlyDelete} &quot;{userToDelete?.name}
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

export default UsersPage;