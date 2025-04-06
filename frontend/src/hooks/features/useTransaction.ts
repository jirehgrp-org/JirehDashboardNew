/* eslint-disable @typescript-eslint/no-explicit-any */
// @/hooks/features/useTransaction.ts

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/shared/useToast";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import type { TransactionItem, OrderItem, UseTransactionOptions } from "@/types/features/transaction";
import { transactionService } from "@/lib/services/transaction";
import { useInventory } from "@/hooks/features/useInventory";

export function useTransaction({ onSuccess }: UseTransactionOptions = {}) {
  const { language } = useLanguage();
  const t = translations[language].dashboard.transaction;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TransactionItem[]>([]);
  const inventory = useInventory({ endpoint: "items" });
  const [availableItems, setAvailableItems] = useState(inventory.data);
  const { toast } = useToast();

  useEffect(() => {
    setAvailableItems(inventory.data);
  }, [inventory.data]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await transactionService.fetchOrders();
      if (response.length > 0 && !response[0].user) {
        throw new Error("User data missing in response");
      }
      setData(response);
    } catch (error: any) {
      console.error("API error for transactions:", error);
      setError("Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getToastMessages = () => {
    return {
      created: t.hook.orderCreated,
      updated: t.hook.orderUpdated,
      deleted: t.hook.orderDeleted,
      createdSuccess: t.hook.createdSuccessfully,
      updatedSuccess: t.hook.updatedSuccessfully,
      deletedSuccess: t.hook.deletedSuccessfully,
      insufficientStock: t.hook.insufficientStock,
    };
  };

  const calculateTotal = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const checkInventoryAvailability = (items: OrderItem[]) => {
    for (const orderItem of items) {
      const inventoryItem = availableItems?.find(
        (item) => item.id === orderItem.itemId
      );
      if (!inventoryItem) {
        throw new Error(`Item ${orderItem.itemId} not found in inventory`);
      }
      if (
        inventoryItem.quantity === undefined ||
        inventoryItem.quantity < orderItem.quantity
      ) {
        throw new Error(getToastMessages().insufficientStock);
      }
    }
    return true;
  };

  const handleCreate = async (newData: Partial<TransactionItem>): Promise<TransactionItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let result: TransactionItem | null = null;

      if (!newData.items || newData.items.length === 0) {
        throw new Error("No items in order");
      }

      // Verify and update inventory for all items
      try {
        // Call API to create transaction
        result = await transactionService.createOrder(newData);
      } catch (error) {
        console.error("Failed to create transaction:", error);
        setError("Failed to create transaction via API");
        throw error; // Stop execution if API creation fails
      }

      // Update inventory quantities
      for (const orderItem of newData.items) {
        const inventoryItem = availableItems?.find(
          (i) => i.id === orderItem.itemId
        );
        if (!inventoryItem) continue;

        const currentQuantity = inventoryItem.quantity ?? 0;
        await inventory.handleUpdate(inventoryItem.id, {
          ...inventoryItem,
          quantity: currentQuantity - orderItem.quantity,
        });
      }

      // Add the new order to the state
      if (result) {
        setData((prev) => [...prev, result as TransactionItem]);

        const messages = getToastMessages();
        toast({
          title: messages.created,
          description: `Order ${result.orderNumber} ${messages.createdSuccess}`,
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
    updateData: Partial<TransactionItem>
  ): Promise<TransactionItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let result: TransactionItem | null = null;

      // Call API to update transaction
      result = await transactionService.updateOrder(id, updateData);

      // Update inventory quantities if items are being changed
      if (updateData.items) {
        // Check inventory
        checkInventoryAvailability(updateData.items);

        // Update inventory quantities
        for (const orderItem of updateData.items) {
          const inventoryItem = availableItems?.find(
            (item) => item.id === orderItem.itemId
          );
          if (!inventoryItem) continue;

          const currentQuantity = inventoryItem.quantity ?? 0;
          const quantityDiff = orderItem.quantity - (inventoryItem.quantity || 0);

          if (quantityDiff !== 0) {
            await inventory.handleUpdate(inventoryItem.id, {
              ...inventoryItem,
              quantity: currentQuantity - quantityDiff,
            });
          }
        }
      }

      // Update the order
      result = {
        ...result,
        total: updateData.items ? calculateTotal(updateData.items) : result.total,
        updatedAt: new Date().toISOString(),
      };

      // Update order in state
      if (result) {
        setData((prev) =>
          prev.map((item) => (item.id === id ? result as TransactionItem : item))
        );

        const messages = getToastMessages();
        toast({
          title: messages.updated,
          description: `Order ${result.orderNumber} ${messages.updatedSuccess}`,
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
        throw new Error(`Order with ID ${id} not found`);
      }

      // Call API to delete the order
      await transactionService.deleteOrder(id);

      // Return items to inventory after deletion
      for (const orderItem of itemToDelete.items) {
        const inventoryItem = availableItems?.find(
          (item) => item.id === orderItem.itemId
        );
        if (!inventoryItem) continue;

        const currentQuantity = inventoryItem.quantity ?? 0;
        await inventory.handleUpdate(inventoryItem.id, {
          ...inventoryItem,
          quantity: currentQuantity + orderItem.quantity,
        });
      }

      // Remove from UI
      setData((prev) => prev.filter((item) => item.id !== id));

      const messages = getToastMessages();
      toast({
        title: messages.deleted,
        description: `Order ${itemToDelete.orderNumber} ${messages.deletedSuccess}`,
      });

      onSuccess?.();
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };


  const handleError = useCallback((err: unknown) => {
    console.error('Error in useTransaction:', err);
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

  const handleSubmit = async (data: Partial<TransactionItem>, id?: string): Promise<TransactionItem | null> => {
    try {
      return id
        ? await handleUpdate(id, data)
        : await handleCreate(data);
    } catch (err) {
      console.error("Error in handleSubmit for transaction:", err);
      return null;
    }
  };

  return {
    isLoading,
    error,
    data,
    availableItems,
    handleSubmit,
    handleCreate,
    handleUpdate,
    handleDelete,
    refreshData: fetchData
  };
}