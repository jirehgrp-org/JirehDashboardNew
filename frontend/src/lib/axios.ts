/* eslint-disable @typescript-eslint/no-explicit-any */
// @/lib/axios.ts

import axios, { InternalAxiosRequestConfig } from "axios";
import { authService } from "./services/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1",
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authService.getToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshed = await authService.refreshAccessToken();
        if (refreshed) {
          originalRequest.headers[
            "Authorization"
          ] = `Bearer ${authService.getToken()}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh error:", refreshError);
      }

      authService.removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login?expired=true";
      }
    }

    return Promise.reject(error);
  }
);

// AUTHENTICATION & USER MANAGEMENT
export const registerUser = (data: any) => api.post("/register/user/", data);
export const getUserProfile = () => api.get("/user/");
export const getCurrentUser = () => api.get("/auth/user/");
export const getUserDetail = (userId: number) => api.get(`/user/${userId}/`);
export const updateUserProfile = (userId: number, data: any) =>
  api.put(`/user/${userId}/`, data);
export const deleteUser = (userId: number) => api.delete(`/user/${userId}/`);

// BUSINESS MANAGEMENT
export const registerBusiness = async (data: any) => {
  console.log("Registering business with data:", data);
  try {
    // Ensure phone number is properly formatted
    const formattedPhone = data.contact_number.startsWith("+251") 
      ? data.contact_number 
      : data.contact_number.startsWith("251")
        ? `+${data.contact_number}`
        : `+251${data.contact_number}`;
    
    // Create a new object with the formatted phone
    const formattedData = {
      ...data,
      contact_number: formattedPhone
    };
    
    const response = await api.post("/register/business/", formattedData);
    console.log("Business registration response:", response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error(
      "Business registration error:",
      error.response?.data || error.message
    );
    
    // Attempt to extract detailed error messages
    let errorMessage = "Business registration failed";
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else {
        // Try to extract field-specific errors
        const fieldErrors = [];
        for (const field in error.response.data) {
          if (Array.isArray(error.response.data[field])) {
            fieldErrors.push(`${field}: ${error.response.data[field].join(', ')}`);
          } else if (typeof error.response.data[field] === 'string') {
            fieldErrors.push(`${field}: ${error.response.data[field]}`);
          }
        }
        
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors.join('; ');
        }
      }
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};
export const getBusinessList = () => api.get("/business/list/");
export const getBusinessDetail = (businessId: number) =>
  api.get(`/business/${businessId}/`);
export const getBusinessRelatedUsers = () => api.get("/users/list/");

// BRANCH MANAGEMENT
export const getBusinessBranchList = () => api.get("/business/branch/list/");
export const getBusinessBranchDetail = (branchId: number) =>
  api.get(`/business/branch/${branchId}/`);
export const registerBusinessBranch = (data: any) =>
  api.post("/business/branch/register/", data);
export const updateBranchDetail = (branchId: number, data: any) =>
  api.put(`/business/branch/${branchId}/`, data);
export const deleteBranch = (branchId: number) =>
  api.delete(`/business/branch/${branchId}/`);

// CATEGORY MANAGEMENT
export const getCategoriesList = () => api.get("/categories/list/");
export const getCategoryDetail = (categoryId: number) =>
  api.get(`/categories/${categoryId}/`);
export const registerCategory = (data: any) =>
  api.post("/categories/register/", data);
export const updateCategoryDetail = (categoryId: number, data: any) =>
  api.put(`/categories/${categoryId}/`, data);
export const deleteCategory = (categoryId: number) =>
  api.delete(`/categories/${categoryId}/`);

// INVENTORY/ITEM MANAGEMENT
export const getBusinessBranchItemList = (queryParams = "") => {
  let url = "/business/branch/item/list/";

  // Convert string parameter to proper query string format
  if (queryParams && !queryParams.startsWith("?")) {
    url += `?${queryParams}`;
  } else if (queryParams) {
    url += queryParams;
  }

  console.log("Fetching items with URL:", url);
  return api.get(url);
};

export const getItemDetail = (itemId: number) => api.get(`/item/${itemId}/`);
export const registerItem = (data: any) => {
  console.log("Registering item with data:", data);
  return api.post("/item/register/", data);
};
export const updateItemDetail = (itemId: number, data: any) =>
  api.put(`/item/${itemId}/`, data);
export const deleteItem = (itemId: number) => api.delete(`/item/${itemId}/`);

// USER OPERATIONS API ENDPOINTS
export const getUsersList = () => api.get("/users/list/");
export const getUserOperationDetail = (userId: number) => api.get(`/users/${userId}/`);
export const registerUserOperation = (data: any) => api.post("/users/register/", data);
export const updateUserOperation = (userId: number, data: any) => api.put(`/users/${userId}/`, data);
export const deleteUserOperation = (userId: number) => api.delete(`/users/${userId}/`);

// EXPENSE OPERATIONS API ENDPOINTS
export const getExpensesList = () => api.get("/expenses/list/");
export const getExpenseOperationDetail = (expenseId: number) => api.get(`/expenses/${expenseId}/`);
export const registerExpenseOperation = (data: any) => api.post("/expenses/register/", data);
export const updateExpenseOperation = (expenseId: number, data: any) => api.put(`/expenses/${expenseId}/`, data);
export const deleteExpenseOperation = (expenseId: number) => api.delete(`/expenses/${expenseId}/`);

// ORDER MANAGEMENT
export const getOrdersList = () => api.get("/orders/list/");
export const getOrderDetail = (orderId: number) =>
  api.get(`/order/${orderId}/`);
export const registerOrder = (data: any) => api.post("/order/register/", data);
export const updateOrderDetail = (orderId: number, data: any) =>
  api.put(`/order/${orderId}/`, data);
export const deleteOrder = (orderId: number) =>
  api.delete(`/order/${orderId}/`);

// PLAN MANAGEMENT
export const getPlansList = () => api.get("/plans/list/");
export const getPlanDetail = (planId: number) => api.get(`/plan/${planId}/`);
export const registerPlan = (data: any) => api.post("/plan/register/", data);
export const updatePlanDetail = (planId: number, data: any) =>
  api.put(`/plan/${planId}/`, data);
export const deletePlan = (planId: number) => api.delete(`/plan/${planId}/`);

// SUBSCRIPTION & FEATURES MANAGEMENT
export const getFeaturesList = () => api.get("/features/list/");
export const getFeatureDetail = (featureId: number) =>
  api.get(`/feature/${featureId}/`);

export const registerFeature = (data: any) =>
  api.post("/feature/register/", data);
export const updateFeatureDetail = (featureId: number, data: any) =>
  api.put(`/feature/${featureId}/`, data);
export const deleteFeature = (featureId: number) =>
  api.delete(`/feature/${featureId}/`);

// TRANSACTION MANAGEMENT
export const getTransactionsList = () => api.get("/transactions/list/");
export const getTransactionDetail = (orderId: number) => api.get(`/transactions/${orderId}/`);
export const registerTransaction = (data: any) => api.post("/transactions/register/", data);
export const updateTransactionDetail = (orderId: number, data: any) => api.put(`/transactions/${orderId}/`, data);
export const deleteTransaction = (orderId: number) => api.delete(`/transactions/${orderId}/`);

export default api;