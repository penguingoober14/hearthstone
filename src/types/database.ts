// Supabase Database Types for Hearthstone
// These types map to the Supabase database schema

import type { RecipeIngredient, RecipeStep, Achievement, Badge, UserPreferences } from './index';

// JSON type for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Database row types (snake_case as stored in Supabase)
export interface ProfileRow {
  id: string;
  name: string;
  avatar_url: string | null;
  partner_id: string | null;
  preferences: Json | null;
  created_at: string;
}

export interface RecipeRow {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  ingredients: Json;
  steps: Json;
  tags: string[];
  estimated_cost: number;
  created_at: string;
}

export interface InventoryItemRow {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  quantity: number;
  unit: 'count' | 'g' | 'kg' | 'ml' | 'l' | 'oz' | 'lb';
  location: 'fridge' | 'freezer' | 'pantry';
  expiry_date: string | null;
  category: 'protein' | 'dairy' | 'produce' | 'grains' | 'canned' | 'condiments' | 'frozen' | 'snacks' | 'beverages' | 'other';
  created_at: string;
}

export interface MealPlanRow {
  id: string;
  user_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_id: string | null;
  notes: string;
  completed: boolean;
  rating: number | null;
  created_at: string;
}

export interface UserProgressRow {
  user_id: string;
  level: number;
  current_xp: number;
  streak: number;
  longest_streak: number;
  achievements: Json;
  badges: Json;
  updated_at: string;
}

// Insert types (for creating new rows)
export type ProfileInsert = Omit<ProfileRow, 'created_at'> & { created_at?: string };
export type RecipeInsert = Omit<RecipeRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type InventoryItemInsert = Omit<InventoryItemRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type MealPlanInsert = Omit<MealPlanRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
export type UserProgressInsert = Omit<UserProgressRow, 'updated_at'> & { updated_at?: string };

// Update types (all fields optional except id)
export type ProfileUpdate = Partial<Omit<ProfileRow, 'id' | 'created_at'>>;
export type RecipeUpdate = Partial<Omit<RecipeRow, 'id' | 'created_at'>>;
export type InventoryItemUpdate = Partial<Omit<InventoryItemRow, 'id' | 'user_id' | 'created_at'>>;
export type MealPlanUpdate = Partial<Omit<MealPlanRow, 'id' | 'user_id' | 'created_at'>>;
export type UserProgressUpdate = Partial<Omit<UserProgressRow, 'user_id'>>;

// Supabase Database type definition
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [
          {
            foreignKeyName: 'profiles_partner_id_fkey';
            columns: ['partner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      recipes: {
        Row: RecipeRow;
        Insert: RecipeInsert;
        Update: RecipeUpdate;
        Relationships: [];
      };
      inventory_items: {
        Row: InventoryItemRow;
        Insert: InventoryItemInsert;
        Update: InventoryItemUpdate;
        Relationships: [
          {
            foreignKeyName: 'inventory_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      meal_plans: {
        Row: MealPlanRow;
        Insert: MealPlanInsert;
        Update: MealPlanUpdate;
        Relationships: [
          {
            foreignKeyName: 'meal_plans_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'meal_plans_recipe_id_fkey';
            columns: ['recipe_id'];
            isOneToOne: false;
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
          }
        ];
      };
      user_progress: {
        Row: UserProgressRow;
        Insert: UserProgressInsert;
        Update: UserProgressUpdate;
        Relationships: [
          {
            foreignKeyName: 'user_progress_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      difficulty_level: 'easy' | 'medium' | 'hard';
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      storage_location: 'fridge' | 'freezer' | 'pantry';
      food_category: 'protein' | 'dairy' | 'produce' | 'grains' | 'canned' | 'condiments' | 'frozen' | 'snacks' | 'beverages' | 'other';
      unit_type: 'count' | 'g' | 'kg' | 'ml' | 'l' | 'oz' | 'lb';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper type to get table names
export type TableName = keyof Database['public']['Tables'];

// Helper types for easier access
export type Tables<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Typed versions for application use (with proper domain types instead of Json)
export interface TypedProfile extends Omit<ProfileRow, 'preferences'> {
  preferences: UserPreferences | null;
}

export interface TypedRecipe extends Omit<RecipeRow, 'ingredients' | 'steps'> {
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

export interface TypedUserProgress extends Omit<UserProgressRow, 'achievements' | 'badges'> {
  achievements: Achievement[];
  badges: Badge[];
}
