/* eslint-disable @typescript-eslint/no-explicit-any */
// @/lib/services/inventory.ts

import {
  getBusinessBranchList,
  registerBusinessBranch,
  updateBranchDetail,
  deleteBranch,
  getCategoriesList,
  registerCategory,
  updateCategoryDetail,
  deleteCategory,
  getBusinessBranchItemList,
  registerItem,
  updateItemDetail,
  deleteItem
} from "@/lib/axios";
import type { InventoryItem } from "@/types/features/inventory";

class InventoryService {
  // Branches endpoints
  async fetchBranches(): Promise<InventoryItem[]> {
    try {
      const response = await getBusinessBranchList();
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn("Branch response is not an array:", response.data);
        return [];
      }

      return this.transformBranchesData(response.data);
    } catch (error: any) {
      this.handleApiError("fetchBranches", error);
      return [];
    }
  }

  async createBranch(branchData: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const payload = {
        name: branchData.name,
        address: branchData.address,
        contact_number: branchData.contactNumber?.startsWith("+251")
          ? branchData.contactNumber
          : `+251${branchData.contactNumber}`,
        is_active: branchData.active === undefined ? true : branchData.active,
      };

      const response = await registerBusinessBranch(payload);
      return this.transformBranchData(response.data);
    } catch (error: any) {
      this.handleApiError("createBranch", error);
      throw error;
    }
  }

  async updateBranch(id: string, branchData: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const payload = {
        name: branchData.name,
        address: branchData.address,
        contact_number: branchData.contactNumber?.startsWith("+251")
          ? branchData.contactNumber
          : `+251${branchData.contactNumber}`,
        is_active: branchData.active,
      };
  
      const response = await updateBranchDetail(parseInt(id), payload);
      return this.transformBranchData(response.data);
    } catch (error: any) {
      this.handleApiError("updateBranch", error);
      throw error;
    }
  }

  async deleteBranch(id: string): Promise<void> {
    try {
      await deleteBranch(parseInt(id));
    } catch (error: any) {
      this.handleApiError("deleteBranch", error);
      throw error;
    }
  }

  // Categories endpoints
  async fetchCategories(): Promise<InventoryItem[]> {
    try {
      const response = await getCategoriesList();

      if (!response.data || !Array.isArray(response.data)) {
        console.warn("Categories response is not an array:", response.data);
        return [];
      }

      return this.transformCategoriesData(response.data);
    } catch (error: any) {
      this.handleApiError("fetchCategories", error);
      return [];
    }
  }

  async createCategory(categoryData: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const payload = {
        name: categoryData.name,
        description: categoryData.description || "",
        is_active: categoryData.active === undefined ? true : categoryData.active,
      };

      const response = await registerCategory(payload);
      return this.transformCategoryData(response.data);
    } catch (error: any) {
      this.handleApiError("createCategory", error);
      throw error;
    }
  }

  async updateCategory(id: string, categoryData: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const payload = {
        name: categoryData.name,
        description: categoryData.description || "",
        is_active: categoryData.active,
      };
  
      const response = await updateCategoryDetail(parseInt(id), payload);
      return this.transformCategoryData(response.data);
    } catch (error: any) {
      this.handleApiError("updateCategory", error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await deleteCategory(parseInt(id));
    } catch (error: any) {
      this.handleApiError("deleteCategory", error);
      throw error;
    }
  }

  // Items endpoints
  async fetchItems(): Promise<InventoryItem[]> {
    try {
      // Add query parameter for branch ID if user doesn't have business_branch
      const urlParams = new URLSearchParams(window.location.search);
      const branchIdParam = urlParams.get('branch_id');
      
      let response;
      
      // If there's a branch_id in URL, use it
      if (branchIdParam) {
        response = await getBusinessBranchItemList(`?branch_id=${branchIdParam}`);
      } else {
        response = await getBusinessBranchItemList();
      }
  
      console.log("Items response:", response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        console.warn("Items response is not an array:", response.data);
        return [];
      }
  
      return this.transformItemsData(response.data);
    } catch (error: any) {
      console.error("Full fetch items error:", error);
      
      // Handle 400 errors specifically - likely no business branch assigned
      if (error.response?.status === 400) {
        console.warn("400 Error: You likely don't have a business branch assigned");
        
        // Try to get the first active branch and retry with that
        try {
          const branchesResponse = await getBusinessBranchList();
          if (branchesResponse.data && Array.isArray(branchesResponse.data) && branchesResponse.data.length > 0) {
            const firstBranch = branchesResponse.data[0];
            console.log("Retrying with first branch:", firstBranch.id);
            
            const itemsResponse = await getBusinessBranchItemList(`?branch_id=${firstBranch.id}`);
            if (itemsResponse.data && Array.isArray(itemsResponse.data)) {
              return this.transformItemsData(itemsResponse.data);
            }
          }
        } catch (retryError) {
          console.error("Retry with branch ID failed:", retryError);
        }
      }
      
      this.handleApiError("fetchItems", error);
      return [];
    }
  }

  async createItem(itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      // Validate required fields
      if (!itemData.branchId) {
        throw new Error("Branch ID is required to create an item");
      }
      
      if (!itemData.categoryId) {
        throw new Error("Category ID is required to create an item");
      }
      
      const payload = {
        name: itemData.name,
        price: itemData.price,
        quantity: itemData.quantity,
        category: itemData.categoryId,
        business_branch: itemData.branchId,
        unit_of_measure: itemData.unitOfMeasure || 'pieces',
        is_active: itemData.active === undefined ? true : itemData.active,
      };
      
      console.log("Creating item with payload:", payload);
      
      const response = await registerItem(payload);
      console.log("Item creation response:", response.data);
      return this.transformItemData(response.data);
    } catch (error: any) {
      console.error("Error creating item:", error);
      console.error("Error response data:", error.response?.data);
      
      if (error.response?.status === 400) {
        const errorDetails = error.response.data;
        // Log specific validation errors if available
        console.error("Validation errors:", JSON.stringify(errorDetails, null, 2));
        
        // Construct a more detailed error message
        const errorMessage = 
          typeof errorDetails === 'object' && errorDetails !== null
            ? Object.entries(errorDetails)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')
            : error.message || 'Failed to create item';
        
        throw new Error(errorMessage);
      }
      
      this.handleApiError("createItem", error);
      throw error;
    }
  }

  async updateItem(id: string, itemData: Partial<InventoryItem>): Promise<InventoryItem> {
    try {
      const payload = {
        name: itemData.name,
        price: itemData.price,
        quantity: itemData.quantity,
        category: itemData.categoryId,
        business_branch: itemData.branchId,
        unit_of_measure: itemData.unitOfMeasure,
        is_active: itemData.active,
      };

      const response = await updateItemDetail(parseInt(id), payload);
      return this.transformItemData(response.data);
    } catch (error: any) {
      this.handleApiError("updateItem", error);
      throw error;
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      await deleteItem(parseInt(id));
    } catch (error: any) {
      this.handleApiError("deleteItem", error);
      throw error;
    }
  }

  // Helper methods
  private checkAuth(): boolean {
    return typeof window !== 'undefined' && Boolean(localStorage.getItem('auth_token'));
  }

  private handleApiError(operation: string, error: any): void {
    console.error(`API Error (${operation}):`, 
      error?.response?.status,
      error?.response?.data || error.message
    );
    
    // Log useful request details for debugging
    if (error.config) {
      console.error('Request URL:', error.config.url);
      console.error('Request Method:', error.config.method);
    }
    
    throw error;
  }

  // Data transformation methods
  private transformBranchesData(data: any[]): InventoryItem[] {
    return data.map((item) => this.transformBranchData(item));
  }

  private transformBranchData(data: any): InventoryItem {
    return {
      id: String(data.id || ""),
      name: data.name || "",
      address: data.address || "",
      contactNumber: (data.contact_number || "").replace(/^\+251/, ""),
      active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || data.created_at || new Date().toISOString(),
    };
  }
  
  private transformCategoriesData(data: any[]): InventoryItem[] {
    return data.map((item) => this.transformCategoryData(item));
  }

  private transformCategoryData(data: any): InventoryItem {
    return {
      id: String(data.id || ""),
      name: data.name || "",
      description: data.description || "",
      active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || data.created_at || new Date().toISOString(),
    };
  }

  private transformItemsData(data: any[]): InventoryItem[] {
    return data.map((item) => this.transformItemData(item));
  }

  private transformItemData(data: any): InventoryItem {
    return {
      id: String(data.id || ""),
      name: data.name || "",
      price: typeof data.price === "number" ? data.price : parseFloat(data.price) || 0,
      quantity: typeof data.quantity === "number" ? data.quantity : parseInt(data.quantity) || 0,
      categoryId: String(data.category || ""),
      branchId: String(data.business_branch || ""),
      unitOfMeasure: data.unit_of_measure || "",
      active: data.is_active !== undefined ? Boolean(data.is_active) : true,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || data.created_at || new Date().toISOString(),
    };
  }
}

export const inventoryService = new InventoryService();