import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDateAwareStorage } from '../lib/storage';
import { generateId } from '../lib/uuid';
import { supabase } from '../lib/supabase';
import type { User, UserPreferences, MonthlyStats, WeeklyStats } from '../types';
import type { ProfileRow, ProfileUpdate } from '../types/database';

// Queue for offline sync
interface SyncQueueItem {
  type: 'profile';
  data: ProfileUpdate;
  timestamp: number;
}

interface UserState {
  user: User | null;
  partner: User | null;
  monthlyStats: MonthlyStats;
  weeklyStats: WeeklyStats;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  syncQueue: SyncQueueItem[];
  lastSyncedAt: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setPartner: (partner: User | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateMonthlyStats: (stats: Partial<MonthlyStats>) => void;
  updateWeeklyStats: (stats: Partial<WeeklyStats>) => void;
  completeOnboarding: (name: string, preferences: Partial<UserPreferences>) => void;
  logout: () => void;

  // Meal completion stats tracking
  recordMealCooked: (cuisine: string, rating: number | null, isCoupleMeal: boolean, moneySaved?: number, itemsSaved?: number) => void;

  // Supabase sync actions
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: (userId: string) => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  dietaryRestrictions: [],
  dislikedIngredients: [],
  favoriteCuisines: [],
  cookingSkillLevel: 'intermediate',
  weeknightMaxTime: 45,
  weekendMaxTime: 90,
  chefMode: false,
};

const defaultMonthlyStats: MonthlyStats = {
  mealsCooked: 0,
  moneySaved: 0,
  itemsSavedFromExpiry: 0,
  cuisinesExplored: [],
  couplesMeals: 0,
  totalMeals: 0,
  averageRating: 0,
};

const defaultWeeklyStats: WeeklyStats = {
  hoursSaved: 0,
  prepCompleted: false,
  mealsPlanned: 0,
  mealsCooked: 0,
};

// Helper to convert local User to ProfileUpdate for Supabase
const userToProfileUpdate = (user: User): ProfileUpdate => ({
  name: user.name,
  avatar_url: user.avatarUrl,
  partner_id: user.partnerId,
  preferences: user.preferences as unknown as ProfileUpdate['preferences'],
});

// Helper to convert ProfileRow to local User
const profileRowToUser = (row: ProfileRow): User => ({
  id: row.id,
  name: row.name,
  email: '', // Email is stored in auth, not profile
  avatarUrl: row.avatar_url,
  preferences: row.preferences
    ? (row.preferences as unknown as UserPreferences)
    : defaultPreferences,
  partnerId: row.partner_id,
});

// Helper to merge remote and local preferences
const mergePreferences = (
  local: UserPreferences,
  remote: UserPreferences | null
): UserPreferences => {
  if (!remote) return local;

  return {
    // Arrays: merge unique values
    dietaryRestrictions: [...new Set([...local.dietaryRestrictions, ...remote.dietaryRestrictions])],
    dislikedIngredients: [...new Set([...local.dislikedIngredients, ...remote.dislikedIngredients])],
    favoriteCuisines: [...new Set([...local.favoriteCuisines, ...remote.favoriteCuisines])],
    // Scalars: prefer remote (most recent sync wins)
    cookingSkillLevel: remote.cookingSkillLevel || local.cookingSkillLevel,
    weeknightMaxTime: remote.weeknightMaxTime ?? local.weeknightMaxTime,
    weekendMaxTime: remote.weekendMaxTime ?? local.weekendMaxTime,
    chefMode: remote.chefMode ?? local.chefMode,
  };
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      partner: null,
      monthlyStats: defaultMonthlyStats,
      weeklyStats: defaultWeeklyStats,
      isLoading: false,
      isAuthenticated: false,
      onboardingComplete: false,
      syncQueue: [],
      lastSyncedAt: null,

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setPartner: (partner) => {
        set({ partner });
      },

      updatePreferences: (preferences) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({
          user: {
            ...currentUser,
            preferences: {
              ...currentUser.preferences,
              ...preferences,
            },
          },
        });
      },

      updateMonthlyStats: (stats) => {
        set((state) => ({
          monthlyStats: {
            ...state.monthlyStats,
            ...stats,
          },
        }));
      },

      updateWeeklyStats: (stats) => {
        set((state) => ({
          weeklyStats: {
            ...state.weeklyStats,
            ...stats,
          },
        }));
      },

      completeOnboarding: (name, preferences) => {
        const newUser: User = {
          id: generateId('user'),
          name,
          email: '',
          avatarUrl: null,
          preferences: {
            ...defaultPreferences,
            ...preferences,
          },
          partnerId: null,
        };

        set({
          user: newUser,
          isAuthenticated: true,
          onboardingComplete: true,
        });
      },

      logout: () => {
        set({
          user: null,
          partner: null,
          isAuthenticated: false,
          onboardingComplete: false,
          monthlyStats: defaultMonthlyStats,
          weeklyStats: defaultWeeklyStats,
          syncQueue: [],
          lastSyncedAt: null,
        });
      },

