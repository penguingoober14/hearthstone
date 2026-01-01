import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, borderRadius, shadows } from '../../src/lib/theme';
import { Button, AnimatedContainer } from '../../src/components';
import { SAMPLE_RECIPES } from '../../src/data/sampleRecipes';
import type { Recipe } from '../../src/types';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [servingMultiplier, setServingMultiplier] = useState(1);

  // Find recipe from sample recipes
  const recipe: Recipe | undefined = SAMPLE_RECIPES.find((r) => r.id === id);

  // Handle recipe not found
  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recipe Not Found</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.notFoundContainer}>
          <AnimatedContainer animation="fadeSlideUp">
            <View style={styles.notFoundCard}>
              <Text style={styles.notFoundEmoji}>404</Text>
              <Text style={styles.notFoundTitle}>Recipe Not Found</Text>
              <Text style={styles.notFoundText}>
                We couldn&apos;t find the recipe you&apos;re looking for. It may have been removed or the link is incorrect.
              </Text>
              <Button
                title="Go Back"
                onPress={() => router.back()}
                variant="primary"
                style={styles.notFoundButton}
              />
            </View>
          </AnimatedContainer>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate scaled servings
  const scaledServings = recipe.servings * servingMultiplier;

  // Scale ingredient amount (reused from cooking screen)
  const scaleAmount = (amount: number): string => {
    const scaled = amount * servingMultiplier;
    // Clean up display: show whole numbers when possible, otherwise 1 decimal
    if (Number.isInteger(scaled)) {
      return scaled.toString();
    }
    // Check for nice fractions
    const fractions: Record<number, string> = {
      0.25: '1/4',
      0.5: '1/2',
      0.75: '3/4',
      0.33: '1/3',
      0.67: '2/3',
    };
    const decimal = scaled % 1;
    const whole = Math.floor(scaled);
    for (const [dec, frac] of Object.entries(fractions)) {
      if (Math.abs(decimal - parseFloat(dec)) < 0.05) {
        return whole > 0 ? `${whole} ${frac}` : frac;
      }
    }
    return scaled.toFixed(1);
  };

  const handleServingChange = (delta: number) => {
    setServingMultiplier((prev) => Math.max(0.5, Math.min(4, prev + delta)));
  };

  const handleStartCooking = () => {
    router.push(`/cooking/${recipe.id}` as any);
  };

  const totalTime = recipe.prepTime + recipe.cookTime;

  const difficultyColors = {
    easy: colors.success,
    medium: colors.warning,
    hard: colors.softRed,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recipe Hero Section */}
        <AnimatedContainer animation="fadeSlideUp">
          <View style={styles.heroCard}>
            <Text style={styles.recipeName}>{recipe.name}</Text>
            <Text style={styles.recipeDescription}>{recipe.description}</Text>

            {/* Cuisine Badge */}
            <View style={styles.cuisineBadge}>
              <Text style={styles.cuisineText}>{recipe.cuisine}</Text>
            </View>

            {/* Time & Info Badges */}
            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>Prep</Text>
                <Text style={styles.badgeValue}>{recipe.prepTime} min</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>Cook</Text>
                <Text style={styles.badgeValue}>{recipe.cookTime} min</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>Total</Text>
                <Text style={styles.badgeValue}>{totalTime} min</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: `${difficultyColors[recipe.difficulty]}15` }]}>
                <Text style={[styles.badgeLabel, { color: difficultyColors[recipe.difficulty] }]}>
                  Difficulty
                </Text>
                <Text style={[styles.badgeValue, { color: difficultyColors[recipe.difficulty] }]}>
                  {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                </Text>
              </View>
            </View>

            {/* Tags */}
            {recipe.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {recipe.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </AnimatedContainer>

        {/* Ingredients Section */}
        <AnimatedContainer animation="fadeSlideUp" delay={100}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Ingredients</Text>

            {/* Serving Selector */}
            <View style={styles.servingSelector}>
              <Text style={styles.servingLabel}>Servings:</Text>
              <TouchableOpacity
                style={styles.servingButton}
                onPress={() => handleServingChange(-0.5)}
                disabled={servingMultiplier <= 0.5}
              >
                <Text style={[
                  styles.servingButtonText,
                  servingMultiplier <= 0.5 && styles.servingButtonDisabled
                ]}>-</Text>
              </TouchableOpacity>
              <Text style={styles.servingCount}>{scaledServings}</Text>
              <TouchableOpacity
                style={styles.servingButton}
                onPress={() => handleServingChange(0.5)}
                disabled={servingMultiplier >= 4}
              >
                <Text style={[
                  styles.servingButtonText,
                  servingMultiplier >= 4 && styles.servingButtonDisabled
                ]}>+</Text>
              </TouchableOpacity>
              {servingMultiplier !== 1 && (
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => setServingMultiplier(1)}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Ingredients List */}
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientAmount}>
                    {scaleAmount(ingredient.amount)} {ingredient.unit}
                  </Text>
                  <Text style={styles.ingredientName}>
                    {ingredient.name}
                    {ingredient.optional && (
                      <Text style={styles.optionalText}> (optional)</Text>
                    )}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </AnimatedContainer>

        {/* Steps Section */}
        <AnimatedContainer animation="fadeSlideUp" delay={200}>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.stepsSubtitle}>
              {recipe.steps.length} steps to deliciousness
            </Text>

            <View style={styles.stepsList}>
              {recipe.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumberContainer}>
                    <Text style={styles.stepNumber}>{step.order}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepInstruction}>{step.instruction}</Text>
                    {step.duration && (
                      <View style={styles.stepDuration}>
                        <Text style={styles.stepDurationText}>
                          {step.duration} min
                        </Text>
                      </View>
                    )}
                    {step.tip && (
                      <View style={styles.tipContainer}>
                        <Text style={styles.tipLabel}>Tip</Text>
                        <Text style={styles.tipText}>{step.tip}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        </AnimatedContainer>

        {/* Bottom spacing for button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Start Cooking Button */}
      <View style={styles.bottomButtonContainer}>
        <Button
          title="Start Cooking"
          onPress={handleStartCooking}
          variant="primary"
          size="lg"
          glow
          style={styles.startButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.white,
  },
  backButton: {
    padding: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.hearthOrange,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.charcoal,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  headerSpacer: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  // Hero Section
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
    borderTopWidth: 4,
    borderTopColor: colors.hearthOrange,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  recipeDescription: {
    fontSize: 16,
    color: colors.gray600,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  cuisineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.hearthOrangeLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  cuisineText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.hearthOrange,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  badge: {
    backgroundColor: colors.gray50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minWidth: 70,
  },
  badgeLabel: {
    fontSize: 11,
    color: colors.gray500,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  badgeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.sageGreenLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  tagText: {
    fontSize: 12,
    color: colors.sageGreen,
    fontWeight: '500',
  },
  // Section Card
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  // Serving Selector
  servingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginVertical: spacing.md,
  },
  servingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray600,
    marginRight: spacing.sm,
  },
  servingButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  servingButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.hearthOrange,
  },
  servingButtonDisabled: {
    color: colors.gray300,
  },
  servingCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.charcoal,
    minWidth: 40,
    textAlign: 'center',
  },
  resetButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  resetButtonText: {
    fontSize: 12,
    color: colors.hearthOrange,
    fontWeight: '600',
  },
  // Ingredients List
  ingredientsList: {
    marginTop: spacing.sm,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.hearthOrange,
    marginTop: 7,
    marginRight: spacing.sm,
  },
  ingredientAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal,
    minWidth: 80,
  },
  ingredientName: {
    fontSize: 14,
    color: colors.gray600,
    flex: 1,
  },
  optionalText: {
    fontStyle: 'italic',
    color: colors.gray400,
  },
  // Steps Section
  stepsSubtitle: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: spacing.lg,
  },
  stepsList: {
    gap: spacing.lg,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.hearthOrange,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  stepDuration: {
    alignSelf: 'flex-start',
    backgroundColor: colors.sageGreenLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  stepDurationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sageGreen,
  },
  tipContainer: {
    backgroundColor: colors.hearthOrangeLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.hearthOrange,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.hearthOrange,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontSize: 14,
    color: colors.gray600,
    fontStyle: 'italic',
  },
  // Bottom Section
  bottomSpacer: {
    height: 100,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    ...shadows.lg,
  },
  startButton: {
    width: '100%',
  },
  // Not Found
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadows.lg,
  },
  notFoundEmoji: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.gray300,
    marginBottom: spacing.md,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  notFoundText: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  notFoundButton: {
    minWidth: 120,
  },
});
