import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDateAwareStorage } from '../lib/storage';
import { generateId } from '../lib/uuid';
import type { MealPlan, Recipe, MealRecommendation } from '../types';

interface CookingSession {
  planId: string;
  recipeId: string;
  currentStep: number;
  startedAt: string; // ISO string for serialization
}

interface MealPlanState {
  plans: MealPlan[];
  todayRecommendation: MealRecommendation | null;
  activeCookingSession: CookingSession | null;
  isLoading: boolean;
  error: string | null;

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
}

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      todayRecommendation: null,
      activeCookingSession: null,
      isLoading: false,
      error: null,

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
    }),
    {
      name: 'hearthstone-mealplan',
      storage: createDateAwareStorage(),
    }
  )
);
