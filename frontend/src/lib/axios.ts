import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { useToastStore } from "../stores/useToastStore";

// Extend AxiosRequestConfig to include custom flags
declare module 'axios' {
  export interface AxiosRequestConfig {
    showSuccessMessage?: boolean | string;
    showErrorMessage?: boolean | string;
    requiresAuth?: boolean;
    feedbackId?: string; // For loading states if needed
  }
}

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.requiresAuth !== false) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const { showSuccessMessage } = response.config;
    if (showSuccessMessage) {
       const message = typeof showSuccessMessage === 'string' 
         ? showSuccessMessage 
         : response.data?.message || 'Operation successful';
       useToastStore.getState().success(message);
    }
    return response;
  },
  (error) => {
    const config = error.config || {};
    
    // If showErrorMessage is explicitly false, do not show toast
    if (config.showErrorMessage === false) {
        return Promise.reject(error);
    }

    // Default global error handler
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    useToastStore.getState().error(message);
    
    // Handle 401 - Unauthorized (Token expired)
    if (error.response?.status === 401) {
        localStorage.removeItem('token');
        // Consider dispatching logout action or redirecting
        if (!window.location.pathname.includes('/login')) {
           window.location.href = '/login';
        }
    }
    
    return Promise.reject(error);
  }
);
