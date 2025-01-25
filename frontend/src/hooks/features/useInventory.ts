/* eslint-disable @typescript-eslint/no-explicit-any */
// @/hooks/features/useInventory.ts

import { useState } from "react";
import { useToast } from "@/hooks/shared/useToast";
import type {
  Location,
  Category,
  Item,
  UseInventoryOptions,
} from "@/types/features/inventory";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";

const mockLocations: Location[] = [
  {
    id: "1",
    name: "Main Store",
    address: "123 Main St, Addis Ababa",
    contactNumber: "0911234567",
    active: true,
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "2",
    name: "Branch Office",
    address: "456 Market St, Addis Ababa",
    contactNumber: "0922345678",
    active: true,
    createdAt: "2023-12-20T12:00:00Z",
    updatedAt: "2024-01-10T12:00:00Z",
  },
  {
    id: "3",
    name: "Warehouse",
    address: "789 Industrial Ave, Addis Ababa",
    contactNumber: "0933456789",
    active: false,
    createdAt: "2023-11-15T12:00:00Z",
    updatedAt: "2023-12-05T12:00:00Z",
  },
  {
    id: "4",
    name: "Airport Branch",
    address: "Bole Road, Addis Ababa",
    contactNumber: "0944567890",
    active: true,
    createdAt: "2023-10-30T12:00:00Z",
    updatedAt: "2023-11-20T12:00:00Z",
  },
  {
    id: "5",
    name: "City Center",
    address: "Kirkos District, Addis Ababa",
    contactNumber: "0955678901",
    active: true,
    createdAt: "2023-09-15T12:00:00Z",
    updatedAt: "2023-10-10T12:00:00Z",
  },
  {
    id: "6",
    name: "Bole District Office",
    address: "Bole Sub-city, Addis Ababa",
    contactNumber: "0966789012",
    active: true,
    createdAt: "2023-08-30T12:00:00Z",
    updatedAt: "2023-09-20T12:00:00Z",
  },
  {
    id: "7",
    name: "Nifas Silk Lafto",
    address: "Nifas Silk Lafto, Addis Ababa",
    contactNumber: "0977890123",
    active: false,
    createdAt: "2023-07-15T12:00:00Z",
    updatedAt: "2023-08-10T12:00:00Z",
  },
  {
    id: "8",
    name: "Yeka Sub-city",
    address: "Yeka Sub-city, Addis Ababa",
    contactNumber: "0988901234",
    active: false,
    createdAt: "2023-06-30T12:00:00Z",
    updatedAt: "2023-07-20T12:00:00Z",
  },
  {
    id: "9",
    name: "Arada District",
    address: "Arada District, Addis Ababa",
    contactNumber: "0999012345",
    active: true,
    createdAt: "2023-05-15T12:00:00Z",
    updatedAt: "2023-06-10T12:00:00Z",
  },
  {
    id: "10",
    name: "Piassa Branch",
    address: "Piassa, Addis Ababa",
    contactNumber: "0100123456",
    active: true,
    createdAt: "2023-04-30T12:00:00Z",
    updatedAt: "2023-05-20T12:00:00Z",
  },
  {
    id: "11",
    name: "New Branch A",
    address: "New Street A, Addis Ababa",
    contactNumber: "0101123456",
    active: true,
    createdAt: "2023-04-15T12:00:00Z",
    updatedAt: "2023-05-10T12:00:00Z",
  },
  {
    id: "12",
    name: "New Branch B",
    address: "New Street B, Addis Ababa",
    contactNumber: "0102123456",
    active: false,
    createdAt: "2023-03-30T12:00:00Z",
    updatedAt: "2023-04-20T12:00:00Z",
  },
];

export function useInventory<T extends Location | Category | Item>({
  endpoint,
}: UseInventoryOptions) {
  const { language } = useLanguage();
  const t = translations[language].dashboard.inventory.locations.hook;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T[]>(
    endpoint === "locations" ? (mockLocations as T[]) : []
  );
  const { toast } = useToast();

  const handleCreate = async (newData: Partial<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = {
        ...newData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as T;

      setData((prev) => [...prev, result]);
      toast({
        title: t.locationAdded,
        description: `${(result as any).name} ${t.locationCreatedSuccessfully}`,
      });

      return result;
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, updateData: Partial<T>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = {
        ...updateData,
        id,
        updatedAt: new Date().toISOString(),
      } as T;

      setData((prev) =>
        prev.map((item) =>
          (item as any).id === id ? { ...item, ...result } : item
        )
      );

      toast({
        title: t.locationUpdated,
        description: `${(result as any).name} ${t.locationUpdatedSuccessfully}`,
      });

      return result;
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const itemToDelete = data.find((item) => (item as any).id === id);
      setData((prev) => prev.filter((item) => (item as any).id !== id));

      toast({
        title: t.locationDeleted,
        description: `${
          (itemToDelete as any).name
        } ${t.locationDeletedSuccessfully}`,
      });
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (err: unknown) => {
    const message = err instanceof Error ? err.message : "An error occurred";
    setError(message);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  const handleSubmit = async (data: Partial<T>, id?: string) => {
    if (id) {
      return handleUpdate(id, data);
    }
    return handleCreate(data);
  };

  return {
    isLoading,
    error,
    data,
    handleSubmit,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}