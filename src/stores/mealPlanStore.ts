import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDateAwareStorage } from '../lib/storage';
import { generateId } from '../lib/uuid';
import { supabase } from '../lib/supabase';
import type { MealPlan, Recipe, MealRecommendation } from '../types';
import type { MealPlanRow, MealPlanInsert } from '../types/database';

interface CookingSession {
  planId: string;
  recipeId: string;
  currentStep: number;
  startedAt: string; // ISO string for serialization
}

// Queue for offline sync
interface SyncQueueItem {
  type: 'add' | 'update' | 'delete';
  planId: string;
  data?: Partial<MealPlanInsert>;
  timestamp: number;
}

interface MealPlanState {
  plans: MealPlan[];
  todayRecommendation: MealRecommendation | null;
  activeCookingSession: CookingSession | null;
  isLoading: boolean;
  error: string | null;
  syncQueue: SyncQueueItem[];
  lastSyncedAt: string | null;

  // Actions
  setPlans: (plans: MealPlan[]) => void;
  addPlan: (plan: Omit<MealPlan, 'id'>) => string; // Returns the new plan ID
  updatePlan: (id: string, updates: Partial<MealPlan>) => void;
  removePlan: (id: string) => void;
  markCompleted: (id: string, rating?: number, notes?: string) => void;
  setTodayRecommendation: (rec: MealRecommendation | null) => void;
  getPlansForDate: (date: Date) => MealPlan[];
  getPlansForWeek: (startDate: Date) => MealPlan[];
  // Cooking session actions
  startCookingSession: (planId: string, recipeId: string) => void;
  updateCookingProgress: (step: number) => void;
  endCookingSession: () => void;

  // Supabase sync actions
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: (userId: string) => Promise<void>;
}

// Helper to convert local MealPlan to Supabase row format
const planToRow = (plan: MealPlan, userId: string): MealPlanInsert => ({
  id: plan.id,
  user_id: userId,
  date: plan.date instanceof Date ? plan.date.toISOString() : plan.date,
  meal_type: plan.mealType,
  recipe_id: plan.recipe?.id ?? null,
  notes: plan.notes,
  completed: plan.completed,
  rating: plan.rating,
});

