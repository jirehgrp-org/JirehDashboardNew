/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
// @/hooks/features/useInventory.ts

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/shared/useToast";
import type { InventoryItem, UseInventoryOptions } from "@/types/features/inventory";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import { inventoryService } from "@/lib/services/inventory";

// Mock data for fallback when API fails
const mockBranches: InventoryItem[] = [
  {
    id: "1",
    name: "Main Store",
    address: "123 Main St, Addis Ababa",
    contactNumber: "911234567",
    active: true,
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  }
];

const mockCategories: InventoryItem[] = [
  {
    id: "1",
    name: "Electronics",
    description: "Electronic devices and accessories",
    active: true,
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  }
];

const mockItems: InventoryItem[] = [
  {
    id: "1",
    name: "Laptop",
    price: 1500,
    quantity: 5,
    categoryId: "1",
    branchId: "1",
    unitOfMeasure: "pieces",
    active: true,
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  }
];

export function useInventory({ endpoint, onSuccess }: UseInventoryOptions) {
  const { language } = useLanguage();
  const t = translations[language].dashboard.inventory;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<InventoryItem[]>([]);
  const [isMockData, setIsMockData] = useState(false);
  
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isMockData) {
        // Return mock data based on endpoint
        switch (endpoint) {
          case "branches":
            setData(mockBranches);
            break;
          case "categories":
            setData(mockCategories);
            break;
          case "items":
            setData(mockItems);
            break;
          default:
            setData([]);
        }
      } else {
        // Try to fetch real data
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
          }
          
          setData(response);
        } catch (error: any) {
          console.error(`API error for ${endpoint}:`, error);
          
          // Fall back to mock data on any error
          setIsMockData(true);
          
          switch (endpoint) {
            case "branches":
              setData(mockBranches);
              break;
            case "categories":
              setData(mockCategories);
              break;
            case "items":
              setData(mockItems);
              break;
            default:
              setData([]);
          }
          
          toast({
            title: "Using Demo Data",
            description: "Could not connect to the server. Using sample data instead.",
            variant: "destructive"
          });
        }
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, isMockData, toast]);

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
      
      if (isMockData) {
        // Create mock item
        result = {
          ...newData,
          active: newData.active !== undefined ? newData.active : true,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as InventoryItem;
      } else {
        try {
          // Ensure we set active to true by default
          const dataWithActive = {
            ...newData,
            active: newData.active !== undefined ? newData.active : true
          };
          
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
        } catch (error) {
          console.error(`Failed to create ${endpoint}:`, error);
          setIsMockData(true);
          
          // Fall back to mock creation
          result = {
            ...newData,
            active: newData.active !== undefined ? newData.active : true,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as InventoryItem;
          
          toast({
            title: "Using Demo Mode",
            description: "Your changes are saved locally only.",
            variant: "destructive"
          });
        }
      }

      // Add the new item to the state
      if (result) {
        setData((prev) => [...prev, result as InventoryItem]);

        const messages = getToastMessages(endpoint);
        toast({
          title: messages.added,
          description: `${result.name} ${messages.createdSuccess}`,
        });

        onSuccess?.();
      }
      
      return result;
    } catch (err) {
      handleError(err);
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
      
      if (isMockData) {
        // Update mock item
        const existingItem = data.find(item => item.id === id);
        if (!existingItem) {
          throw new Error(`Item with ID ${id} not found`);
        }
        
        result = {
          ...existingItem,
          ...updateData,
          updatedAt: new Date().toISOString(),
        };
      } else {
        try {
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
        } catch (error) {
          console.error(`Failed to update ${endpoint}:`, error);
          setIsMockData(true);
          
          const existingItem = data.find(item => item.id === id);
          if (!existingItem) {
            throw new Error(`Item with ID ${id} not found`);
          }
          
          result = {
            ...existingItem,
            ...updateData,
            updatedAt: new Date().toISOString(),
          };
          
          toast({
            title: "Using Demo Mode",
            description: "Your changes are saved locally only.",
            variant: "destructive"
          });
        }
      }

      // Update item in state
      if (result) {
        setData((prev) =>
          prev.map((item) => (item.id === id ? result as InventoryItem : item))
        );

        const messages = getToastMessages(endpoint);
        toast({
          title: messages.updated,
          description: `${result.name} ${messages.updatedSuccess}`,
        });

        onSuccess?.();
      }
      
      return result;
    } catch (err) {
      handleError(err);
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
      
      if (!isMockData) {
        try {
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
        } catch (error) {
          console.error(`Failed to delete ${endpoint}:`, error);
          setIsMockData(true);
          toast({
            title: "Using Demo Mode",
            description: "Your changes are saved locally only.",
            variant: "destructive"
          });
        }
      }
  
      // Remove from UI
      setData((prev) => prev.filter((item) => item.id !== id));
  
      const messages = getToastMessages(endpoint);
      toast({
        title: messages.deleted,
        description: `${itemToDelete.name} ${messages.deletedSuccess}`,
      });
  
      onSuccess?.();
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = (err: unknown) => {
    console.error('Error in useInventory:', err);
    let message = "An error occurred";
    
    if (err instanceof Error) {
      message = err.message;
    }
    
    setError(message);
    
    toast({
      title: "Error",
      description: message,
      variant: "destructive"
    });
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
    isMockData,
    toggleMockData: () => {
      setIsMockData(!isMockData);
      fetchData();
    },
    handleSubmit,
    handleCreate,
    handleUpdate,
    handleDelete,
    refreshData: fetchData
  };
}