// Supabase Data Hooks for Hearthstone
// Provides hooks for fetching and syncing data with Supabase backend

import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, getCurrentUser } from '../lib/supabase';
import { useUserStore } from '../stores/userStore';
import { useInventoryStore } from '../stores/inventoryStore';
import { useMealPlanStore } from '../stores/mealPlanStore';
import { useProgressStore } from '../stores/progressStore';
import { SAMPLE_RECIPES } from '../data/sampleRecipes';
import type { Recipe, InventoryItem, MealPlan, User, UserPreferences, UserProgress } from '../types';
import type {
  RecipeRow,
  InventoryItemRow,
  MealPlanRow,
  ProfileRow,
  UserProgressRow,
  ProfileUpdate,
  InventoryItemInsert,
  MealPlanInsert,
  UserProgressUpdate,
} from '../types/database';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
  RECIPES_CACHE: 'hearthstone-recipes-cache',
  RECIPES_CACHE_TIMESTAMP: 'hearthstone-recipes-cache-ts',
  OFFLINE_QUEUE: 'hearthstone-offline-queue',
} as const;

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

// ============================================================================
// TYPE CONVERTERS
// ============================================================================

/**
 * Convert a Supabase RecipeRow to a local Recipe type
 */
function convertRecipeRow(row: RecipeRow): Recipe {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    prepTime: row.prep_time,
    cookTime: row.cook_time,
    servings: row.servings,
    difficulty: row.difficulty,
    cuisine: row.cuisine,
    ingredients: row.ingredients as Recipe['ingredients'],
    steps: row.steps as Recipe['steps'],
    tags: row.tags,
    estimatedCost: row.estimated_cost,
  };
}

/**
 * Convert a Supabase InventoryItemRow to a local InventoryItem type
 */
function convertInventoryRow(row: InventoryItemRow): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    quantity: row.quantity,
    unit: row.unit,
    location: row.location,
    expiryDate: row.expiry_date ? new Date(row.expiry_date) : null,
    addedDate: new Date(row.created_at),
    category: row.category,
  };
}

/**
 * Convert a local InventoryItem to Supabase InventoryItemInsert
 */
function convertInventoryToRow(item: InventoryItem, userId: string): InventoryItemInsert {
  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    emoji: item.emoji,
    quantity: item.quantity,
    unit: item.unit,
    location: item.location,
    expiry_date: item.expiryDate?.toISOString() ?? null,
    category: item.category,
  };
}

/**
 * Convert a Supabase MealPlanRow to a local MealPlan type
 */
function convertMealPlanRow(row: MealPlanRow, recipes: Recipe[]): MealPlan {
  const recipe = row.recipe_id ? recipes.find((r) => r.id === row.recipe_id) ?? null : null;
  return {
    id: row.id,
    date: new Date(row.date),
    mealType: row.meal_type,
    recipe,
    notes: row.notes,
    completed: row.completed,
    rating: row.rating,
  };
}

/**
 * Convert a local MealPlan to Supabase MealPlanInsert
 */
function convertMealPlanToRow(plan: MealPlan, userId: string): MealPlanInsert {
  return {
    id: plan.id,
    user_id: userId,
    date: plan.date instanceof Date ? plan.date.toISOString().split('T')[0] : plan.date,
    meal_type: plan.mealType,
    recipe_id: plan.recipe?.id ?? null,
    notes: plan.notes,
    completed: plan.completed,
    rating: plan.rating,
  };
}

/**
 * Convert a Supabase ProfileRow to a local User type
 */
function convertProfileRow(row: ProfileRow, email: string = ''): User {
  return {
    id: row.id,
    name: row.name,
    email,
    avatarUrl: row.avatar_url,
    preferences: (row.preferences as UserPreferences) ?? {
      dietaryRestrictions: [],
      dislikedIngredients: [],
      favoriteCuisines: [],
      cookingSkillLevel: 'intermediate',
      weeknightMaxTime: 45,
      weekendMaxTime: 90,
      chefMode: false,
    },
    partnerId: row.partner_id,
  };
}

/**
 * Convert a Supabase UserProgressRow to a local UserProgress type
 */
function convertProgressRow(row: UserProgressRow): UserProgress {
  return {
    level: row.level,
    currentXP: row.current_xp,
    nextLevelXP: Math.floor(1000 * Math.pow(1.2, row.level - 1)),
    streak: row.streak,
    longestStreak: row.longest_streak,
    achievements: row.achievements as UserProgress['achievements'],
    badges: row.badges as UserProgress['badges'],
  };
}

// ============================================================================
// OFFLINE QUEUE MANAGEMENT
// ============================================================================

