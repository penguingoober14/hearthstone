/**
 * Achievement Definitions
 * Each achievement has conditions that are checked when relevant actions occur
 */

import type { Achievement } from '../types';

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  target: number;
  category: 'cooking' | 'streak' | 'exploration' | 'social' | 'mastery';
}

// Achievement definitions that can be unlocked
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Cooking Achievements
  {
    id: 'first_meal',
    name: 'First Bite',
    description: 'Complete your first meal',
    emoji: '🍽️',
    tier: 'bronze',
    target: 1,
    category: 'cooking',
  },
  {
    id: 'home_cook',
    name: 'Home Cook',
    description: 'Complete 10 meals',
    emoji: '👨‍🍳',
    tier: 'silver',
    target: 10,
    category: 'cooking',
  },
  {
    id: 'seasoned_chef',
    name: 'Seasoned Chef',
    description: 'Complete 50 meals',
    emoji: '🔥',
    tier: 'gold',
    target: 50,
    category: 'cooking',
  },
  {
    id: 'master_chef',
    name: 'Master Chef',
    description: 'Complete 100 meals',
    emoji: '⭐',
    tier: 'platinum',
    target: 100,
    category: 'cooking',
  },

  // Streak Achievements
  {
    id: 'consistent_cook',
    name: 'Consistent Cook',
    description: 'Maintain a 3-day cooking streak',
    emoji: '🔥',
    tier: 'bronze',
    target: 3,
    category: 'streak',
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day cooking streak',
    emoji: '💪',
    tier: 'silver',
    target: 7,
    category: 'streak',
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 30-day cooking streak',
    emoji: '🏆',
    tier: 'gold',
    target: 30,
    category: 'streak',
  },

  // Exploration Achievements
  {
    id: 'cuisine_curious',
    name: 'Cuisine Curious',
    description: 'Try 3 different cuisines',
    emoji: '🌍',
    tier: 'bronze',
    target: 3,
    category: 'exploration',
  },
  {
    id: 'world_traveler',
    name: 'World Traveler',
    description: 'Try 8 different cuisines',
    emoji: '✈️',
    tier: 'silver',
    target: 8,
    category: 'exploration',
  },
  {
    id: 'culinary_explorer',
    name: 'Culinary Explorer',
    description: 'Try 15 different cuisines',
    emoji: '🧭',
    tier: 'gold',
    target: 15,
    category: 'exploration',
  },

  // Social Achievements
  {
    id: 'partner_up',
    name: 'Partner Up',
    description: 'Connect with a cooking partner',
    emoji: '💑',
    tier: 'bronze',
    target: 1,
    category: 'social',
  },
  {
    id: 'couple_cooking',
    name: 'Couple Cooking',
    description: 'Complete 10 meals with your partner',
    emoji: '❤️',
    tier: 'silver',
    target: 10,
    category: 'social',
  },
  {
    id: 'kitchen_duo',
    name: 'Kitchen Duo',
    description: 'Complete 50 meals with your partner',
    emoji: '👨‍❤️‍👨',
    tier: 'gold',
    target: 50,
    category: 'social',
  },

  // Mastery Achievements
  {
    id: 'five_star_meal',
    name: 'Five Star Meal',
    description: 'Rate a meal 5 stars',
    emoji: '⭐',
    tier: 'bronze',
    target: 1,
    category: 'mastery',
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Rate 10 meals 5 stars',
    emoji: '💯',
    tier: 'silver',
    target: 10,
    category: 'mastery',
  },
  {
    id: 'level_10',
    name: 'Rising Chef',
    description: 'Reach level 10',
    emoji: '📈',
    tier: 'silver',
    target: 10,
    category: 'mastery',
  },
  {
    id: 'level_25',
    name: 'Expert Chef',
    description: 'Reach level 25',
    emoji: '🎓',
    tier: 'gold',
    target: 25,
    category: 'mastery',
  },
];

// Helper to create an Achievement from a definition with initial progress
export function createAchievement(def: AchievementDefinition, progress = 0): Achievement {
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    emoji: def.emoji,
    tier: def.tier,
    progress,
    target: def.target,
    unlockedAt: progress >= def.target ? new Date() : null,
  };
}

// Initialize all achievements with zero progress
export function initializeAchievements(): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((def) => createAchievement(def, 0));
}

// Get achievement definition by ID
export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((def) => def.id === id);
}

// Get achievements by category
export function getAchievementsByCategory(category: AchievementDefinition['category']): AchievementDefinition[] {
  return ACHIEVEMENT_DEFINITIONS.filter((def) => def.category === category);
}