// Helper to convert Supabase row to local MealPlan
// Note: Recipe data must be fetched separately or joined
const rowToPlan = (row: MealPlanRow, recipe: Recipe | null = null): MealPlan => ({
  id: row.id,
  date: new Date(row.date),
  mealType: row.meal_type,
  recipe: recipe,
  notes: row.notes,
  completed: row.completed,
  rating: row.rating,
});

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      todayRecommendation: null,
      activeCookingSession: null,
      isLoading: false,
      error: null,
      syncQueue: [],
      lastSyncedAt: null,

      setPlans: (plans) => {
        set({ plans });
      },

      addPlan: (plan) => {
        const newPlan: MealPlan = {
          ...plan,
          id: generateId('plan'),
        };
        set((state) => ({ plans: [...state.plans, newPlan] }));
        return newPlan.id;
      },

      updatePlan: (id, updates) => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === id ? { ...plan, ...updates } : plan
          ),
        }));
      },

      removePlan: (id) => {
        set((state) => ({
          plans: state.plans.filter((plan) => plan.id !== id),
        }));
      },

      markCompleted: (id, rating, notes) => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === id
              ? {
                  ...plan,
                  completed: true,
                  rating: rating ?? null,
                  notes: notes ?? plan.notes,
                }
              : plan
          ),
        }));
      },

      setTodayRecommendation: (rec) => {
        set({ todayRecommendation: rec });
      },

      startCookingSession: (planId, recipeId) => {
        set({
          activeCookingSession: {
            planId,
            recipeId,
            currentStep: 0,
            startedAt: new Date().toISOString(),
          },
        });
      },

      updateCookingProgress: (step) => {
        set((state) => ({
          activeCookingSession: state.activeCookingSession
            ? { ...state.activeCookingSession, currentStep: step }
            : null,
        }));
      },

      endCookingSession: () => {
        set({ activeCookingSession: null });
      },

      getPlansForDate: (date) => {
        const dateStr = date.toDateString();
        return get().plans.filter(
          (plan) => new Date(plan.date).toDateString() === dateStr
        );
      },

      getPlansForWeek: (startDate) => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 7);

        return get().plans.filter((plan) => {
          const planDate = new Date(plan.date);
          return planDate >= start && planDate < end;
        });
      },

      syncToSupabase: async () => {
        const { plans, syncQueue } = get();

        // Get current user from auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('[mealPlanStore] No authenticated user, skipping sync');
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Process queued operations first (for offline sync)
          if (syncQueue.length > 0) {
            console.log(`[mealPlanStore] Processing ${syncQueue.length} queued operations`);
            const processedIds: string[] = [];

            for (const queueItem of syncQueue) {
              try {
                if (queueItem.type === 'delete') {
                  await supabase
                    .from('meal_plans')
                    .delete()
                    .eq('id', queueItem.planId);
                } else if (queueItem.type === 'add' && queueItem.data) {
                  await supabase
                    .from('meal_plans')
                    .upsert(queueItem.data);
                } else if (queueItem.type === 'update' && queueItem.data) {
                  await supabase
                    .from('meal_plans')
                    .update(queueItem.data)
                    .eq('id', queueItem.planId);
                }
                processedIds.push(queueItem.planId);
              } catch (error) {
                console.error('[mealPlanStore] Error processing queue item:', error);
              }
            }

            // Remove processed items from queue
            set((state) => ({
              syncQueue: state.syncQueue.filter(
                (item) => !processedIds.includes(item.planId)
              ),
            }));
          }

          // Delete all existing meal plans for this user and replace with current state
          const { error: deleteError } = await supabase
            .from('meal_plans')
            .delete()
            .eq('user_id', user.id);

          if (deleteError) {
            console.error('[mealPlanStore] Error clearing old plans:', deleteError.message);
            throw deleteError;
          }

          // Insert all current plans
          if (plans.length > 0) {
            const rows = plans.map((plan) => planToRow(plan, user.id));

            const { error: insertError } = await supabase
              .from('meal_plans')
              .insert(rows);

            if (insertError) {
              console.error('[mealPlanStore] Error inserting plans:', insertError.message);
              throw insertError;
            }
          }

          set({
            lastSyncedAt: new Date().toISOString(),
            syncQueue: [],
          });
          console.log(`[mealPlanStore] Successfully synced ${plans.length} plans to Supabase`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
          console.error('[mealPlanStore] Sync error:', errorMessage);

          // Queue plans for later sync (offline scenario)
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            set((state) => ({
              error: errorMessage,
              syncQueue: [
                ...state.syncQueue,
                ...plans.map((plan) => ({
                  type: 'add' as const,
                  planId: plan.id,
                  data: planToRow(plan, authUser.id),
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
          // Fetch meal plans with their associated recipes
          const { data: planData, error: planError } = await supabase
            .from('meal_plans')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: true });

          if (planError) {
            console.error('[mealPlanStore] Error loading plans from Supabase:', planError.message);
            set({ error: planError.message });
            return;
          }

          if (!planData || planData.length === 0) {
            console.log('[mealPlanStore] No meal plans found for user');
            set({ lastSyncedAt: new Date().toISOString() });
            return;
          }

          // Get unique recipe IDs to fetch
          const recipeIds = [...new Set(planData.filter((p) => p.recipe_id).map((p) => p.recipe_id!))];

          // Fetch recipes if there are any
          let recipesMap: Map<string, Recipe> = new Map();
          if (recipeIds.length > 0) {
            const { data: recipeData, error: recipeError } = await supabase
              .from('recipes')
              .select('*')
              .in('id', recipeIds);

            if (recipeError) {
              console.error('[mealPlanStore] Error loading recipes:', recipeError.message);
              // Continue without recipes rather than failing completely
            } else if (recipeData) {
              recipeData.forEach((row) => {
                const recipe: Recipe = {
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
                recipesMap.set(row.id, recipe);
              });
            }
          }

          // Convert rows to local MealPlan format
          const plans = planData.map((row) => {
            const recipe = row.recipe_id ? recipesMap.get(row.recipe_id) ?? null : null;
            return rowToPlan(row, recipe);
          });

          set({
            plans,
            lastSyncedAt: new Date().toISOString(),
          });
          console.log(`[mealPlanStore] Successfully loaded ${plans.length} plans from Supabase`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown load error';
          console.error('[mealPlanStore] Load error:', errorMessage);
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'hearthstone-mealplan',
      storage: createDateAwareStorage(),
    }
  )
);
