/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// @/app/dashboard/locations/page.tsx
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/tables/DataTable";
import { InventoryForm } from "@/components/shared/forms/InventoryForm";

const LocationsPage = () => {
  const [open, setOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const handleSubmit = async (data: any) => {
    setOpen(false);
  };

  return (
    <div className="flex flex-1 h-full flex-col">
      <div className="flex flex-1 h-full">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4 flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold">Items</h2>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingLocation ? "Edit Location" : "Add Location"}
                  </DialogTitle>
                </DialogHeader>
                <InventoryForm
                  variant="location"
                  initialData={editingLocation}
                  onSubmit={handleSubmit}
                  onCancel={() => setOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1">
            <DataTable
              columns={[
                { accessorKey: "name", header: "Name" },
                { accessorKey: "description", header: "Description" },
                {
                  id: "actions",
                  cell: ({ row }: { row: any }) => (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingLocation(row.original);
                          setOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationsPage;
