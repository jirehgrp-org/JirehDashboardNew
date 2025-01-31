// @/hooks/features/useTransaction.ts

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/shared/useToast";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import type { OrderItem, UseOrderOptions } from "@/types/features/transaction";
import { useInventory } from "@/hooks/features/useInventory";

// Update mock data to use itemId
const mockOrders: OrderItem[] = [
  {
    id: "1",
    customerName: "John Doe",
    customerPhone: "911234567",
    customerEmail: "john@example.com",
    itemId: "1",
    quantity: 2,
    status: "pending",
    paymentStatus: "pending",
    orderNumber: "ORD-001",
    orderDate: "2024-01-01T12:00:00Z",
    createdAt: "2024-01-01T12:00:00Z",
    updatedAt: "2024-01-01T12:00:00Z",
    actions: [],
  },
  {
    id: "2",
    customerName: "Jane Smith",
    customerPhone: "922345678",
    itemId: "2",
    quantity: 1,
    status: "completed",
    paymentStatus: "paid",
    orderNumber: "ORD-002",
    orderDate: "2024-01-02T12:00:00Z",
    createdAt: "2024-01-02T12:00:00Z",
    updatedAt: "2024-01-02T12:00:00Z",
    actions: [],
  },
];

export function useTransaction({ onSuccess }: UseOrderOptions) {
  const { language } = useLanguage();
  const t = translations[language].dashboard.transaction;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OrderItem[]>(mockOrders);

  // Get inventory items
  const inventory = useInventory({ endpoint: "items" });
  const [availableItems, setAvailableItems] = useState(inventory.data);

  useEffect(() => {
    setAvailableItems(inventory.data);
  }, [inventory.data]);

  const { toast } = useToast();

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

  const generateOrderNumber = () => {
    const prefix = "ORD";
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}-${timestamp}-${random}`;
  };
  
  // Update the checkInventoryAvailability function
  const checkInventoryAvailability = (
    itemId: string,
    requestedQuantity: number
  ) => {
    const inventoryItem = availableItems.find((item) => item.id === itemId);
    if (!inventoryItem) {
      throw new Error("Item not found in inventory");
    }
    if (
      inventoryItem.quantity === undefined ||
      inventoryItem.quantity < requestedQuantity
    ) {
      throw new Error(getToastMessages().insufficientStock);
    }
    return inventoryItem;
  };

  // Update handleCreate
  const handleCreate = async (newData: Partial<OrderItem>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check inventory availability using itemId
      const inventoryItem = checkInventoryAvailability(
        newData.itemId!, // Changed from item to itemId
        newData.quantity!
      );

      const result: OrderItem = {
        ...newData,
        id: crypto.randomUUID(),
        orderNumber: generateOrderNumber(),
        orderDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "pending",
        paymentStatus: "pending",
        actions: [],
      } as OrderItem;

      // Update inventory quantity
      await inventory.handleUpdate(inventoryItem.id, {
        ...inventoryItem,
        quantity: (inventoryItem.quantity ?? 0) - newData.quantity!,
      });

      setData((prev) => [...prev, result]);

      const messages = getToastMessages();
      toast({
        title: messages.created,
        description: `Order ${result.orderNumber} ${messages.createdSuccess}`,
      });

      onSuccess?.();
      return result;
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string, updateData: Partial<OrderItem>) => {
    setIsLoading(true);
    setError(null);

    try {
      const existingItem = data.find((item) => item.id === id);
      if (!existingItem) {
        throw new Error("Order not found");
      }

      if (
        updateData.quantity &&
        updateData.quantity !== existingItem.quantity
      ) {
        const inventoryItem = checkInventoryAvailability(
          existingItem.itemId, // Changed from item to itemId
          updateData.quantity - existingItem.quantity
        );

        // Update inventory quantity
        await inventory.handleUpdate(inventoryItem.id, {
          ...inventoryItem,
          quantity:
            (inventoryItem.quantity ?? 0) -
            (updateData.quantity - existingItem.quantity),
        });
      }

      const result: OrderItem = {
        ...existingItem,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      setData((prev) => prev.map((item) => (item.id === id ? result : item)));

      const messages = getToastMessages();
      toast({
        title: messages.updated,
        description: `Order ${result.orderNumber} ${messages.updatedSuccess}`,
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

      const messages = getToastMessages();
      toast({
        title: messages.deleted,
        description: `Order ${itemToDelete?.orderNumber} ${messages.deletedSuccess}`,
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

  const handleSubmit = async (data: Partial<OrderItem>, id?: string) => {
    if (id) {
      return handleUpdate(id, data);
    }
    return handleCreate(data);
  };

  return {
    isLoading,
    error,
    data,
    availableItems, // Expose available inventory items
    handleSubmit,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}