      recordMealCooked: (cuisine, rating, isCoupleMeal, moneySaved = 0, itemsSaved = 0) => {
        set((state) => {
          // Update monthly stats
          const newMonthlyStats = { ...state.monthlyStats };
          newMonthlyStats.mealsCooked += 1;
          newMonthlyStats.totalMeals += 1;
          newMonthlyStats.moneySaved += moneySaved;
          newMonthlyStats.itemsSavedFromExpiry += itemsSaved;

          // Track cuisines explored
          if (!newMonthlyStats.cuisinesExplored.includes(cuisine)) {
            newMonthlyStats.cuisinesExplored = [...newMonthlyStats.cuisinesExplored, cuisine];
          }

          // Track couple meals
          if (isCoupleMeal) {
            newMonthlyStats.couplesMeals += 1;
          }

          // Update average rating
          if (rating !== null) {
            const previousTotal = newMonthlyStats.averageRating * (newMonthlyStats.totalMeals - 1);
            newMonthlyStats.averageRating = (previousTotal + rating) / newMonthlyStats.totalMeals;
          }

          // Update weekly stats
          const newWeeklyStats = { ...state.weeklyStats };
          newWeeklyStats.mealsCooked += 1;

          return {
            monthlyStats: newMonthlyStats,
            weeklyStats: newWeeklyStats,
          };
        });
      },

      syncToSupabase: async () => {
        const { user, syncQueue } = get();
        if (!user) {
          console.log('[userStore] No user to sync');
          return;
        }

        set({ isLoading: true });

        try {
          // First, process any queued sync items (use type assertion for Supabase compatibility)
          if (syncQueue.length > 0) {
            console.log(`[userStore] Processing ${syncQueue.length} queued sync items`);
            for (const item of syncQueue) {
              const { error } = await (supabase as any)
                .from('profiles')
                .update(item.data)
                .eq('id', user.id);

              if (error) {
                console.error('[userStore] Error syncing queued item:', error.message);
                // Keep failed items in queue for later retry
                continue;
              }
            }
          }

          // Now sync current state (use type assertion for Supabase compatibility)
          const profileData = userToProfileUpdate(user);

          const { error } = await (supabase as any)
            .from('profiles')
            .upsert({
              id: user.id,
              ...profileData,
            });

          if (error) {
            console.error('[userStore] Error syncing to Supabase:', error.message);
            // Queue the update for later
            set((state) => ({
              syncQueue: [
                ...state.syncQueue,
                {
                  type: 'profile',
                  data: profileData,
                  timestamp: Date.now(),
                },
              ],
            }));
            return;
          }

          // Success - clear queue and update sync time
          set({
            syncQueue: [],
            lastSyncedAt: new Date().toISOString(),
          });
          console.log('[userStore] Successfully synced to Supabase');
        } catch (error) {
          console.error('[userStore] Sync error:', error);
          // Queue for later sync (offline scenario)
          const profileData = userToProfileUpdate(user);
          set((state) => ({
            syncQueue: [
              ...state.syncQueue,
              {
                type: 'profile',
                data: profileData,
                timestamp: Date.now(),
              },
            ],
          }));
        } finally {
          set({ isLoading: false });
        }
      },

      loadFromSupabase: async (userId: string) => {
        set({ isLoading: true });

        try {
          // Use type assertion for Supabase compatibility
          const { data: dataRaw, error } = await (supabase as any)
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          const data = dataRaw as ProfileRow | null;

          if (error) {
            console.error('[userStore] Error loading from Supabase:', error.message);
            return;
          }

          if (!data) {
            console.log('[userStore] No profile found for user:', userId);
            return;
          }

          const remoteUser = profileRowToUser(data);
          const localUser = get().user;

          // Merge preferences if we have both local and remote
          if (localUser) {
            const remotePrefs = data.preferences as unknown as UserPreferences | null;
            const mergedPreferences = mergePreferences(localUser.preferences, remotePrefs);

            set({
              user: {
                ...remoteUser,
                email: localUser.email, // Preserve local email
                preferences: mergedPreferences,
              },
              isAuthenticated: true,
              lastSyncedAt: new Date().toISOString(),
            });
          } else {
            set({
              user: remoteUser,
              isAuthenticated: true,
              lastSyncedAt: new Date().toISOString(),
            });
          }

          // Load partner if exists
          if (data.partner_id) {
            const { data: partnerDataRaw, error: partnerError } = await (supabase as any)
              .from('profiles')
              .select('*')
              .eq('id', data.partner_id)
              .single();

            const partnerData = partnerDataRaw as ProfileRow | null;

            if (!partnerError && partnerData) {
              set({ partner: profileRowToUser(partnerData) });
            }
          }

          console.log('[userStore] Successfully loaded from Supabase');
        } catch (error) {
          console.error('[userStore] Load error:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'hearthstone-user',
      storage: createDateAwareStorage(),
    }
  )
);
