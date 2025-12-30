import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { MealPlan, Recipe, MealRecommendation } from '../types';

interface MealPlanState {
  plans: MealPlan[];
  todayRecommendation: MealRecommendation | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setPlans: (plans: MealPlan[]) => void;
  addPlan: (plan: Omit<MealPlan, 'id'>) => void;
  updatePlan: (id: string, updates: Partial<MealPlan>) => void;
  removePlan: (id: string) => void;
  markCompleted: (id: string, rating?: number) => void;
  setTodayRecommendation: (rec: MealRecommendation | null) => void;
  getPlansForDate: (date: Date) => MealPlan[];
  getPlansForWeek: (startDate: Date) => MealPlan[];
}

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      todayRecommendation: null,
      isLoading: false,
      error: null,

      setPlans: (plans) => {
        set({ plans });
      },

      addPlan: (plan) => {
        const newPlan: MealPlan = {
          ...plan,
          id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };
        set((state) => ({ plans: [...state.plans, newPlan] }));
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

      markCompleted: (id, rating) => {
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === id
              ? { ...plan, completed: true, rating: rating ?? null }
              : plan
          ),
        }));
      },

      setTodayRecommendation: (rec) => {
        set({ todayRecommendation: rec });
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
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
