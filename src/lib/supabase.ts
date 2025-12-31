// Supabase Client for Hearthstone
// Configured for React Native with AsyncStorage persistence

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, AuthChangeEvent, Session, User, SupabaseClient } from '@supabase/supabase-js';
import type { Database, ProfileInsert } from '../types/database';

// Environment variables for Supabase connection
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables.'
  );
}

// Create Supabase client with React Native configuration
// Using type assertion to properly type the client with our Database schema
export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Disable for React Native
    },
  }
);

// Auth helper types
export type AuthUser = User;
export type AuthSession = Session;
export type AuthChangeCallback = (event: AuthChangeEvent, session: Session | null) => void;

/**
 * Get the currently authenticated user
 * @returns The current user or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user:', error.message);
    return null;
  }

  return user;
}

/**
 * Sign up a new user with email and password
 * Creates a profile record after successful signup
 * @param email User's email address
 * @param password User's password
 * @param name User's display name
 * @returns The created user and session, or error
 */
export async function signUp(
  email: string,
  password: string,
  name: string
): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  try {
    // Create the auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name, // Store name in user metadata
        },
      },
    });

    if (signUpError) {
      return { user: null, session: null, error: signUpError };
    }

    // Create the profile record
    if (data.user) {
      const profileData: ProfileInsert = {
        id: data.user.id,
        name,
        avatar_url: null,
        partner_id: null,
        preferences: null,
      };
      // Use type assertion since supabase types can be strict
      const { error: profileError } = await (supabase as SupabaseClient)
        .from('profiles')
        .insert(profileData);

      if (profileError) {
        console.error('Error creating profile:', profileError.message);
        // Note: User is created but profile failed - may need cleanup
      }
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    return { user: null, session: null, error: error as Error };
  }
}

/**
 * Sign in an existing user with email and password
 * @param email User's email address
 * @param password User's password
 * @returns The user and session, or error
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    return { user: null, session: null, error: error as Error };
  }
}

/**
 * Sign out the current user
 * @returns Error if sign out failed
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Subscribe to auth state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: AuthChangeCallback
): { unsubscribe: () => void } {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);

  return {
    unsubscribe: () => subscription.unsubscribe(),
  };
}

/**
 * Get the current session
 * @returns The current session or null
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting session:', error.message);
    return null;
  }

  return session;
}

/**
 * Refresh the current session
 * @returns The refreshed session or null
 */
export async function refreshSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.refreshSession();

  if (error) {
    console.error('Error refreshing session:', error.message);
    return null;
  }

  return session;
}