interface OfflineQueueItem {
  id: string;
  type: 'inventory' | 'mealplan' | 'progress' | 'profile';
  action: 'insert' | 'update' | 'delete';
  data: unknown;
  timestamp: number;
}

async function getOfflineQueue(): Promise<OfflineQueueItem[]> {
  try {
    const queue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    return queue ? JSON.parse(queue) : [];
  } catch {
    return [];
  }
}

async function addToOfflineQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp'>): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const newItem: OfflineQueueItem = {
      ...item,
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    queue.push(newItem);
    await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (error) {
    console.error('Failed to add to offline queue:', error);
  }
}

async function clearOfflineQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  } catch (error) {
    console.error('Failed to clear offline queue:', error);
  }
}

// ============================================================================
// useRecipes HOOK
// ============================================================================

interface UseRecipesReturn {
  recipes: Recipe[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch all recipes from Supabase
 * - Caches recipes locally after fetch
 * - Falls back to SAMPLE_RECIPES if offline or on error
 */
export function useRecipes(): UseRecipesReturn {
  const [recipes, setRecipes] = useState<Recipe[]>(SAMPLE_RECIPES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we have a valid cache
      const cachedTimestamp = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES_CACHE_TIMESTAMP);
      const cachedRecipes = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES_CACHE);

      if (cachedTimestamp && cachedRecipes) {
        const cacheAge = Date.now() - parseInt(cachedTimestamp, 10);
        if (cacheAge < CACHE_DURATION) {
          // Use cached data
          const parsed = JSON.parse(cachedRecipes) as Recipe[];
          setRecipes(parsed.length > 0 ? parsed : SAMPLE_RECIPES);
          setIsLoading(false);
          return;
        }
      }

      // Fetch from Supabase
      const { data, error: fetchError } = await supabase
        .from('recipes')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        const convertedRecipes = data.map(convertRecipeRow);
        setRecipes(convertedRecipes);

        // Cache the results
        await AsyncStorage.setItem(STORAGE_KEYS.RECIPES_CACHE, JSON.stringify(convertedRecipes));
        await AsyncStorage.setItem(STORAGE_KEYS.RECIPES_CACHE_TIMESTAMP, Date.now().toString());
      } else {
        // No recipes in database, use sample recipes
        setRecipes(SAMPLE_RECIPES);
      }
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch recipes'));

