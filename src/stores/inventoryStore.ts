import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { InventoryItem, FoodCategory } from '../types';

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addItem: (item: Omit<InventoryItem, 'id' | 'addedDate'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  getExpiringSoon: (days: number) => InventoryItem[];
  getByLocation: (location: InventoryItem['location']) => InventoryItem[];
  getByCategory: (category: FoodCategory) => InventoryItem[];
  clearAll: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      addItem: (item) => {
        const newItem: InventoryItem = {
          ...item,
          id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          addedDate: new Date(),
        };
        set((state) => ({ items: [...state.items, newItem] }));
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          ),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      getExpiringSoon: (days) => {
        const now = new Date();
        const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        return get().items.filter(
          (item) => item.expiryDate && item.expiryDate <= cutoff
        ).sort((a, b) => {
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return a.expiryDate.getTime() - b.expiryDate.getTime();
        });
      },

      getByLocation: (location) => {
        return get().items.filter((item) => item.location === location);
      },

      getByCategory: (category) => {
        return get().items.filter((item) => item.category === category);
      },

      clearAll: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'hearthstone-inventory',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
