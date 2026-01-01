import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDateAwareStorage } from '../lib/storage';
import { generateId } from '../lib/uuid';
import { supabase } from '../lib/supabase';
import type { InventoryItem, FoodCategory } from '../types';
import type { InventoryItemRow, InventoryItemInsert } from '../types/database';

// Queue for offline sync
interface SyncQueueItem {
  type: 'add' | 'update' | 'delete';
  itemId: string;
  data?: Partial<InventoryItemInsert>;
  timestamp: number;
}

interface InventoryState {
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  syncQueue: SyncQueueItem[];
  lastSyncedAt: string | null;

  // Actions
  addItem: (item: Omit<InventoryItem, 'id' | 'addedDate'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeItem: (id: string) => void;
  setItems: (items: InventoryItem[]) => void;
  getExpiringSoon: (days: number) => InventoryItem[];
  getByLocation: (location: InventoryItem['location']) => InventoryItem[];
  getByCategory: (category: FoodCategory) => InventoryItem[];
  clearAll: () => void;

  // Supabase sync actions
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: (userId: string) => Promise<void>;
}

// Helper to convert local InventoryItem to Supabase row format
const itemToRow = (item: InventoryItem, userId: string): InventoryItemInsert => ({
  id: item.id,
  user_id: userId,
  name: item.name,
  emoji: item.emoji,
  quantity: item.quantity,
  unit: item.unit,
  location: item.location,
  expiry_date: item.expiryDate ? item.expiryDate.toISOString() : null,
  category: item.category,
});

// Helper to convert Supabase row to local InventoryItem
const rowToItem = (row: InventoryItemRow): InventoryItem => ({
  id: row.id,
  name: row.name,
  emoji: row.emoji,
  quantity: row.quantity,
  unit: row.unit,
  location: row.location,
  expiryDate: row.expiry_date ? new Date(row.expiry_date) : null,
  addedDate: new Date(row.created_at),
  category: row.category,
});

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      syncQueue: [],
      lastSyncedAt: null,

      addItem: (item) => {
        const newItem: InventoryItem = {
          ...item,
          id: generateId('inv'),
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

      setItems: (items) => {
        set({ items });
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

      syncToSupabase: async () => {
        const { items, syncQueue } = get();

        // Get current user from auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('[inventoryStore] No authenticated user, skipping sync');
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Process queued operations first (for offline sync)
          if (syncQueue.length > 0) {
            console.log(`[inventoryStore] Processing ${syncQueue.length} queued operations`);
            const processedIds: string[] = [];

            for (const queueItem of syncQueue) {
              try {
                if (queueItem.type === 'delete') {
                  await supabase
                    .from('inventory_items')
                    .delete()
                    .eq('id', queueItem.itemId);
                } else if (queueItem.type === 'add' && queueItem.data) {
                  await (supabase as any)
                    .from('inventory_items')
                    .upsert(queueItem.data);
                } else if (queueItem.type === 'update' && queueItem.data) {
                  await (supabase as any)
                    .from('inventory_items')
                    .update(queueItem.data)
                    .eq('id', queueItem.itemId);
                }
                processedIds.push(queueItem.itemId);
              } catch (error) {
                console.error('[inventoryStore] Error processing queue item:', error);
              }
            }

            // Remove processed items from queue
            set((state) => ({
              syncQueue: state.syncQueue.filter(
                (item) => !processedIds.includes(item.itemId)
              ),
            }));
          }

          // Delete all existing items for this user and replace with current state
          // This is simpler than tracking individual changes
          const { error: deleteError } = await supabase
            .from('inventory_items')
            .delete()
            .eq('user_id', user.id);

          if (deleteError) {
            console.error('[inventoryStore] Error clearing old items:', deleteError.message);
            throw deleteError;
          }

          // Insert all current items (use type assertion for Supabase compatibility)
          if (items.length > 0) {
            const rows = items.map((item) => itemToRow(item, user.id));

            const { error: insertError } = await (supabase as any)
              .from('inventory_items')
              .insert(rows);

            if (insertError) {
              console.error('[inventoryStore] Error inserting items:', insertError.message);
              throw insertError;
            }
          }

          set({
            lastSyncedAt: new Date().toISOString(),
            syncQueue: [],
          });
          console.log(`[inventoryStore] Successfully synced ${items.length} items to Supabase`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
          console.error('[inventoryStore] Sync error:', errorMessage);

          // Queue items for later sync (offline scenario)
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            set((state) => ({
              error: errorMessage,
              syncQueue: [
                ...state.syncQueue,
                ...items.map((item) => ({
                  type: 'add' as const,
                  itemId: item.id,
                  data: itemToRow(item, authUser.id),
                  timestamp: Date.now(),
                })),
              ],
            }));
          }
        } finally {
          set({ isLoading: false });
        }
      },

      loadFromSupabase: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('[inventoryStore] Error loading from Supabase:', error.message);
            set({ error: error.message });
            return;
          }

          if (!data || data.length === 0) {
            console.log('[inventoryStore] No inventory items found for user');
            set({ lastSyncedAt: new Date().toISOString() });
            return;
          }

          const items = data.map(rowToItem);

          set({
            items,
            lastSyncedAt: new Date().toISOString(),
          });
          console.log(`[inventoryStore] Successfully loaded ${items.length} items from Supabase`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown load error';
          console.error('[inventoryStore] Load error:', errorMessage);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'hearthstone-inventory',
      storage: createDateAwareStorage(),
    }
  )
);
