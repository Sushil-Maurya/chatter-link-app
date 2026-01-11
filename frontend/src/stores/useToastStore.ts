import { create } from 'zustand';
import { toast, ToastOptions } from 'react-hot-toast';

interface ToastState {
  show: (message: string, type?: 'success' | 'error' | 'loading' | 'blank', options?: ToastOptions) => string;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  loading: (message: string, options?: ToastOptions) => string;
  dismiss: (toastId?: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  show: (message, type = 'blank', options) => {
    switch (type) {
      case 'success': return toast.success(message, options);
      case 'error': return toast.error(message, options);
      case 'loading': return toast.loading(message, options);
      default: return toast(message, options);
    }
  },
  success: (message, options) => {
    return toast.success(message, options);
  },
  error: (message, options) => {
    return toast.error(message, options);
  },
  loading: (message, options) => {
    return toast.loading(message, options);
  },
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  }
}));
