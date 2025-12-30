import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProgress, Achievement, Badge, Challenge } from '../types';

// XP required for each level (exponential curve)
const getXPForLevel = (level: number): number => {
  return Math.floor(1000 * Math.pow(1.2, level - 1));
};

interface ProgressState {
  progress: UserProgress;
  activeChallenges: Challenge[];
  isLoading: boolean;

  // Actions
  addXP: (amount: number) => void;
  updateStreak: (cooking: boolean) => void;
  unlockAchievement: (achievementId: string) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  addChallenge: (challenge: Challenge) => void;
  removeChallenge: (challengeId: string) => void;
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

      resetProgress: () => {
        set({
          progress: initialProgress,
          activeChallenges: [],
        });
      },
    }),
    {
      name: 'hearthstone-progress',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
