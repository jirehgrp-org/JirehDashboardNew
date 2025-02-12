// @/hooks/features/useOperation.ts

import { useState } from "react";
import { useToast } from "@/hooks/shared/useToast";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import type {
  OperationItem,
  UseOperationOptions,
} from "@/types/features/operation";

// Mock data for users
const mockUsers: OperationItem[] = [
  {
    id: "1",
    name: "John Doe",
    username: "john.doe",
    email: "john@example.com",
    phone: "911234567",
    role: "admin",
    branchId: "1",
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
  const [data, setData] = useState<OperationItem[]>(() => {
    if (endpoint === "users") return mockUsers;
    if (endpoint === "expenses") return mockExpenses;
    return [];
  });

  const { toast } = useToast();

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

    const selectedVariant =
      variantMessages[variant as keyof typeof variantMessages] ||
      variantMessages.users;

    return {
      ...commonMessages,
      ...selectedVariant,
    };
  };

  const handleCreate = async (newData: Partial<OperationItem>) => {
    setIsLoading(true);
    setError(null);

    try {
      const result: OperationItem = {
        ...newData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as OperationItem;

      // Validate the data based on the type
      if (endpoint === "users" && !result.username) {
        throw new Error("Invalid user data");
      }
      if (endpoint === "expenses" && !result.amount) {
        throw new Error("Invalid expense data");
      }

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
    updateData: Partial<OperationItem>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const existingItem = data.find((item) => item.id === id);
      if (!existingItem) {
        throw new Error("Item not found");
      }

      const result: OperationItem = {
        ...existingItem,
        ...updateData,
        id,
        updatedAt: new Date().toISOString(),
      };

      setData((prev) => prev.map((item) => (item.id === id ? result : item)));

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

  const handleSubmit = async (data: Partial<OperationItem>, id?: string) => {
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
