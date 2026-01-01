import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDateAwareStorage } from '../lib/storage';
import { generateId } from '../lib/uuid';
import { supabase } from '../lib/supabase';
import { ACHIEVEMENT_DEFINITIONS, initializeAchievements, getAchievementDefinition } from '../data/achievements';
import type { UserProgress, Achievement, Badge, Challenge } from '../types';
import type { UserProgressRow, UserProgressInsert, UserProgressUpdate } from '../types/database';

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

// Queue for offline sync
interface SyncQueueItem {
  type: 'progress';
  data: UserProgressUpdate;
  timestamp: number;
}

// Stats tracking for achievement conditions
interface CookingStats {
  totalMealsCooked: number;
  cuisinesExplored: string[];
  fiveStarMeals: number;
  coupleMeals: number;
}

interface ProgressState {
  progress: UserProgress;
  activeChallenges: Challenge[];
  cookingStats: CookingStats;
  isLoading: boolean;
  challengesInitialized: boolean;
  achievementsInitialized: boolean;
  syncQueue: SyncQueueItem[];
  lastSyncedAt: string | null;
  pendingUnlocks: Achievement[]; // Achievements to show unlock animation for

  // Actions
  addXP: (amount: number) => void;
  updateStreak: (cooking: boolean) => void;
  unlockAchievement: (achievementId: string) => void;
  updateChallengeProgress: (challengeId: string, progress: number) => void;
  addChallenge: (challenge: Challenge) => void;
  removeChallenge: (challengeId: string) => void;
  initializeChallenges: (skillLevel: 'beginner' | 'intermediate' | 'advanced') => void;
  initializeAchievements: () => void;
  resetProgress: () => void;

  // Meal completion tracking
  recordMealCompletion: (cuisine: string, rating: number | null, isCoupleMeal: boolean) => Achievement[];
  updateAchievementProgress: (achievementId: string, progressDelta: number) => Achievement | null;
  clearPendingUnlocks: () => void;

  // Partner tracking
  recordPartnerConnected: () => Achievement | null;

