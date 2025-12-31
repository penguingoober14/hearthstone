import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDateAwareStorage } from '../lib/storage';
import { generateId } from '../lib/uuid';
import type { User, UserPreferences, MonthlyStats, WeeklyStats } from '../types';

interface UserState {
  user: User | null;
  partner: User | null;
  monthlyStats: MonthlyStats;
  weeklyStats: WeeklyStats;
  isLoading: boolean;
  isAuthenticated: boolean;
  onboardingComplete: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setPartner: (partner: User | null) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateMonthlyStats: (stats: Partial<MonthlyStats>) => void;
  updateWeeklyStats: (stats: Partial<WeeklyStats>) => void;
  completeOnboarding: (name: string, preferences: Partial<UserPreferences>) => void;
  logout: () => void;
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
        });
      },
    }),
    {
      name: 'hearthstone-user',
      storage: createDateAwareStorage(),
    }
  )
);
