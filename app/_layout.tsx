import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { ToastProvider } from '../src/components';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { useUserStore } from '../src/stores';
import { colors, spacing } from '../src/lib/theme';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, loading } = useAuth();
  const { onboardingComplete } = useUserStore();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!isAuthenticated) {
      // Not authenticated - redirect to login
      if (!inAuthGroup) {
        router.replace('/login');
      }
    } else if (!onboardingComplete) {
      // Authenticated but no onboarding - redirect to onboarding
      if (!inOnboarding) {
        router.replace('/onboarding');
      }
    } else {
      // Authenticated and onboarding complete - show main app
      if (inAuthGroup || inOnboarding) {
        router.replace('/');
      }
    }
  }, [isAuthenticated, onboardingComplete, loading, segments]);

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingLogo}>HEARTHSTONE</Text>
        <ActivityIndicator size="large" color={colors.hearthOrange} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="recipe/[id]" />
      <Stack.Screen
        name="cooking/[id]"
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="partner" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <View style={styles.container}>
          <StatusBar style="dark" />
          <RootLayoutNav />
        </View>
      </ToastProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
  },
  loadingLogo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.hearthOrange,
    letterSpacing: 3,
    marginBottom: spacing.xl,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray500,
  },
});
