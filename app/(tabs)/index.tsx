import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMealPlanStore, useUserStore } from '../../src/stores';
import { colors, spacing, borderRadius, shadows, glows } from '../../src/lib/theme';
import { containers, cards, layout, accents } from '../../src/lib/globalStyles';
import { Typography, BadgePill, AnimatedContainer, useToast } from '../../src/components';
import { useRecommendation } from '../../src/hooks/useRecommendation';

const CUISINE_EMOJIS: Record<string, string> = {
  Indian: '🍛',
  Italian: '🍝',
  Mexican: '🌮',
  Japanese: '🍱',
  Chinese: '🥡',
};

export default function TonightScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  // Get data from stores
  const { todayRecommendation } = useMealPlanStore();
  const { partner } = useUserStore();
  const { fetchRecommendation, rejectAndGetNext, isLoading } = useRecommendation();

  // Auto-fetch recommendation on mount if none exists
  // Note: Auth and onboarding checks are handled by _layout.tsx
  useEffect(() => {
    if (!todayRecommendation && !isLoading) {
      fetchRecommendation();
    }
  }, []); // Only run once on mount

  const handleLetsCook = () => {
    if (!todayRecommendation) return;
    showToast(`Starting ${todayRecommendation.recipe.name}!`);
    // Navigate to cooking guide screen
    router.push(`/cooking/${todayRecommendation.recipe.id}` as any);
  };

  const handleNotTonight = () => {
    // Get a different recommendation
    rejectAndGetNext('not_in_mood');
  };

  const handleGenerateRecommendation = () => {
    // Fetch recommendation using the hook (uses sample recipes with smart selection)
    fetchRecommendation();
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>HEARTHSTONE</Text>
        </View>
        <Text style={styles.sectionTitle}>Tonight</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.hearthOrange} />
          <Text style={styles.loadingText}>Finding the perfect meal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - no recommendation
  if (!todayRecommendation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>HEARTHSTONE</Text>
        </View>

        <Text style={styles.sectionTitle}>Tonight</Text>

        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateEmoji}>🍳</Text>
          <Text style={styles.emptyStateTitle}>No meal planned yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Let us find the perfect dinner based on what you have in your kitchen
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGenerateRecommendation}
          >
            <Text style={styles.primaryButtonText}>GENERATE RECOMMENDATION</Text>
          </TouchableOpacity>
        </View>

        {partner && (
          <View style={styles.partnerStatus}>
            <Text style={styles.partnerStatusText}>
              Partner: {partner.name} is connected
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Extract meal data from recommendation
  const { recipe, reasoning } = todayRecommendation;
  const totalTime = recipe.prepTime + recipe.cookTime;
  const difficultyDisplay = recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HEARTHSTONE</Text>
      </View>

      <Text style={styles.sectionTitle}>Tonight</Text>

      <AnimatedContainer animation="fadeSlideUp">
        <View style={styles.mealCard}>
          {/* Placeholder for meal image */}
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>
              {CUISINE_EMOJIS[recipe.cuisine] ?? '🍽️'}
            </Text>
          </View>

          <Text style={styles.mealName}>{recipe.name}</Text>
          <Text style={styles.mealSubtitle}>{recipe.description}</Text>

          <View style={styles.metricsRow}>
            <BadgePill icon="🕐" label={`${totalTime} min`} variant="muted" size="sm" />
            <BadgePill icon="🔥" label={difficultyDisplay} variant="muted" size="sm" />
            <BadgePill icon="💰" label={`£${recipe.estimatedCost}`} variant="muted" size="sm" />
          </View>

          <View style={styles.reasoning}>
            <Text style={styles.reasoningText}>"{reasoning}"</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLetsCook}
          >
            <Text style={styles.primaryButtonText}>LET'S COOK</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryLink}
            onPress={handleNotTonight}
          >
            <Text style={styles.secondaryLinkText}>Not tonight →</Text>
          </TouchableOpacity>
        </View>
      </AnimatedContainer>

      <View style={styles.partnerStatus}>
        {partner ? (
          <>
            <Text style={styles.partnerStatusText}>
              Cooking with {partner.name} tonight
            </Text>
            <Text style={styles.partnerStatusText}>
              Serving {recipe.servings} people
            </Text>
            <TouchableOpacity
              style={styles.claimCookingButton}
              onPress={() => showToast("You've claimed tonight's cooking!")}
            >
              <Text style={styles.claimCookingButtonText}>I'll cook tonight</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.partnerStatusText}>
            Cooking for 1 tonight
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.charcoal,
    letterSpacing: 2,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: spacing.lg,
  },
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: colors.charcoal,
  },
  // Empty state styles
  emptyStateCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    ...shadows.lg,
  },
  emptyStateEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 20,
  },
  // Meal card styles
  mealCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.lg,
    ...accents.accentBorderTop,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: colors.hearthOrangeLight,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  imagePlaceholderText: {
    fontSize: 64,
  },
  mealName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  mealSubtitle: {
    fontSize: 16,
    color: colors.gray500,
    marginBottom: spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reasoning: {
    backgroundColor: colors.hearthOrangeLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.hearthOrange,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.sm,
  },
  reasoningText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.gray600,
  },
  primaryButton: {
    backgroundColor: colors.hearthOrange,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
    ...glows.glowOrange,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryLink: {
    alignItems: 'center',
  },
  secondaryLinkText: {
    color: colors.gray500,
    fontSize: 14,
  },
  partnerStatus: {
    ...cards.cardMuted,
    marginTop: spacing.xl,
  },
  partnerStatusText: {
    fontSize: 14,
    color: colors.sageGreen,
    marginBottom: spacing.xs,
  },
  claimCookingButton: {
    backgroundColor: colors.sageGreen,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  claimCookingButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
