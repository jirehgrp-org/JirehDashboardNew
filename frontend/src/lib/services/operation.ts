/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @/lib/services/operation.ts

import api from "@/lib/axios";
import type { OperationItem } from "@/types/features/operation";

class OperationService {
  // User operations
  async fetchUsers(): Promise<OperationItem[]> {
    try {
      const response = await api.get("/users/list/");
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn("Users response is not an array:", response.data);
        return [];
      }
  
      // Debug log to see what's coming from the API
      console.log("API response for users:", response.data);
      
      // Check if business_branch and branch_name are in the response
      if (response.data.length > 0) {
        const sampleUser = response.data[0];
        console.log("Sample user data:", {
          id: sampleUser.id,
          business_branch: sampleUser.business_branch,
          branch_name: sampleUser.branch_name,
          other_fields: Object.keys(sampleUser)
        });
      }
  
      return this.transformUsersData(response.data);
    } catch (error: any) {
      this.handleApiError("fetchUsers", error);
      return [];
    }
  }

  async createUser(userData: Partial<OperationItem>): Promise<OperationItem> {
    try {
      console.log("Creating user with data:", userData);
      
      // Format phone number if needed
      let phone = userData.phone || "";
      if (phone) {
        // Remove any spaces and dashes
        phone = phone.replace(/\s/g, '').replace(/-/g, '');
        if (!phone.startsWith('+251')) {
          // If it starts with 0, remove it before adding +251
          phone = `+251${phone.replace(/^0+/, '')}`;
        }
      }

      const payload = {
        fullname: userData.name, // Map to fullname for backend
        name: userData.name,  // Keep name for compatibility
        username: userData.username,
        email: userData.email,
        phone: phone,
        role: userData.role || "sales",
        business_branch: userData.branchId,
        is_active: userData.active === undefined ? true : userData.active
      };

      console.log("Sending user creation payload:", payload);
      const response = await api.post("/users/register/", payload);
      console.log("User creation response:", response.data);
      return this.transformUserData(response.data);
    } catch (error: any) {
      this.handleApiError("createUser", error);
      throw error;
    }
  }

  async updateUser(id: string, userData: Partial<OperationItem>): Promise<OperationItem> {
    try {
      console.log("Updating user with id:", id, "data:", userData);
      
      // Format phone number if needed
      let phone = userData.phone || "";
      if (phone) {
        // Remove any spaces and dashes
        phone = phone.replace(/\s/g, '').replace(/-/g, '');
        if (!phone.startsWith('+251')) {
          // If it starts with 0, remove it before adding +251
          phone = `+251${phone.replace(/^0+/, '')}`;
        }
      }

      const payload = {
        fullname: userData.name,
        email: userData.email,
        phone: phone,
        role: userData.role,
        business_branch: userData.branchId,
        is_active: userData.active
      };
  
      console.log("Sending user update payload:", payload);
      const response = await api.put(`/users/${id}/`, payload);
      console.log("User update response:", response.data);
      return this.transformUserData(response.data);
    } catch (error: any) {
      this.handleApiError("updateUser", error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}/`);
    } catch (error: any) {
      this.handleApiError("deleteUser", error);
      throw error;
    }
  }

  // Expense operations
  async fetchExpenses(): Promise<OperationItem[]> {
    try {
      const response = await api.get("/expenses/list/");
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn("Expenses response is not an array:", response.data);
        return [];
      }

      return this.transformExpensesData(response.data);
    } catch (error: any) {
      this.handleApiError("fetchExpenses", error);
      return [];
    }
  }

  async createExpense(expenseData: Partial<OperationItem>): Promise<OperationItem> {
    try {
      console.log("Creating expense with data:", expenseData);
      const payload = {
        name: expenseData.name || "Expense",
        amount: expenseData.amount,
        description: expenseData.description || "",
        recurring_frequency: expenseData.frequency, // Backend expects 'recurring_frequency'
        business_branch: expenseData.branchId,
        is_active: expenseData.active === undefined ? true : expenseData.active,
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'Cash'
      };
  
      console.log("Sending expense creation payload:", payload);
      const response = await api.post("/expenses/register/", payload);
      console.log("Expense creation response:", response.data);
      return this.transformExpenseData(response.data);
    } catch (error: any) {
      this.handleApiError("createExpense", error);
      throw error;
    }
  }

  async updateExpense(id: string, expenseData: Partial<OperationItem>): Promise<OperationItem> {
    try {
      console.log("Updating expense with id:", id, "data:", expenseData);
      const payload = {
        amount: expenseData.amount,
        description: expenseData.description,
        recurring_frequency: expenseData.frequency, // Backend expects 'recurring_frequency' not 'frequency'
        business_branch: expenseData.branchId,
        is_active: expenseData.active // Backend expects 'is_active' not 'active'
      };
  
      console.log("Sending expense update payload:", payload);
      const response = await api.put(`/expenses/${id}/`, payload);
      console.log("Expense update response:", response.data);
      return this.transformExpenseData(response.data);
    } catch (error: any) {
      this.handleApiError("updateExpense", error);
      throw error;
    }
  }

  async deleteExpense(id: string): Promise<void> {
    try {
      await api.delete(`/expenses/${id}/`);
    } catch (error: any) {
      this.handleApiError("deleteExpense", error);
      throw error;
    }
  }

  private handleApiError(operation: string, error: any): void {
    console.error(`API Error (${operation}):`, 
      error?.response?.status,
      error?.response?.data || error.message
    );
    
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
  private transformUsersData(data: any[]): OperationItem[] {
    return data.map((item) => this.transformUserData(item));
  }

  private transformUserData(data: any): OperationItem {
    console.log("Transforming user data:", data); 
    
    let branchId = "";
    let branchName = "";
    
    if (data.business_branch !== null && data.business_branch !== undefined) {
      branchId = String(data.business_branch);
      console.log(`Found business_branch ID: ${branchId}`);
    }
    
    if (data.branch_name) {
      branchName = data.branch_name;
      console.log(`Found branch_name: ${branchName}`);
    }
    
    // Add additional logging to debug branch data
    console.log(`User ${data.id} branch data:`, { 
      branchId: data.business_branch,
      branchName: data.branch_name,
      rawBranchData: data.business_branch 
    });
    
    return {
      id: String(data.id || ""),
      name: data.fullname || data.name || "",
      username: data.username || "",
      email: data.email || "",
      phone: (data.phone || "").replace(/^\+251/, ""),
      role: data.role || "",
      branchId: branchId,
      branchName: branchName,
      active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || data.created_at || new Date().toISOString(),
    };
  }
  
  private transformExpensesData(data: any[]): OperationItem[] {
    return data.map((item) => this.transformExpenseData(item));
  }

  private transformExpenseData(data: any): OperationItem {
    return {
      id: String(data.id || ""),
      name: data.name || (data.description ? data.description.substring(0, 30) : "Expense"),
      amount: typeof data.amount === "number" ? data.amount : parseFloat(data.amount) || 0,
      description: data.description || "",
      frequency: data.frequency || data.recurring_frequency || "once",
      branchId: data.business_branch ? String(data.business_branch) : "",
      branchName: data.branch_name || "",
      active: data.active !== undefined ? Boolean(data.active) : Boolean(data.is_active),
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || data.created_at || new Date().toISOString(),
    };
  }
}

export const operationService = new OperationService();