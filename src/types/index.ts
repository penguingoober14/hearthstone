// Core domain types for Hearthstone

// Inventory Types
export interface InventoryItem {
  id: string;
  name: string;
  emoji: string;
  quantity: number;
  unit: 'count' | 'g' | 'kg' | 'ml' | 'l' | 'oz' | 'lb';
  location: 'fridge' | 'freezer' | 'pantry';
  expiryDate: Date | null;
  addedDate: Date;
  category: FoodCategory;
}

export type FoodCategory =
  | 'protein'
  | 'dairy'
  | 'produce'
  | 'grains'
  | 'canned'
  | 'condiments'
  | 'frozen'
  | 'snacks'
  | 'beverages'
  | 'other';

// Recipe Types
export interface Recipe {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  tags: string[];
  estimatedCost: number;
}

export interface RecipeIngredient {
  name: string;
  amount: number;
  unit: string;
  optional: boolean;
}

export interface RecipeStep {
  order: number;
  instruction: string;
  duration: number | null; // minutes
  tip: string | null;
}

// Meal Plan Types
export interface MealPlan {
  id: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe: Recipe | null;
  notes: string;
  completed: boolean;
  rating: number | null;
}

// Recommendation Types
export interface MealRecommendation {
  recipe: Recipe;
  score: number;
  reasoning: string;
  expiringIngredients: InventoryItem[];
  missingIngredients: string[];
  estimatedSavings: number;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  preferences: UserPreferences;
  partnerId: string | null;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  dislikedIngredients: string[];
  favoriteCuisines: string[];
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  weeknightMaxTime: number; // minutes
  weekendMaxTime: number; // minutes
}

// Gamification Types
export interface UserProgress {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  streak: number;
  longestStreak: number;
  achievements: Achievement[];
  badges: Badge[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt: Date | null;
  progress: number;
  target: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: 'daily' | 'weekly' | 'special';
  progress: number;
  target: number;
  reward: ChallengeReward;
  expiresAt: Date;
}

export interface ChallengeReward {
  xp: number;
  badge?: Badge;
  recipeUnlock?: string;
}

// Prep Session Types
export interface PrepSession {
  id: string;
  scheduledDate: Date;
  tasks: PrepTask[];
  totalTime: number; // minutes
  completed: boolean;
}

export interface PrepTask {
  id: string;
  description: string;
  duration: number; // minutes
  usedIn: string[]; // day names
  completed: boolean;
  order: number;
}

// Analytics Types
export interface MonthlyStats {
  mealsCooked: number;
  moneySaved: number;
  itemsSavedFromExpiry: number;
  cuisinesExplored: string[];
  couplesMeals: number;
  totalMeals: number;
  averageRating: number;
}

export interface WeeklyStats {
  hoursSaved: number;
  prepCompleted: boolean;
  mealsPlanned: number;
  mealsCooked: number;
}
