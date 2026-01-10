import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type ModalType = 'profile' | 'settings' | 'new-chat' | null;

interface UIState {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  // Active modal
  activeModal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  
  // Mobile sidebar
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  
  // Loading states
  isLoading: boolean;
  setLoading: (isLoading: boolean) => void;
  
  // Toast notifications
  toast: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isVisible: boolean;
  };
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
  
  // Reset store
  reset: () => void;
}

const initialState = {
  theme: 'system' as Theme,
  activeModal: null as ModalType,
  isMobileSidebarOpen: false,
  isLoading: false,
  toast: {
    message: '',
    type: 'info' as const,
    isVisible: false,
  },
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Theme
      setTheme: (theme) => {
        // Apply theme class to document element
        const root = window.document.documentElement;
        
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.toggle('dark', prefersDark);
        } else {
          root.classList.toggle('dark', theme === 'dark');
        }
        
        set({ theme });
      },
      
      // Modal
      openModal: (modal) => set({ activeModal: modal }),
      closeModal: () => set({ activeModal: null }),
      
      // Mobile sidebar
      toggleMobileSidebar: () =>
        set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
      
      // Loading
      setLoading: (isLoading) => set({ isLoading }),
      
      // Toast
      showToast: (message, type = 'info') =>
        set({
          toast: {
            message,
            type,
            isVisible: true,
          },
        }),
      hideToast: () =>
        set((state) => ({
          toast: {
            ...state.toast,
            isVisible: false,
          },
        })),
      
      // Reset
      reset: () => {
        set(initialState);
        // Re-apply theme after reset
        get().setTheme(initialState.theme);
      },
    }),
    {
      name: 'ui-settings',
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const { setTheme } = useUIStore.getState();
  setTheme(useUIStore.getState().theme);
  
  // Watch for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (useUIStore.getState().theme === 'system') {
      document.documentElement.classList.toggle('dark', e.matches);
    }
  });
}
