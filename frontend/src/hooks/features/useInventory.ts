/* eslint-disable @typescript-eslint/no-explicit-any */
// @/hooks/features/useInventory.ts

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/shared/useToast";
import type { InventoryItem, UseInventoryOptions } from "@/types/features/inventory";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import { inventoryService } from "@/lib/services/inventory";

export function useInventory({ endpoint, onSuccess }: UseInventoryOptions) {
  const { language } = useLanguage();
  const t = translations[language].dashboard.inventory;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InventoryItem[]>([]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response: InventoryItem[] = [];

      switch (endpoint) {
        case "branches":
          response = await inventoryService.fetchBranches();
          break;
        case "categories":
          response = await inventoryService.fetchCategories();
          break;
        case "items":
          response = await inventoryService.fetchItems();
          break;
        default:
          response = [];
          break;
      }

      setData(response);
    } catch (error: any) {
      console.error(`API error for ${endpoint}:`, error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, toast]);

  // Initial data loading
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getToastMessages = (variant: string) => {
    const commonMessages = {
      createdSuccess: t.hook.createdSuccessfully,
      updatedSuccess: t.hook.updatedSuccessfully,
      deletedSuccess: t.hook.deletedSuccessfully,
    };

    const variantMessages = {
      branches: {
        added: t.hook.branchAdded,
        updated: t.hook.branchUpdated,
        deleted: t.hook.branchDeleted,
      },
      categories: {
        added: t.hook.categoryAdded,
        updated: t.hook.categoryUpdated,
        deleted: t.hook.categoryDeleted,
      },
      items: {
        added: t.hook.itemAdded,
        updated: t.hook.itemUpdated,
        deleted: t.hook.itemDeleted,
      },
    };

    return {
      ...commonMessages,
      ...variantMessages[variant as keyof typeof variantMessages] || variantMessages.branches
    };
  };

  const handleCreate = async (newData: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let result: InventoryItem | null = null;

      // Ensure we set active to true by default
      const dataWithActive = {
        ...newData,
        active: newData.active !== undefined ? newData.active : true
      };

      // Create the item using the API
      switch (endpoint) {
        case "branches":
          result = await inventoryService.createBranch(dataWithActive);
          break;
        case "categories":
          result = await inventoryService.createCategory(dataWithActive);
          break;
        case "items":
          result = await inventoryService.createItem(dataWithActive);
          break;
        default:
          throw new Error(`Unsupported endpoint: ${endpoint}`);
      }

      // Add the new item to the state
      if (result) {
        setData((prev) => [...prev, result]);

        const messages = getToastMessages(endpoint);
        toast({
          title: messages.added,
          description: `${result.name} ${messages.createdSuccess}`,
        });

        onSuccess?.();
      }

      return result;
    } catch (error) {
      console.error(`Failed to create ${endpoint}:`, error);
      setError(error instanceof Error ? error.message : 'An error occurred while creating the item.');

      toast({
        title: "Error Creating Item",
        description: "Could not create the item. Please try again later.",
        variant: "destructive"
      });

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (
    id: string,
    updateData: Partial<InventoryItem>
  ): Promise<InventoryItem | null> => {
    setIsLoading(true);
    setError(null);
  
    try {
      let result: InventoryItem | null = null;
  
      // Directly call the API to update the item
      switch (endpoint) {
        case "branches":
          result = await inventoryService.updateBranch(id, updateData);
          break;
        case "categories":
          result = await inventoryService.updateCategory(id, updateData);
          break;
        case "items":
          result = await inventoryService.updateItem(id, updateData);
          break;
        default:
          throw new Error(`Unsupported endpoint: ${endpoint}`);
      }
  
      // Update item in state if result is not null
      if (result) {
        setData((prev) =>
          prev.map((item) => (item.id === id ? result : item))
        );
  
        const messages = getToastMessages(endpoint);
        toast({
          title: messages.updated,
          description: `${result.name} ${messages.updatedSuccess}`,
        });
  
        onSuccess?.();
      }
  
      return result;
    } catch (error) {
      console.error(`Failed to update ${endpoint}:`, error);
      setError(error instanceof Error ? error.message : 'An error occurred while updating the item.');
  
      toast({
        title: "Error Updating Item",
        description: "Could not update the item. Please try again later.",
        variant: "destructive"
      });
  
      return null;
    } finally {
      setIsLoading(false);
    }
  };  

  const handleDelete = async (id: string) => {
    setIsLoading(true);
    setError(null);
  
    try {
      const itemToDelete = data.find((item) => item.id === id);
      if (!itemToDelete) {
        throw new Error(`Item with ID ${id} not found`);
      }
  
      // Directly call the API to delete the item
      if (id) {
        switch (endpoint) {
          case "branches":
            await inventoryService.deleteBranch(id);
            break;
          case "categories":
            await inventoryService.deleteCategory(id);
            break;
          case "items":
            await inventoryService.deleteItem(id);
            break;
          default:
            throw new Error(`Unsupported endpoint: ${endpoint}`);
        }
      }
  
      setData((prev) => prev.filter((item) => item.id !== id));
  
      const messages = getToastMessages(endpoint);
      toast({
        title: messages.deleted,
        description: `${itemToDelete.name} ${messages.deletedSuccess}`,
      });
  
      onSuccess?.();
    } catch (err) {
      console.error(`Failed to delete ${endpoint}:`, err);
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the item.');
  
      toast({
        title: "Error Deleting Item",
        description: "Could not delete the item. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };   

  const handleSubmit = async (data: Partial<InventoryItem>, id?: string): Promise<InventoryItem | null> => {
    const formattedData = {
      ...data,
      active: id ? data.active : true,
    };

    try {
      return id
        ? await handleUpdate(id, formattedData)
        : await handleCreate(formattedData);
    } catch (err) {
      console.error(`Error in handleSubmit for ${endpoint}:`, err);
      return null;
    }
  };

  return {
    isLoading,
    error,
    data,
    handleSubmit,
    handleCreate,
    handleUpdate,
    handleDelete,
    refreshData: fetchData
  };
}