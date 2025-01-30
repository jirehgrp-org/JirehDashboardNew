// @/hooks/features/useInventory.ts

import { useState } from "react";
import { useToast } from "@/hooks/shared/useToast";
import type {
  InventoryItem,
  UseInventoryOptions,
} from "@/types/features/inventory";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";

const mockLocations: InventoryItem[] = [
  {
    id: "1",
    name: "Main Store",
    address: "123 Main St, Addis Ababa",
    contactNumber: "911234567",
    active: true,
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "2",
    name: "Branch Office",
    address: "456 Market St, Addis Ababa",
    contactNumber: "922345678",
    active: true,
    createdAt: "2023-12-20T12:00:00Z",
    updatedAt: "2024-01-10T12:00:00Z",
  },
  {
    id: "3",
    name: "Warehouse",
    address: "789 Industrial Ave, Addis Ababa",
    contactNumber: "933456789",
    active: false,
    createdAt: "2023-11-15T12:00:00Z",
    updatedAt: "2023-12-05T12:00:00Z",
  },
  {
    id: "4",
    name: "Airport Branch",
    address: "Bole Road, Addis Ababa",
    contactNumber: "944567890",
    active: true,
    createdAt: "2023-10-30T12:00:00Z",
    updatedAt: "2023-11-20T12:00:00Z",
  },
  {
    id: "5",
    name: "City Center",
    address: "Kirkos District, Addis Ababa",
    contactNumber: "955678901",
    active: true,
    createdAt: "2023-09-15T12:00:00Z",
    updatedAt: "2023-10-10T12:00:00Z",
  },
  // ... other locations
];

const mockCategories: InventoryItem[] = [
  {
    id: "1",
    name: "Electronics",
    description: "Electronic devices and accessories",
    locationId: "1",
    active: true,
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "2",
    name: "Office Supplies",
    description: "General office materials and supplies",
    locationId: "2",
    active: true,
    createdAt: "2024-01-02T12:00:00Z",
    updatedAt: "2024-01-16T12:00:00Z",
  },
  {
    id: "3",
    name: "Furniture",
    description: "Office and home furniture",
    locationId: "1",
    active: false,
    createdAt: "2024-01-03T12:00:00Z",
    updatedAt: "2024-01-17T12:00:00Z",
  },
  {
    id: "4",
    name: "Clothing",
    description: "",
    locationId: "2",
    active: true,
    createdAt: "2024-01-04T12:00:00Z",
    updatedAt: "2024-01-18T12:00:00Z",
  },
  {
    id: "5",
    name: "Home Decor",
    description: "",
    locationId: "1",
    active: true,
    createdAt: "2024-01-05T12:00:00Z",
    updatedAt: "2024-01-19T12:00:00Z",
  },
];

const mockItems: InventoryItem[] = [
  {
    id: "1",
    name: "Laptop",
    price: 1500,
    quantity: 5,
    categoryId: "1",
    active: true,
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "2",
    name: "Printer",
    price: 500,
    quantity: 3,
    categoryId: "2",
    active: true,
    createdAt: "2024-01-02T12:00:00Z",
    updatedAt: "2024-01-16T12:00:00Z",
  },
  {
    id: "3",
    name: "Monitor",
    price: 800,
    quantity: 2,
    categoryId: "1",
    active: false,
    createdAt: "2024-01-03T12:00:00Z",
    updatedAt: "2024-01-17T12:00:00Z",
  },
  {
    id: "4",
    name: "Keyboard",
    price: 200,
    quantity: 4,
    categoryId: "2",
    active: false,
    createdAt: "2024-01-04T12:00:00Z",
    updatedAt: "2024-01-18T12:00:00Z",
  },
  {
    id: "5",
    name: "Mouse",
    price: 100,
    quantity: 6,
    categoryId: "1",
    active: true,
    createdAt: "2024-01-05T12:00:00Z",
    updatedAt: "2024-01-19T12:00:00Z",
  },
];

export function useInventory({ endpoint, onSuccess }: UseInventoryOptions) {
  const { language } = useLanguage();
  const t = translations[language].dashboard.inventory;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InventoryItem[]>(() => {
    if (endpoint === "locations") return mockLocations;
    if (endpoint === "categories") return mockCategories;
    if (endpoint === "items") return mockItems;
    return [];
  });

  const { toast } = useToast();

  const getToastMessages = (variant: string) => {
    const messages = {
      locations: {
        added: t.locations.hook.locationAdded,
        updated: t.locations.hook.locationUpdated,
        deleted: t.locations.hook.locationDeleted,
        createdSuccess: t.locations.hook.locationCreatedSuccessfully,
        updatedSuccess: t.locations.hook.locationUpdatedSuccessfully,
        deletedSuccess: t.locations.hook.locationDeletedSuccessfully,
      },
      categories: {
        added: t.categories.hook.categoryAdded,
        updated: t.categories.hook.categoryUpdated,
        deleted: t.categories.hook.categoryDeleted,
        createdSuccess: t.categories.hook.categoryCreatedSuccessfully,
        updatedSuccess: t.categories.hook.categoryUpdatedSuccessfully,
        deletedSuccess: t.categories.hook.categoryDeletedSuccessfully,
      },
      items: {
        added: t.items.hook.itemAdded,
        updated: t.items.hook.itemUpdated,
        deleted: t.items.hook.itemDeleted,
        createdSuccess: t.items.hook.itemCreatedSuccessfully,
        updatedSuccess: t.items.hook.itemUpdatedSuccessfully,
        deletedSuccess: t.items.hook.itemDeletedSuccessfully,
      },
    };
    return messages[variant as keyof typeof messages] || messages.locations;
  };

  const handleCreate = async (newData: Partial<InventoryItem>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result: InventoryItem = {
        ...newData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as InventoryItem;

      setData((prev) => [...prev, result]);

      const messages = getToastMessages(endpoint);
      toast({
        title: messages.added,
        description: `${result.name} ${messages.createdSuccess}`,
      });

      onSuccess?.();
      return result;
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (
    id: string,
    updateData: Partial<InventoryItem>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result: InventoryItem = {
        ...updateData,
        id,
        updatedAt: new Date().toISOString(),
      } as InventoryItem;

      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...result } : item))
      );

      const messages = getToastMessages(endpoint);
      toast({
        title: messages.updated,
        description: `${result.name} ${messages.updatedSuccess}`,
      });

      onSuccess?.();
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
      const itemToDelete = data.find((item) => item.id === id);
      setData((prev) => prev.filter((item) => item.id !== id));

      const messages = getToastMessages(endpoint);
      toast({
        title: messages.deleted,
        description: `${itemToDelete?.name} ${messages.deletedSuccess}`,
      });

      onSuccess?.();
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

  const handleSubmit = async (data: Partial<InventoryItem>, id?: string) => {
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