      // Try to load from cache on error
      try {
        const cachedRecipes = await AsyncStorage.getItem(STORAGE_KEYS.RECIPES_CACHE);
        if (cachedRecipes) {
          const parsed = JSON.parse(cachedRecipes) as Recipe[];
          setRecipes(parsed.length > 0 ? parsed : SAMPLE_RECIPES);
        } else {
          // Fall back to sample recipes
          setRecipes(SAMPLE_RECIPES);
        }
      } catch {
        // Ultimate fallback to sample recipes
        setRecipes(SAMPLE_RECIPES);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return {
    recipes,
    isLoading,
    error,
    refetch: fetchRecipes,
  };
}

// ============================================================================
// useUserProfile HOOK
// ============================================================================

interface UseUserProfileReturn {
  profile: User | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

/**
 * Hook to fetch and sync user profile with Supabase
 * - Syncs profile changes to Supabase
 * - Updates local userStore on changes
 */
export function useUserProfile(): UseUserProfileReturn {
  const { user, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const authUser = await getCurrentUser();
        if (!authUser) {
          setIsLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (fetchError) {
          // Profile might not exist yet
          if (fetchError.code === 'PGRST116') {
            // No profile found, that's okay
            setIsLoading(false);
            return;
          }
          throw fetchError;
        }

        if (data) {
          const profile = convertProfileRow(data, authUser.email ?? '');
          setUser(profile);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [setUser]);

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      if (!user) {
        throw new Error('No user to update');
      }

      try {
        const profileUpdate: ProfileUpdate = {};

        if (updates.name !== undefined) {
          profileUpdate.name = updates.name;
        }
        if (updates.avatarUrl !== undefined) {
          profileUpdate.avatar_url = updates.avatarUrl;
        }
        if (updates.partnerId !== undefined) {
          profileUpdate.partner_id = updates.partnerId;
        }
        if (updates.preferences !== undefined) {
          profileUpdate.preferences = updates.preferences as unknown as ProfileUpdate['preferences'];
        }

        const { error: updateError } = await supabase
          .from('profiles')
          .update(profileUpdate)
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        // Update local store
        const updatedUser: User = {
          ...user,
          ...updates,
          preferences: updates.preferences
            ? { ...user.preferences, ...updates.preferences }
            : user.preferences,
        };
        setUser(updatedUser);
      } catch (err) {
        console.error('Failed to update profile:', err);

        // Queue for offline sync
        await addToOfflineQueue({
          type: 'profile',
          action: 'update',
          data: { userId: user.id, updates },
        });

        // Still update locally for optimistic UI
        const updatedUser: User = {
          ...user,
          ...updates,
          preferences: updates.preferences
            ? { ...user.preferences, ...updates.preferences }
            : user.preferences,
        };
        setUser(updatedUser);

        throw err;
      }
    },
    [user, setUser]
  );

  return {
    profile: user,
    isLoading,
    error,
    updateProfile,
  };
}

// ============================================================================
// useInventorySync HOOK
// ============================================================================

interface UseInventorySyncReturn {
  syncInventory: () => Promise<void>;
  isSyncing: boolean;
}

/**
 * Hook for real-time inventory synchronization with Supabase
 * - Subscribes to Supabase realtime for inventory changes
 * - Pushes local changes to Supabase
 * - Handles offline queue
 */
export function useInventorySync(): UseInventorySyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const { items, addItem, updateItem, removeItem, clearAll } = useInventoryStore();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Subscribe to realtime changes
  useEffect(() => {
    async function setupRealtimeSubscription() {
      const authUser = await getCurrentUser();
      if (!authUser) return;

      // Clean up existing subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      // Set up new subscription
      channelRef.current = supabase
        .channel('inventory-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inventory_items',
            filter: `user_id=eq.${authUser.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newItem = convertInventoryRow(payload.new as InventoryItemRow);
              // Only add if not already in local store
              if (!items.find((i) => i.id === newItem.id)) {
                addItem(newItem);
              }
            } else if (payload.eventType === 'UPDATE') {
              const updatedItem = convertInventoryRow(payload.new as InventoryItemRow);
              updateItem(updatedItem.id, updatedItem);
            } else if (payload.eventType === 'DELETE') {
              const deletedId = (payload.old as { id: string }).id;
              removeItem(deletedId);
            }
          }
        )
        .subscribe();
    }

    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [items, addItem, updateItem, removeItem]);

  const syncInventory = useCallback(async () => {
    setIsSyncing(true);

    try {
      const authUser = await getCurrentUser();
      if (!authUser) {
        setIsSyncing(false);
        return;
      }

      // Process offline queue first
      const queue = await getOfflineQueue();
      const inventoryQueue = queue.filter((item) => item.type === 'inventory');

      for (const queueItem of inventoryQueue) {
        try {
          if (queueItem.action === 'insert') {
            await supabase.from('inventory_items').insert(queueItem.data as InventoryItemInsert);
          } else if (queueItem.action === 'update') {
            const { id, ...updates } = queueItem.data as InventoryItemInsert & { id: string };
            await supabase.from('inventory_items').update(updates).eq('id', id);
          } else if (queueItem.action === 'delete') {
            const { id } = queueItem.data as { id: string };
            await supabase.from('inventory_items').delete().eq('id', id);
          }
        } catch (err) {
          console.error('Failed to process queue item:', err);
        }
      }

      // Clear processed queue items
      if (inventoryQueue.length > 0) {
        const remainingQueue = queue.filter((item) => item.type !== 'inventory');
        await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remainingQueue));
      }

      // Fetch latest from Supabase
      const { data, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        // Replace local inventory with server data
        clearAll();
        data.forEach((row) => {
          const item = convertInventoryRow(row);
          addItem(item);
        });
      }
    } catch (err) {
      console.error('Failed to sync inventory:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [addItem, clearAll]);

  return {
    syncInventory,
    isSyncing,
  };
}

// ============================================================================
// useMealPlanSync HOOK
// ============================================================================

interface UseMealPlanSyncReturn {
  syncMealPlans: (startDate: Date, endDate: Date) => Promise<void>;
  isSyncing: boolean;
}

/**
 * Hook for meal plan synchronization with Supabase
 * - Fetches meal plans for date range
 * - Syncs completed meals to backend
 */
export function useMealPlanSync(): UseMealPlanSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const { setPlans, plans } = useMealPlanStore();
  const { recipes } = useRecipes();

  const syncMealPlans = useCallback(
    async (startDate: Date, endDate: Date) => {
      setIsSyncing(true);

      try {
        const authUser = await getCurrentUser();
        if (!authUser) {
          setIsSyncing(false);
          return;
        }

        // Process offline queue first
        const queue = await getOfflineQueue();
        const mealPlanQueue = queue.filter((item) => item.type === 'mealplan');

        for (const queueItem of mealPlanQueue) {
          try {
            if (queueItem.action === 'insert') {
              await supabase.from('meal_plans').insert(queueItem.data as MealPlanInsert);
            } else if (queueItem.action === 'update') {
              const { id, ...updates } = queueItem.data as MealPlanInsert & { id: string };
              await supabase.from('meal_plans').update(updates).eq('id', id);
            } else if (queueItem.action === 'delete') {
              const { id } = queueItem.data as { id: string };
              await supabase.from('meal_plans').delete().eq('id', id);
            }
          } catch (err) {
            console.error('Failed to process meal plan queue item:', err);
          }
        }

        // Clear processed queue items
        if (mealPlanQueue.length > 0) {
          const remainingQueue = queue.filter((item) => item.type !== 'mealplan');
          await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remainingQueue));
        }

        // Push local completed meals that might not be synced
        const localCompletedPlans = plans.filter((plan) => plan.completed);
        for (const plan of localCompletedPlans) {
          try {
            const planRow = convertMealPlanToRow(plan, authUser.id);
            await supabase.from('meal_plans').upsert(planRow, { onConflict: 'id' });
          } catch (err) {
            console.error('Failed to sync completed meal plan:', err);
          }
        }

        // Fetch meal plans for date range
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        const { data, error: fetchError } = await supabase
          .from('meal_plans')
          .select('*')
          .eq('user_id', authUser.id)
          .gte('date', startStr)
          .lte('date', endStr)
          .order('date', { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          const convertedPlans = data.map((row) => convertMealPlanRow(row, recipes));

          // Merge with existing plans outside the date range
          const existingPlansOutsideRange = plans.filter((plan) => {
            const planDate = new Date(plan.date);
            return planDate < startDate || planDate > endDate;
          });

          setPlans([...existingPlansOutsideRange, ...convertedPlans]);
        }
      } catch (err) {
        console.error('Failed to sync meal plans:', err);
      } finally {
        setIsSyncing(false);
      }
    },
    [plans, recipes, setPlans]
  );

  return {
    syncMealPlans,
    isSyncing,
  };
}

// ============================================================================
// useProgressSync HOOK
// ============================================================================

interface UseProgressSyncReturn {
  syncProgress: () => Promise<void>;
  isSyncing: boolean;
}

/**
 * Hook for progress/gamification synchronization with Supabase
 * - Syncs XP, streak, achievements to backend
 * - Fetches latest progress on login
 */
export function useProgressSync(): UseProgressSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const { progress, addXP, updateStreak, unlockAchievement } = useProgressStore();

  const syncProgress = useCallback(async () => {
    setIsSyncing(true);

    try {
      const authUser = await getCurrentUser();
      if (!authUser) {
        setIsSyncing(false);
        return;
      }

      // Process offline queue first
      const queue = await getOfflineQueue();
      const progressQueue = queue.filter((item) => item.type === 'progress');

      for (const queueItem of progressQueue) {
        try {
          if (queueItem.action === 'update') {
            const updates = queueItem.data as UserProgressUpdate;
            await supabase
              .from('user_progress')
              .update(updates)
              .eq('user_id', authUser.id);
          }
        } catch (err) {
          console.error('Failed to process progress queue item:', err);
        }
      }

      // Clear processed queue items
      if (progressQueue.length > 0) {
        const remainingQueue = queue.filter((item) => item.type !== 'progress');
        await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(remainingQueue));
      }

      // Check if user has progress record
      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingProgress) {
        // Compare and sync - server wins for most fields
        const serverProgress = convertProgressRow(existingProgress);

        // If server has higher values, update local
        if (serverProgress.level > progress.level) {
          // Server is ahead, sync down
          // Update local store with server values
          const xpDiff = serverProgress.currentXP - progress.currentXP;
          if (xpDiff > 0) {
            addXP(xpDiff);
          }
          if (serverProgress.streak > progress.streak) {
            updateStreak(true); // This will increment streak
          }
          // Unlock any achievements from server that aren't locally unlocked
          serverProgress.achievements.forEach((achievement) => {
            if (achievement.unlockedAt) {
              unlockAchievement(achievement.id);
            }
          });
        } else if (progress.level > serverProgress.level || progress.currentXP > serverProgress.currentXP) {
          // Local is ahead, push to server
          const progressUpdate: UserProgressUpdate = {
            level: progress.level,
            current_xp: progress.currentXP,
            streak: progress.streak,
            longest_streak: progress.longestStreak,
            achievements: progress.achievements as unknown as UserProgressUpdate['achievements'],
            badges: progress.badges as unknown as UserProgressUpdate['badges'],
          };

          await supabase
            .from('user_progress')
            .update(progressUpdate)
            .eq('user_id', authUser.id);
        }
      } else {
        // No server record, create one with local progress
        const { error: insertError } = await supabase.from('user_progress').insert({
          user_id: authUser.id,
          level: progress.level,
          current_xp: progress.currentXP,
          streak: progress.streak,
          longest_streak: progress.longestStreak,
          achievements: progress.achievements as unknown as UserProgressUpdate['achievements'],
          badges: progress.badges as unknown as UserProgressUpdate['badges'],
        });

        if (insertError) {
          throw insertError;
        }
      }
    } catch (err) {
      console.error('Failed to sync progress:', err);

      // Queue for later sync
      await addToOfflineQueue({
        type: 'progress',
        action: 'update',
        data: {
          level: progress.level,
          current_xp: progress.currentXP,
          streak: progress.streak,
          longest_streak: progress.longestStreak,
          achievements: progress.achievements,
          badges: progress.badges,
        },
      });
    } finally {
      setIsSyncing(false);
    }
  }, [progress, addXP, updateStreak, unlockAchievement]);

  return {
    syncProgress,
    isSyncing,
  };
}

// ============================================================================
// COMBINED SYNC HOOK
// ============================================================================

interface UseSupabaseSyncReturn {
  syncAll: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
}

/**
 * Combined hook to sync all data with Supabase
 * Useful for pull-to-refresh or app resume scenarios
 */
export function useSupabaseSync(): UseSupabaseSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const { syncInventory } = useInventorySync();
  const { syncMealPlans } = useMealPlanSync();
  const { syncProgress } = useProgressSync();

  const syncAll = useCallback(async () => {
    setIsSyncing(true);

    try {
      // Sync all data in parallel
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 13); // Two weeks ahead

      await Promise.all([
        syncInventory(),
        syncMealPlans(startOfWeek, endOfWeek),
        syncProgress(),
      ]);

      setLastSyncedAt(new Date());
    } catch (err) {
      console.error('Failed to sync all data:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [syncInventory, syncMealPlans, syncProgress]);

  return {
    syncAll,
    isSyncing,
    lastSyncedAt,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to push a single inventory item to Supabase
 */
export function usePushInventoryItem() {
  return useCallback(async (item: InventoryItem) => {
    try {
      const authUser = await getCurrentUser();
      if (!authUser) {
        throw new Error('Not authenticated');
      }

      const itemRow = convertInventoryToRow(item, authUser.id);
      const { error } = await supabase.from('inventory_items').upsert(itemRow, { onConflict: 'id' });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Failed to push inventory item:', err);

      // Queue for offline sync
      const authUser = await getCurrentUser();
      if (authUser) {
        await addToOfflineQueue({
          type: 'inventory',
          action: 'insert',
          data: convertInventoryToRow(item, authUser.id),
        });
      }

      throw err;
    }
  }, []);
}

/**
 * Hook to push a single meal plan to Supabase
 */
export function usePushMealPlan() {
  return useCallback(async (plan: MealPlan) => {
    try {
      const authUser = await getCurrentUser();
      if (!authUser) {
        throw new Error('Not authenticated');
      }

      const planRow = convertMealPlanToRow(plan, authUser.id);
      const { error } = await supabase.from('meal_plans').upsert(planRow, { onConflict: 'id' });

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Failed to push meal plan:', err);

      // Queue for offline sync
      const authUser = await getCurrentUser();
      if (authUser) {
        await addToOfflineQueue({
          type: 'mealplan',
          action: 'insert',
          data: convertMealPlanToRow(plan, authUser.id),
        });
      }

      throw err;
    }
  }, []);
}

/**
 * Hook to delete an inventory item from Supabase
 */
export function useDeleteInventoryItem() {
  return useCallback(async (itemId: string) => {
    try {
      const authUser = await getCurrentUser();
      if (!authUser) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase.from('inventory_items').delete().eq('id', itemId);

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Failed to delete inventory item:', err);

      // Queue for offline sync
      await addToOfflineQueue({
        type: 'inventory',
        action: 'delete',
        data: { id: itemId },
      });

      throw err;
    }
  }, []);
}

/**
 * Hook to delete a meal plan from Supabase
 */
export function useDeleteMealPlan() {
  return useCallback(async (planId: string) => {
    try {
      const authUser = await getCurrentUser();
      if (!authUser) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase.from('meal_plans').delete().eq('id', planId);

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Failed to delete meal plan:', err);

      // Queue for offline sync
      await addToOfflineQueue({
        type: 'mealplan',
        action: 'delete',
        data: { id: planId },
      });

      throw err;
    }
  }, []);
}
