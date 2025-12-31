import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDateAwareStorage } from '../lib/storage';
import { generateId } from '../lib/uuid';
import type { UserProgress, Achievement, Badge, Challenge } from '../types';

// XP required for each level (exponential curve)
const getXPForLevel = (level: number): number => {
  return Math.floor(1000 * Math.pow(1.2, level - 1));
};

// Beginner challenge templates
const BEGINNER_CHALLENGES: Omit<Challenge, 'id' | 'expiresAt'>[] = [
  {
    title: 'Your First Meal',
    description: 'Complete your first recipe from start to finish',
    emoji: '🌟',
    type: 'special',
    progress: 0,
    target: 1,
    reward: { xp: 100 },
  },
  {
    title: 'Learn to Dice',
    description: 'Complete a recipe that requires dicing vegetables',
    emoji: '🔪',
    type: 'special',
    progress: 0,
    target: 1,
    reward: { xp: 75 },
  },
  {
    title: 'Breakfast Champion',
    description: 'Cook breakfast 3 times this week',
    emoji: '🍳',
    type: 'weekly',
    progress: 0,
    target: 3,
    reward: { xp: 150 },
  },
  {
    title: 'Kitchen Apprentice',
    description: 'Complete 5 easy recipes',
    emoji: '👨‍🍳',
    type: 'special',
    progress: 0,
    target: 5,
    reward: { xp: 200 },
  },
];

// Standard challenges for all users
const STANDARD_CHALLENGES: Omit<Challenge, 'id' | 'expiresAt'>[] = [
  {
    title: 'Daily Cook',
    description: 'Cook at least one meal today',
    emoji: '🔥',
    type: 'daily',
    progress: 0,
    target: 1,
    reward: { xp: 50 },
  },
  {
    title: 'Weekend Chef',
    description: 'Cook 3 meals this weekend',
    emoji: '🍽️',
    type: 'weekly',
    progress: 0,
    target: 3,
    reward: { xp: 100 },
  },
  {
    title: 'World Traveler',
    description: 'Try recipes from 3 different cuisines',
    emoji: '🌍',
    type: 'weekly',
    progress: 0,
    target: 3,
    reward: { xp: 125 },
  },
];

interface ProgressState {
  progress: UserProgress;
  activeChallenges: Challenge[];
  isLoading: boolean;
  challengesInitialized: boolean;

  // Actions
  addXP: (amount: number) => void;
  updateStreak: (cooking: boolean) => void;
  unlockAchievement: (achievementId: string) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  addChallenge: (challenge: Challenge) => void;
  removeChallenge: (challengeId: string) => void;
  initializeChallenges: (skillLevel: 'beginner' | 'intermediate' | 'advanced') => void;
  resetProgress: () => void;
}

const initialProgress: UserProgress = {
  level: 1,
  currentXP: 0,
  nextLevelXP: 1000,
  streak: 0,
  longestStreak: 0,
  achievements: [],
  badges: [],
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: initialProgress,
      activeChallenges: [],
      isLoading: false,
      challengesInitialized: false,

      addXP: (amount) => {
        set((state) => {
          let { level, currentXP, nextLevelXP } = state.progress;
          currentXP += amount;

          // Level up loop
          while (currentXP >= nextLevelXP) {
            currentXP -= nextLevelXP;
            level += 1;
            nextLevelXP = getXPForLevel(level);
          }

          return {
            progress: {
              ...state.progress,
              level,
              currentXP,
              nextLevelXP,
            },
          };
        });
      },

      updateStreak: (cooking) => {
        set((state) => {
          const newStreak = cooking ? state.progress.streak + 1 : 0;
          const longestStreak = Math.max(newStreak, state.progress.longestStreak);

          return {
            progress: {
              ...state.progress,
              streak: newStreak,
              longestStreak,
            },
          };
        });
      },

      unlockAchievement: (achievementId) => {
        set((state) => ({
          progress: {
            ...state.progress,
            achievements: state.progress.achievements.map((a) =>
              a.id === achievementId
                ? { ...a, unlockedAt: new Date(), progress: a.target }
                : a
            ),
          },
        }));
      },

      updateChallengeProgress: (challengeId, progressDelta) => {
        set((state) => ({
          activeChallenges: state.activeChallenges.map((c) =>
            c.id === challengeId
              ? { ...c, progress: Math.min(c.progress + progressDelta, c.target) }
              : c
          ),
        }));
      },

      addChallenge: (challenge) => {
        set((state) => ({
          activeChallenges: [...state.activeChallenges, challenge],
        }));
      },

      removeChallenge: (challengeId) => {
        set((state) => ({
          activeChallenges: state.activeChallenges.filter(
            (c) => c.id !== challengeId
          ),
        }));
      },

      initializeChallenges: (skillLevel) => {
        const state = get();
        // Only initialize once
        if (state.challengesInitialized) return;

        // Calculate expiry dates
        const dailyExpiry = new Date();
        dailyExpiry.setHours(23, 59, 59, 999);

        const weeklyExpiry = new Date();
        weeklyExpiry.setDate(weeklyExpiry.getDate() + (7 - weeklyExpiry.getDay()));
        weeklyExpiry.setHours(23, 59, 59, 999);

        const monthlyExpiry = new Date();
        monthlyExpiry.setMonth(monthlyExpiry.getMonth() + 1);
        monthlyExpiry.setDate(0);
        monthlyExpiry.setHours(23, 59, 59, 999);

        // Convert template to full challenge with ID and expiry
        const createChallenge = (
          template: Omit<Challenge, 'id' | 'expiresAt'>
        ): Challenge => ({
          ...template,
          id: generateId('challenge'),
          expiresAt:
            template.type === 'daily'
              ? dailyExpiry
              : template.type === 'weekly'
              ? weeklyExpiry
              : monthlyExpiry,
        });

        // Add beginner challenges for beginners
        const challenges: Challenge[] = [];

        if (skillLevel === 'beginner') {
          BEGINNER_CHALLENGES.forEach((template) => {
            challenges.push(createChallenge(template));
          });
        }

        // Add standard challenges for all users
        STANDARD_CHALLENGES.forEach((template) => {
          challenges.push(createChallenge(template));
        });

        set({
          activeChallenges: challenges,
          challengesInitialized: true,
        });
      },

      resetProgress: () => {
        set({
          progress: initialProgress,
          activeChallenges: [],
          challengesInitialized: false,
        });
      },
    }),
    {
      name: 'hearthstone-progress',
      storage: createDateAwareStorage(),
    }
  )
);
