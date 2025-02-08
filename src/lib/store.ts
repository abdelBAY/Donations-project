import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { persist } from 'zustand/middleware';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  isDarkMode: boolean;
  setDarkMode: (isDark: boolean) => void;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      isLoading: true,
      setIsLoading: (isLoading) => set({ isLoading }),
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [...state.notifications, notification],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      isDarkMode: false,
      setDarkMode: (isDark) => 
        set(() => {
          document.documentElement.classList.toggle('dark', isDark);
          return { isDarkMode: isDark };
        }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
);