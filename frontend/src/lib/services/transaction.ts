/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @/lib/services/transaction.ts

import {
  getTransactionsList,
  getTransactionDetail,
  registerTransaction,
  updateTransactionDetail,
  deleteTransaction
} from "@/lib/axios";
import type { TransactionItem, OrderItem } from "@/types/features/transaction";

class TransactionService {
  async fetchOrders(): Promise<TransactionItem[]> {
    try {
      const response = await getTransactionsList();
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn("Orders response is not an array:", response.data);
        return [];
      }

      return this.transformOrdersData(response.data);
    } catch (error: any) {
      this.handleApiError("fetchOrders", error);
      return [];
    }
  }

  async getOrderById(id: string): Promise<TransactionItem | null> {
    try {
      const response = await getTransactionDetail(parseInt(id));
      return this.transformOrderData(response.data);
    } catch (error: any) {
      this.handleApiError("getOrderById", error);
      return null;
    }
  }

  async createOrder(orderData: Partial<TransactionItem>): Promise<TransactionItem> {
    try {
      // Format data for API
      const payload = {
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_email: orderData.customerEmail,
        payment_method: orderData.paymentMethod,
        order_date: orderData.orderDate || new Date().toISOString(),
        status: orderData.status || 'pending',
        payment_status: orderData.paymentStatus || 'pending',
        paid_amount: 0,
        items: (orderData.items || []).map(item => ({
          item_id: item.itemId,
          quantity: item.quantity,
          price: item.price
        }))
      };
  
      console.log("Sending order creation payload:", payload);
      const response = await registerTransaction(payload);
      console.log("Order creation response:", response.data);
      return this.transformOrderData(response.data);
    } catch (error: any) {
      this.handleApiError("createOrder", error);
      throw error;
    }
  }

  async updateOrder(id: string, orderData: Partial<TransactionItem>): Promise<TransactionItem> {
    try {
      // Format data for API
      const payload = {
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_email: orderData.customerEmail,
        payment_method: orderData.paymentMethod,
        status: orderData.status,
        payment_status: orderData.paymentStatus,
        paid_amount: orderData.paymentStatus === 'paid' ? orderData.total : 0
      };
    
      console.log("Sending order update payload:", payload);
      const response = await updateTransactionDetail(parseInt(id), payload);
      console.log("Order update response:", response.data);
      return this.transformOrderData(response.data);
    } catch (error: any) {
      this.handleApiError("updateOrder", error);
      throw error;
    }
  }

  async deleteOrder(id: string): Promise<void> {
    try {
      await deleteTransaction(parseInt(id));
    } catch (error: any) {
      this.handleApiError("deleteOrder", error);
      throw error;
    }
  }

  // Helper methods
  private handleApiError(operation: string, error: any): void {
    console.error(`API Error (${operation}):`, 
      error?.response?.status,
      error?.response?.data || error.message
    );
    
    // Log useful request details for debugging
    if (error.config) {
      console.error('Request URL:', error.config.url);
      console.error('Request Method:', error.config.method);
      console.error('Request Headers:', error.config.headers);
      
      // Log request payload (if it exists)
      if (error.config.data) {
        try {
          const requestData = JSON.parse(error.config.data);
          console.error('Request Payload:', requestData);
        } catch (e) {
          console.error('Request Payload (raw):', error.config.data);
        }
      }
    }
    
    // Enhanced error details for better debugging
    if (error.response) {
      if (error.response.status === 401) {
        console.error('Authentication error: Token may be invalid or expired');
      } else if (error.response.status === 403) {
        console.error('Permission error: User lacks required permissions');
      } else if (error.response.status === 400) {
        // Log detailed validation errors
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          Object.entries(errorData).forEach(([field, errors]) => {
            console.error(`Field '${field}' errors:`, errors);
          });
        }
      }
    }
    
    throw error;
  }

  // Data transformation methods
  private transformOrdersData(data: any[]): TransactionItem[] {
    return data.map((item) => this.transformOrderData(item));
  }

  private transformOrderData(data: any): TransactionItem {
    // Transform order items
    const items: OrderItem[] = (data.items || []).map((item: any) => ({
      itemId: String(item.item || ""),
      quantity: item.quantity || 0,
      price: parseFloat(item.unit_price) || 0
    }));

    return {
      id: String(data.id || ""),
      customerName: data.customer_name || "",
      customerPhone: data.customer_phone || "",
      customerEmail: data.customer_email || "",
      orderNumber: data.order_number || "",
      orderDate: data.order_date || new Date().toISOString(),
      status: data.status || "pending",
      paymentStatus: data.payment_status || "pending",
      paymentMethod: data.payment_method || "Cash",
      total: parseFloat(data.total_amount) || 0,
      items: items,
      user: data.user || 0,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || data.created_at || new Date().toISOString(),
      actions: []
    };
  }
}

export const transactionService = new TransactionService();