// Authentication Context for Hearthstone
// Manages auth state and provides auth methods throughout the app

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  supabase,
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  getSession,
  onAuthStateChange,
  AuthUser,
  AuthSession,
} from '../lib/supabase';
import { useUserStore } from '../stores/userStore';
import type { User, UserPreferences } from '../types';

// Auth state interface
interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  isAuthenticated: boolean;
}

// Auth context value interface
interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

// Create context with undefined default
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider Component
 * Wraps the app and provides authentication state and methods
 */
export function AuthProvider({ children }: AuthProviderProps) {
  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // User store actions for syncing local state
  const { setUser: setLocalUser, logout: clearLocalUser } = useUserStore();

  /**
   * Sync auth user to local user store
   * Maps Supabase user to app User type
   */
  const syncUserToStore = useCallback(
    async (authUser: AuthUser | null) => {
      if (!authUser) {
        clearLocalUser();
        return;
      }

      try {
        // Fetch the user's profile from Supabase
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error.message);
          // Create a basic user from auth data if profile fetch fails
          const basicUser: User = {
            id: authUser.id,
            name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            avatarUrl: authUser.user_metadata?.avatar_url || null,
            preferences: {
              dietaryRestrictions: [],
              dislikedIngredients: [],
              favoriteCuisines: [],
              cookingSkillLevel: 'intermediate',
              weeknightMaxTime: 45,
              weekendMaxTime: 90,
              chefMode: false,
            },
            partnerId: null,
          };
          setLocalUser(basicUser);
          return;
        }

        // Map profile to User type
        const appUser: User = {
          id: profile.id,
          name: profile.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          avatarUrl: profile.avatar_url,
          preferences: (profile.preferences as UserPreferences) || {
            dietaryRestrictions: [],
            dislikedIngredients: [],
            favoriteCuisines: [],
            cookingSkillLevel: 'intermediate',
            weeknightMaxTime: 45,
            weekendMaxTime: 90,
            chefMode: false,
          },
          partnerId: profile.partner_id,
        };

        setLocalUser(appUser);
      } catch (err) {
        console.error('Error syncing user to store:', err);
      }
    },
    [setLocalUser, clearLocalUser]
  );

  /**
   * Initialize auth state on mount
   * Checks for existing session and sets up auth listener
   */
  useEffect(() => {
    let mounted = true;

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const existingSession = await getSession();

        if (mounted) {
          if (existingSession) {
            setSession(existingSession);
            setUser(existingSession.user);
            await syncUserToStore(existingSession.user);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { unsubscribe } = onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      console.log('Auth state changed:', event);

      setSession(newSession);
      setUser(newSession?.user || null);

      // Handle different auth events
      switch (event) {
        case 'SIGNED_IN':
          if (newSession?.user) {
            await syncUserToStore(newSession.user);
          }
          break;

        case 'SIGNED_OUT':
          clearLocalUser();
          break;

        case 'TOKEN_REFRESHED':
          // Session refreshed, user stays the same
          break;

        case 'USER_UPDATED':
          if (newSession?.user) {
            await syncUserToStore(newSession.user);
          }
          break;

        default:
          break;
      }

      // Ensure loading is false after any auth event
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [syncUserToStore, clearLocalUser]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: Error | null }> => {
      try {
        setLoading(true);
        const { user: signedInUser, session: newSession, error } = await supabaseSignIn(
          email,
          password
        );

        if (error) {
          setLoading(false);
          return { error };
        }

        // State will be updated by onAuthStateChange listener
        // But we can also set it directly for immediate feedback
        if (signedInUser && newSession) {
          setUser(signedInUser);
          setSession(newSession);
        }

        setLoading(false);
        return { error: null };
      } catch (err) {
        setLoading(false);
        return { error: err as Error };
      }
    },
    []
  );

  /**
   * Sign up with email, password, and name
   */
  const signUp = useCallback(
    async (
      email: string,
      password: string,
      name: string
    ): Promise<{ error: Error | null }> => {
      try {
        setLoading(true);
        const { user: newUser, session: newSession, error } = await supabaseSignUp(
          email,
          password,
          name
        );

        if (error) {
          setLoading(false);
          return { error };
        }

        // Note: If email confirmation is required, session may be null
        // The onAuthStateChange listener will handle the confirmed user
        if (newUser && newSession) {
          setUser(newUser);
          setSession(newSession);
        }

        setLoading(false);
        return { error: null };
      } catch (err) {
        setLoading(false);
        return { error: err as Error };
      }
    },
    []
  );

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async (): Promise<{ error: Error | null }> => {
    try {
      setLoading(true);
      const { error } = await supabaseSignOut();

      if (error) {
        setLoading(false);
        return { error };
      }

      // Clear local state immediately
      setUser(null);
      setSession(null);
      clearLocalUser();

      setLoading(false);
      return { error: null };
    } catch (err) {
      setLoading(false);
      return { error: err as Error };
    }
  }, [clearLocalUser]);

  // Compute isAuthenticated from session
  const isAuthenticated = useMemo(() => !!session && !!user, [session, user]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      isAuthenticated,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, loading, isAuthenticated, signIn, signUp, signOut]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth Hook
 * Provides access to auth state and methods
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

// Export context for advanced use cases
export { AuthContext };

// Export types for consumers
export type { AuthState, AuthContextValue, AuthProviderProps };
