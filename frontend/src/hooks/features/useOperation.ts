/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/shared/useToast";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import type {
  OperationItem,
  UseOperationOptions,
} from "@/types/features/operation";
import { operationService } from "@/lib/services/operation";

// Mock data for fallback when API fails
const mockUsers: OperationItem[] = [
  {
    id: "1",
    name: "John Doe",
    username: "john.doe",
    email: "john@example.com",
    phone: "911234567",
    role: "admin",
    branchId: "1",
    branchName: "Main Branch",
    active: true,
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    username: "jane.smith",
    email: "jane@example.com",
    phone: "922345678",
    role: "sales",
    branchId: "2",
    branchName: "Downtown Branch",
    active: true,
    createdAt: "2024-01-02T12:00:00Z",
    updatedAt: "2024-01-16T12:00:00Z",
  },
];

const mockExpenses: OperationItem[] = [
  {
    id: "1",
    name: "Office Rent",
    amount: 2500,
    frequency: "monthly",
    description: "Monthly office space rental",
    branchId: "1",
    branchName: "Main Branch",
    active: true,
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "2",
    name: "Utilities",
    amount: 500,
    frequency: "monthly",
    description: "Electricity and water bills",
    branchId: "2",
    branchName: "Downtown Branch",
    active: true,
    createdAt: "2024-01-02T12:00:00Z",
    updatedAt: "2024-01-16T12:00:00Z",
  },
];

export function useOperation({ endpoint, onSuccess }: UseOperationOptions) {
  const { language } = useLanguage();
  const t = translations[language].dashboard.operation;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OperationItem[]>([]);
  const [isMockData, setIsMockData] = useState(false);
  
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (isMockData) {
        // Return mock data based on endpoint
        switch (endpoint) {
          case "users":
            setData(mockUsers);
            break;
          case "expenses":
            setData(mockExpenses);
            break;
          default:
            setData([]);
        }
      } else {
        try {
          let response: OperationItem[] = []; 
          
          switch (endpoint) {
            case "users":
              response = await operationService.fetchUsers();
              // Debug the response to check for branch data
              console.log(`Got ${response.length} users from API`);
              if (response.length > 0) {
                console.log("Sample transformed user:", response[0]);
                // Check if any users have branchName
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
          
          // Fall back to mock data on any error
          setIsMockData(true);
          
          switch (endpoint) {
            case "users":
              setData(mockUsers);
              break;
            case "expenses":
              setData(mockExpenses);
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
      
      if (isMockData) {
        // Create mock item
        result = {
          ...newData,
          active: newData.active !== undefined ? newData.active : true,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          branchName: "Mock Branch", // Add mock branch name
        } as OperationItem;
      } else {
        try {
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
            branchName: "Mock Branch",
          } as OperationItem;
          
          toast({
            title: "Using Demo Mode",
            description: "Your changes are saved locally only.",
            variant: "destructive"
          });
        }
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
            case "users":
              result = await operationService.updateUser(id, updateData);
              break;
            case "expenses":
              result = await operationService.updateExpense(id, updateData);
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
      
      if (!isMockData) {
        try {
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