  // Supabase sync actions
  syncToSupabase: () => Promise<void>;
  loadFromSupabase: (userId: string) => Promise<void>;
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

// Helper to convert local UserProgress to Supabase row format
const progressToRow = (progress: UserProgress, userId: string): UserProgressInsert => ({
  user_id: userId,
  level: progress.level,
  current_xp: progress.currentXP,
  streak: progress.streak,
  longest_streak: progress.longestStreak,
  achievements: progress.achievements as unknown as UserProgressInsert['achievements'],
  badges: progress.badges as unknown as UserProgressInsert['badges'],
});

// Helper to convert Supabase row to local UserProgress
const rowToProgress = (row: UserProgressRow): UserProgress => ({
  level: row.level,
  currentXP: row.current_xp,
  nextLevelXP: getXPForLevel(row.level),
  streak: row.streak,
  longestStreak: row.longest_streak,
  achievements: (row.achievements as unknown as Achievement[]) || [],
  badges: (row.badges as unknown as Badge[]) || [],
});

// Helper to merge remote and local progress (takes the best values)
const mergeProgress = (local: UserProgress, remote: UserProgress): UserProgress => {
  // For XP and level: take whichever is higher
  const useRemoteLevel = remote.level > local.level ||
    (remote.level === local.level && remote.currentXP > local.currentXP);

  const level = useRemoteLevel ? remote.level : local.level;
  const currentXP = useRemoteLevel ? remote.currentXP : local.currentXP;

  // For streaks: take whichever is longer
  const streak = Math.max(local.streak, remote.streak);
  const longestStreak = Math.max(local.longestStreak, remote.longestStreak);

  // For achievements: merge unique achievements, take the one with higher progress or that's unlocked
  const achievementsMap = new Map<string, Achievement>();

  [...local.achievements, ...remote.achievements].forEach((achievement) => {
    const existing = achievementsMap.get(achievement.id);
    if (!existing) {
      achievementsMap.set(achievement.id, achievement);
    } else {
      // Prefer unlocked over locked, or higher progress
      const existingUnlocked = existing.unlockedAt !== null;
      const newUnlocked = achievement.unlockedAt !== null;

      if (newUnlocked && !existingUnlocked) {
        achievementsMap.set(achievement.id, achievement);
      } else if (!newUnlocked && !existingUnlocked && achievement.progress > existing.progress) {
        achievementsMap.set(achievement.id, achievement);
      }
    }
  });

  // For badges: merge unique badges by id
  const badgesMap = new Map<string, Badge>();
  [...local.badges, ...remote.badges].forEach((badge) => {
    if (!badgesMap.has(badge.id)) {
      badgesMap.set(badge.id, badge);
    }
  });

  return {
    level,
    currentXP,
    nextLevelXP: getXPForLevel(level),
    streak,
    longestStreak,
    achievements: Array.from(achievementsMap.values()),
    badges: Array.from(badgesMap.values()),
  };
};

const initialCookingStats: CookingStats = {
  totalMealsCooked: 0,
  cuisinesExplored: [],
  fiveStarMeals: 0,
  coupleMeals: 0,
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: initialProgress,
      activeChallenges: [],
      cookingStats: initialCookingStats,
      isLoading: false,
      challengesInitialized: false,
      achievementsInitialized: false,
      syncQueue: [],
      lastSyncedAt: null,
      pendingUnlocks: [],

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

      initializeAchievements: () => {
        const state = get();
        // Only initialize once or if empty
        if (state.achievementsInitialized && state.progress.achievements.length > 0) return;

        const achievements = initializeAchievements();
        set((s) => ({
          progress: {
            ...s.progress,
            achievements,
          },
          achievementsInitialized: true,
        }));
      },

      updateAchievementProgress: (achievementId, progressDelta) => {
        const state = get();
        const achievement = state.progress.achievements.find((a) => a.id === achievementId);

        if (!achievement || achievement.unlockedAt) {
          return null; // Already unlocked or doesn't exist
        }

        const newProgress = Math.min(achievement.progress + progressDelta, achievement.target);
        const justUnlocked = newProgress >= achievement.target;

        const updatedAchievement: Achievement = {
          ...achievement,
          progress: newProgress,
          unlockedAt: justUnlocked ? new Date() : null,
        };

        set((s) => ({
          progress: {
            ...s.progress,
            achievements: s.progress.achievements.map((a) =>
              a.id === achievementId ? updatedAchievement : a
            ),
          },
          pendingUnlocks: justUnlocked
            ? [...s.pendingUnlocks, updatedAchievement]
            : s.pendingUnlocks,
        }));

        return justUnlocked ? updatedAchievement : null;
      },

      clearPendingUnlocks: () => {
        set({ pendingUnlocks: [] });
      },

      recordMealCompletion: (cuisine, rating, isCoupleMeal) => {
        const state = get();
        const unlockedAchievements: Achievement[] = [];

        // Update cooking stats
        const newStats = { ...state.cookingStats };
        newStats.totalMealsCooked += 1;

        if (!newStats.cuisinesExplored.includes(cuisine)) {
          newStats.cuisinesExplored = [...newStats.cuisinesExplored, cuisine];
        }

        if (rating === 5) {
          newStats.fiveStarMeals += 1;
        }

        if (isCoupleMeal) {
          newStats.coupleMeals += 1;
        }

        set({ cookingStats: newStats });

        // Check cooking achievements
        const cookingAchievements = ['first_meal', 'home_cook', 'seasoned_chef', 'master_chef'];
        for (const id of cookingAchievements) {
          const unlocked = get().updateAchievementProgress(id, 1);
          if (unlocked) unlockedAchievements.push(unlocked);
        }

        // Check exploration achievements
        const explorationAchievements = ['cuisine_curious', 'world_traveler', 'culinary_explorer'];
        const cuisineCount = newStats.cuisinesExplored.length;
        for (const id of explorationAchievements) {
          const achievement = state.progress.achievements.find((a) => a.id === id);
          if (achievement && !achievement.unlockedAt && cuisineCount >= achievement.target) {
            const unlocked = get().updateAchievementProgress(id, cuisineCount - achievement.progress);
            if (unlocked) unlockedAchievements.push(unlocked);
          }
        }

        // Check 5-star achievements
        if (rating === 5) {
          let unlocked = get().updateAchievementProgress('five_star_meal', 1);
          if (unlocked) unlockedAchievements.push(unlocked);
          unlocked = get().updateAchievementProgress('perfectionist', 1);
          if (unlocked) unlockedAchievements.push(unlocked);
        }

        // Check couple achievements
        if (isCoupleMeal) {
          let unlocked = get().updateAchievementProgress('couple_cooking', 1);
          if (unlocked) unlockedAchievements.push(unlocked);
          unlocked = get().updateAchievementProgress('kitchen_duo', 1);
          if (unlocked) unlockedAchievements.push(unlocked);
        }

        // Check streak achievements
        const streak = get().progress.streak;
        const streakAchievements = ['consistent_cook', 'week_warrior', 'streak_master'];
        for (const id of streakAchievements) {
          const achievement = state.progress.achievements.find((a) => a.id === id);
          if (achievement && !achievement.unlockedAt && streak >= achievement.target) {
            const unlocked = get().updateAchievementProgress(id, streak - achievement.progress);
            if (unlocked) unlockedAchievements.push(unlocked);
          }
        }

        // Check level achievements
        const level = get().progress.level;
        if (level >= 10) {
          const unlocked = get().updateAchievementProgress('level_10', level);
          if (unlocked) unlockedAchievements.push(unlocked);
        }
        if (level >= 25) {
          const unlocked = get().updateAchievementProgress('level_25', level);
          if (unlocked) unlockedAchievements.push(unlocked);
        }

        return unlockedAchievements;
      },

      recordPartnerConnected: () => {
        return get().updateAchievementProgress('partner_up', 1);
      },

      resetProgress: () => {
        set({
          progress: initialProgress,
          activeChallenges: [],
          cookingStats: initialCookingStats,
          challengesInitialized: false,
          achievementsInitialized: false,
          syncQueue: [],
          lastSyncedAt: null,
          pendingUnlocks: [],
        });
      },

      syncToSupabase: async () => {
        const { progress, syncQueue } = get();

        // Get current user from auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('[progressStore] No authenticated user, skipping sync');
          return;
        }

        set({ isLoading: true });

        try {
          // Process queued operations first (for offline sync)
          if (syncQueue.length > 0) {
            console.log(`[progressStore] Processing ${syncQueue.length} queued operations`);
            for (const queueItem of syncQueue) {
              try {
                await supabase
                  .from('user_progress')
                  .update(queueItem.data)
                  .eq('user_id', user.id);
              } catch (error) {
                console.error('[progressStore] Error processing queue item:', error);
              }
            }
          }

          // Upsert current progress
          const progressData = progressToRow(progress, user.id);

          const { error } = await supabase
            .from('user_progress')
            .upsert(progressData);

          if (error) {
            console.error('[progressStore] Error syncing to Supabase:', error.message);
            throw error;
          }

          set({
            lastSyncedAt: new Date().toISOString(),
            syncQueue: [],
          });
          console.log('[progressStore] Successfully synced progress to Supabase');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
          console.error('[progressStore] Sync error:', errorMessage);

          // Queue progress for later sync (offline scenario)
          set((state) => ({
            syncQueue: [
              ...state.syncQueue,
              {
                type: 'progress',
                data: {
                  level: progress.level,
                  current_xp: progress.currentXP,
                  streak: progress.streak,
                  longest_streak: progress.longestStreak,
                  achievements: progress.achievements as unknown as UserProgressUpdate['achievements'],
                  badges: progress.badges as unknown as UserProgressUpdate['badges'],
                },
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
          const { data, error } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId)
            .single();

          if (error) {
            // PGRST116 means no rows found - this is okay for new users
            if (error.code === 'PGRST116') {
              console.log('[progressStore] No progress found for user, using defaults');
              set({ lastSyncedAt: new Date().toISOString() });
              return;
            }
            console.error('[progressStore] Error loading from Supabase:', error.message);
            return;
          }

          if (!data) {
            console.log('[progressStore] No progress found for user');
            set({ lastSyncedAt: new Date().toISOString() });
            return;
          }

          const remoteProgress = rowToProgress(data);
          const localProgress = get().progress;

          // Merge local and remote progress, taking the best values
          const mergedProgress = mergeProgress(localProgress, remoteProgress);

          set({
            progress: mergedProgress,
            lastSyncedAt: new Date().toISOString(),
          });
          console.log('[progressStore] Successfully loaded and merged progress from Supabase');
        } catch (error) {
          console.error('[progressStore] Load error:', error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'hearthstone-progress',
      storage: createDateAwareStorage(),
    }
  )
);
