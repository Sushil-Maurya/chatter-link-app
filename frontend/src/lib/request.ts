import { Action } from "@radix-ui/react-toast";
import { axiosInstance } from "./axios";
import { AxiosRequestConfig, AxiosResponse } from "axios";

interface RequestOptions extends AxiosRequestConfig {
  showSuccess?: boolean | string;
  showError?: boolean | string;
  requiresAuth?: boolean;
}

/**
 * Reusable request wrapper around axiosInstance
 */
export const request = {
  get: async <T = any>(url: string, options: RequestOptions = {}) => {
    const { showSuccess, showError, ...config } = options;
    const response = await axiosInstance.get<T>(url, {
      ...config,
      showSuccessMessage: showSuccess,
      showErrorMessage: showError,
    });
    return response.data;
  },

  post: async <T = any>(url: string, data?: any, options: RequestOptions = {}) => {
    const { showSuccess, showError, ...config } = options;
    const response = await axiosInstance.post<T>(url, data, {
      ...config,
      showSuccessMessage: showSuccess,
      showErrorMessage: showError,
    });
    return response.data;
  },

  put: async <T = any>(url: string, data?: any, options: RequestOptions = {}) => {
    const { showSuccess, showError, ...config } = options;
    const response = await axiosInstance.put<T>(url, data, {
      ...config,
      showSuccessMessage: showSuccess,
      showErrorMessage: showError,
    });
    return response.data;
  },

  delete: async <T = any>(url: string, options: RequestOptions = {}) => {
    const { showSuccess, showError, ...config } = options;
    const response = await axiosInstance.delete<T>(url, {
      ...config,
      showSuccessMessage: showSuccess,
      showErrorMessage: showError,
    });
    return response.data;
  },
  
  patch: async <T = any>(url: string, data?: any, options: RequestOptions = {}) => {
    const { showSuccess, showError, ...config } = options;
    const response = await axiosInstance.patch<T>(url, data, {
      ...config,
      showSuccessMessage: showSuccess,
      showErrorMessage: showError,
    });
    return response.data;
  }
};
