// @/hooks/features/useTransaction.ts

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/shared/useToast";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import type {
  TransactionItem,
  OrderItem,
  UseTransactionOptions,
} from "@/types/features/transaction";
import { useInventory } from "@/hooks/features/useInventory";

// Update mock data to use items array
const mockOrders: TransactionItem[] = [
  {
    id: "1",
    customerName: "John Doe",
    customerPhone: "911234567",
    customerEmail: "john@example.com",
    items: [{ itemId: "1", quantity: 2, price: 1500 }],
    total: 3000,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Cash",
    orderNumber: "ORD-001",
    orderDate: "2024-03-25T12:00:00Z", // Last week
    createdAt: "2024-03-25T12:00:00Z",
    updatedAt: "2024-03-25T12:00:00Z",
    actions: [],
  },
  {
    id: "2",
    customerName: "Jane Smith",
    customerPhone: "922345678",
    customerEmail: "jane@example.com",
    items: [{ itemId: "2", quantity: 1, price: 500 }],
    total: 500,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "Telebirr",
    orderNumber: "ORD-002",
    orderDate: "2024-02-15T12:00:00Z", // Last month
    createdAt: "2024-02-15T12:00:00Z",
    updatedAt: "2024-02-15T12:00:00Z",
    actions: [],
  },
  {
    id: "3",
    customerName: "David Lee",
    customerPhone: "933456789",
    customerEmail: "david@example.com",
    items: [
      { itemId: "1", quantity: 1, price: 1500 },
      { itemId: "3", quantity: 3, price: 200 },
    ],
    total: 2100,
    status: "cancelled",
    paymentStatus: "cancelled",
    paymentMethod: "Bank Transfer",
    orderNumber: "ORD-003",
    orderDate: "2023-04-10T12:00:00Z", // Last year
    createdAt: "2023-04-10T12:00:00Z",
    updatedAt: "2023-04-10T12:00:00Z",
    actions: [],
  },
  {
    id: "4",
    customerName: "Sarah Jones",
    customerPhone: "944567890",
    customerEmail: "sarah@example.com",
    items: [{ itemId: "2", quantity: 2, price: 500 }],
    total: 1000,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "Cash",
    orderNumber: "ORD-004",
    orderDate: "2024-03-20T12:00:00Z", // Last week
    createdAt: "2024-03-20T12:00:00Z",
    updatedAt: "2024-03-20T12:00:00Z",
    actions: [],
  },
  {
    id: "5",
    customerName: "Michael Brown",
    customerPhone: "955678901",
    customerEmail: "michael@example.com",
    items: [{ itemId: "3", quantity: 1, price: 200 }],
    total: 200,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Telebirr",
    orderNumber: "ORD-005",
    orderDate: "2024-02-28T12:00:00Z", // Last month
    createdAt: "2024-02-28T12:00:00Z",
    updatedAt: "2024-02-28T12:00:00Z",
    actions: [],
  },
  {
    id: "6",
    customerName: "Emily Davis",
    customerPhone: "966789012",
    customerEmail: "emily@example.com",
    items: [{ itemId: "1", quantity: 3, price: 1500 }],
    total: 4500,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    orderNumber: "ORD-006",
    orderDate: "2023-12-15T12:00:00Z", // Last year
    createdAt: "2023-12-15T12:00:00Z",
    updatedAt: "2023-12-15T12:00:00Z",
    actions: [],
  },
  {
    id: "7",
    customerName: "Chris Wilson",
    customerPhone: "977890123",
    customerEmail: "chris@example.com",
    items: [
      { itemId: "2", quantity: 4, price: 500 },
      { itemId: "3", quantity: 2, price: 200 },
    ],
    total: 2400,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "Cash",
    orderNumber: "ORD-007",
    orderDate: "2024-03-22T12:00:00Z", // Last week
    createdAt: "2024-03-22T12:00:00Z",
    updatedAt: "2024-03-22T12:00:00Z",
    actions: [],
  },
  {
    id: "8",
    customerName: "Ashley Garcia",
    customerPhone: "988901234",
    customerEmail: "ashley@example.com",
    items: [
      { itemId: "1", quantity: 1, price: 1500 },
      { itemId: "2", quantity: 1, price: 500 },
      { itemId: "3", quantity: 1, price: 200 },
    ],
    total: 2200,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Telebirr",
    orderNumber: "ORD-008",
    orderDate: "2024-02-10T12:00:00Z", // Last month
    createdAt: "2024-02-10T12:00:00Z",
    updatedAt: "2024-02-10T12:00:00Z",
    actions: [],
  },
  {
    id: "9",
    customerName: "Matthew Rodriguez",
    customerPhone: "999012345",
    customerEmail: "matthew@example.com",
    items: [{ itemId: "2", quantity: 3, price: 500 }],
    total: 1500,
    status: "completed",
    paymentStatus: "pending",
    paymentMethod: "Cash",
    orderNumber: "ORD-009",
    orderDate: "2023-11-01T12:00:00Z", // Last year
    createdAt: "2023-11-01T12:00:00Z",
    updatedAt: "2023-11-01T12:00:00Z",
    actions: [],
  },
];

export function useTransaction({ onSuccess }: UseTransactionOptions) {
  const { language } = useLanguage();
  const t = translations[language].dashboard.transaction;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TransactionItem[]>(mockOrders);

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

  const handleCreate = async (newData: Partial<TransactionItem>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!newData.items || newData.items.length === 0) {
        throw new Error("No items in order");
      }

      // Verify and update inventory for all items
      checkInventoryAvailability(newData.items);

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

      const total = calculateTotal(newData.items);

      const result: TransactionItem = {
        id: crypto.randomUUID(),
        customerName: newData.customerName!,
        customerPhone: newData.customerPhone!,
        customerEmail: newData.customerEmail,
        items: newData.items,
        total,
        orderNumber: generateOrderNumber(),
        orderDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "pending",
        paymentStatus: "pending",
        actions: [],
        paymentMethod: "Cash",
      };

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

  const handleUpdate = async (
    id: string,
    updateData: Partial<TransactionItem>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const existingItem = data.find((item) => item.id === id);
      if (!existingItem) {
        throw new Error("Order not found");
      }

      // If items are being updated, check inventory
      if (updateData.items) {
        checkInventoryAvailability(updateData.items);

        // Update inventory quantities
        for (const orderItem of updateData.items) {
          const existingOrderItem = existingItem.items.find(
            (item) => item.itemId === orderItem.itemId
          );
          const quantityDiff =
            orderItem.quantity - (existingOrderItem?.quantity || 0);

          const inventoryItem = availableItems?.find(
            (item) => item.id === orderItem.itemId
          );
          if (!inventoryItem) continue;

          const currentQuantity = inventoryItem.quantity ?? 0;
          await inventory.handleUpdate(inventoryItem.id, {
            ...inventoryItem,
            quantity: currentQuantity - quantityDiff,
          });
        }
      }

      const total = updateData.items
        ? calculateTotal(updateData.items)
        : existingItem.total;

      const result: TransactionItem = {
        ...existingItem,
        ...updateData,
        total,
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

  const handleSubmit = async (data: Partial<TransactionItem>, id?: string) => {
    if (id) {
      return handleUpdate(id, data);
    }
    return handleCreate(data);
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
  };
}
