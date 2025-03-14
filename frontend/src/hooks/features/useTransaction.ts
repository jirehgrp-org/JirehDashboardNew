/* eslint-disable @typescript-eslint/no-explicit-any */
// @/hooks/features/useTransaction.ts

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/shared/useToast";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import type { TransactionItem, OrderItem, UseTransactionOptions } from "@/types/features/transaction";
import { transactionService } from "@/lib/services/transaction";
import { useInventory } from "@/hooks/features/useInventory";

// Mock data for fallback when API fails
const mockOrders: TransactionItem[] = [
  {
    id: "1",
    customerName: "John Doe",
    customerPhone: "911234567",
    customerEmail: "john@example.com",
    items: [{ itemId: "1", quantity: 2, price: 1500 }],
    user: 10,
    total: 3000,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Cash",
    orderNumber: "ORD-001",
    orderDate: "2024-03-25T12:00:00Z",
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
    user: 10,
    total: 500,
    status: "completed",
    paymentStatus: "paid",
    paymentMethod: "Telebirr",
    orderNumber: "ORD-002",
    orderDate: "2024-02-15T12:00:00Z",
    createdAt: "2024-02-15T12:00:00Z",
    updatedAt: "2024-02-15T12:00:00Z",
    actions: [],
  },
];

export function useTransaction({ onSuccess }: UseTransactionOptions = {}) {
  const { language } = useLanguage();
  const t = translations[language].dashboard.transaction;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TransactionItem[]>([]);
  const [isMockData, setIsMockData] = useState(false);
  
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
        if (isMockData) {
            setData(mockOrders);
        } else {
            const response = await transactionService.fetchOrders();
            if (response.length > 0 && !response[0].user) {
                throw new Error("User data missing in response");
            }
            setData(response);
        }
    } catch (error: any) {
        console.error("API error for transactions:", error);
        setIsMockData(true);
        setData(mockOrders);
        toast({
            title: "Using Demo Data",
            description: "Could not connect to the server. Using sample data instead.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
}, [isMockData, toast]);

  // Initial data loading
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

  const handleCreate = async (newData: Partial<TransactionItem>): Promise<TransactionItem | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let result: TransactionItem | null = null;
      
      if (!newData.items || newData.items.length === 0) {
        throw new Error("No items in order");
      }

      // Verify and update inventory for all items
      if (!isMockData) {
        try {
          // Call API to create transaction
          result = await transactionService.createOrder(newData);
        } catch (error) {
          console.error("Failed to create transaction:", error);
          setIsMockData(true);
          
          // Fall back to mock creation
          checkInventoryAvailability(newData.items);
          
          const total = calculateTotal(newData.items);
          
          result = {
            id: crypto.randomUUID(),
            customerName: newData.customerName!,
            customerPhone: newData.customerPhone!,
            customerEmail: newData.customerEmail,
            items: newData.items,
            user: newData.user ?? 0,  // Defaults to 0 if newData.user is undefined
            total,
            orderNumber: generateOrderNumber(),
            orderDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: "pending",
            paymentStatus: "pending",
            paymentMethod: newData.paymentMethod || "Cash",
            actions: [],
          };
          
          
          // Update inventory quantities in mock data
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
          
          toast({
            title: "Using Demo Mode",
            description: "Your changes are saved locally only.",
            variant: "destructive"
          });
        }
      } else {
        // Create mock order
        checkInventoryAvailability(newData.items);
        
        const total = calculateTotal(newData.items);
        
        result = {
          id: crypto.randomUUID(),
          customerName: newData.customerName!,
          customerPhone: newData.customerPhone!,
          customerEmail: newData.customerEmail,
          items: newData.items,
          user: newData.user ?? 0,  // Defaults to 0 if newData.user is undefined
          total,
          orderNumber: generateOrderNumber(),
          orderDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: "pending",
          paymentStatus: "pending",
          paymentMethod: newData.paymentMethod || "Cash",
          actions: [],
        };
        
        
        // Update inventory quantities in mock data
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
      
      if (isMockData) {
        const existingItem = data.find((item) => item.id === id);
        if (!existingItem) {
          throw new Error(`Order with ID ${id} not found`);
        }
        
        // Update inventory quantities if items are being changed
        if (updateData.items) {
          // Check inventory
          checkInventoryAvailability(updateData.items);
          
          // Update inventory quantities
          for (const orderItem of updateData.items) {
            const existingOrderItem = existingItem.items.find(
              (item) => item.itemId === orderItem.itemId
            );
            const quantityDiff =
              orderItem.quantity - (existingOrderItem?.quantity || 0);
              
            if (quantityDiff !== 0) {
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
        }
        
        const total = updateData.items
          ? calculateTotal(updateData.items)
          : existingItem.total;
        
        // Update the order
        result = {
          ...existingItem,
          ...updateData,
          total,
          updatedAt: new Date().toISOString(),
        };
      } else {
        try {
          // Call API to update transaction
          result = await transactionService.updateOrder(id, updateData);
        } catch (error) {
          console.error("Failed to update transaction:", error);
          setIsMockData(true);
          
          // Fall back to mock update
          const existingItem = data.find((item) => item.id === id);
          if (!existingItem) {
            throw new Error(`Order with ID ${id} not found`);
          }
          
          // Same mock update logic as above
          // Update inventory quantities if items are being changed
          if (updateData.items) {
            // Check inventory
            checkInventoryAvailability(updateData.items);
            
            // Update inventory quantities
            for (const orderItem of updateData.items) {
              const existingOrderItem = existingItem.items.find(
                (item) => item.itemId === orderItem.itemId
              );
              const quantityDiff =
                orderItem.quantity - (existingOrderItem?.quantity || 0);
                
              if (quantityDiff !== 0) {
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
          }
          
          const total = updateData.items
            ? calculateTotal(updateData.items)
            : existingItem.total;
          
          // Update the order
          result = {
            ...existingItem,
            ...updateData,
            total,
            updatedAt: new Date().toISOString(),
          };
          
          toast({
            title: "Using Demo Mode",
            description: "Your changes are saved locally only.",
            variant: "destructive"
          });
        }
      }

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
      
      if (!isMockData) {
        try {
          await transactionService.deleteOrder(id);
        } catch (error) {
          console.error("Failed to delete order:", error);
          setIsMockData(true);
          
          // Return items to inventory in mock mode
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
          
          toast({
            title: "Using Demo Mode",
            description: "Your changes are saved locally only.",
            variant: "destructive"
          });
        }
      } else {
        // Return items to inventory in mock mode
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