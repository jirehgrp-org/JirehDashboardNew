/* eslint-disable @typescript-eslint/no-explicit-any */
// @/hooks/features/useOperations.ts

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/shared/useToast";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import type {
  OperationItem,
  UseOperationOptions,
} from "@/types/features/operation";
import { operationService } from "@/lib/services/operation";


export function useOperation({ endpoint, onSuccess }: UseOperationOptions) {
  const { language } = useLanguage();
  const t = translations[language].dashboard.operation;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OperationItem[]>([]);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let response: OperationItem[] = [];

      switch (endpoint) {
        case "users":
          response = await operationService.fetchUsers();
          console.log(`Got ${response.length} users from API`);
          if (response.length > 0) {
            console.log("Sample transformed user:", response[0]);
            const usersWithBranchName = response.filter(user => user.branchName);
            console.log(`Users with branchName: ${usersWithBranchName.length}/${response.length}`);
          }
          break;
        case "expenses":
          response = await operationService.fetchExpenses();
          break;
      }

      setData(response);
    } catch (error: any) {
      console.error(`API error for ${endpoint}:`, error);
      setError("Could not fetch data from the server.");
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

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
      users: {
        added: t.hook.userAdded,
        updated: t.hook.userUpdated,
        deleted: t.hook.userDeleted,
      },
      expenses: {
        added: t.hook.expenseAdded,
        updated: t.hook.expenseUpdated,
        deleted: t.hook.expenseDeleted,
      },
    };

    return {
      ...commonMessages,
      ...variantMessages[variant as keyof typeof variantMessages] || variantMessages.users
    };
  };

  const handleCreate = async (newData: Partial<OperationItem>): Promise<OperationItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let result: OperationItem | null = null;

      // Ensure we set active to true by default
      const dataWithActive = {
        ...newData,
        active: newData.active !== undefined ? newData.active : true
      };

      switch (endpoint) {
        case "users":
          result = await operationService.createUser(dataWithActive);
          break;
        case "expenses":
          result = await operationService.createExpense(dataWithActive);
          break;
        default:
          throw new Error(`Unsupported endpoint: ${endpoint}`);
      }

      // Add the new item to the state
      if (result) {
        setData((prev) => [...prev, result as OperationItem]);

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
    updateData: Partial<OperationItem>
  ): Promise<OperationItem | null> => {
    setIsLoading(true);
    setError(null);
  
    try {
      let result: OperationItem | null = null;
  
      // Proceed with the API call to update the item
      switch (endpoint) {
        case "users":
          result = await operationService.updateUser(id, updateData);
          break;
        case "expenses":
          result = await operationService.updateExpense(id, updateData);
          break;
        default:
          throw new Error(`Unsupported endpoint: ${endpoint}`);
      }
  
      // Update item in state
      if (result) {
        setData((prev) =>
          prev.map((item) => (item.id === id ? result as OperationItem : item))
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
  
      // Perform actual API delete operation
      switch (endpoint) {
        case "users":
          await operationService.deleteUser(id);
          break;
        case "expenses":
          await operationService.deleteExpense(id);
          break;
        default:
          throw new Error(`Unsupported endpoint: ${endpoint}`);
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

  const handleError = useCallback((err: unknown) => {
    console.error('Error in useOperation:', err);
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
  }, [toast]);

  const handleSubmit = async (data: Partial<OperationItem>, id?: string): Promise<OperationItem | null> => {
    try {
      return id
        ? await handleUpdate(id, data)
        : await handleCreate(data);
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