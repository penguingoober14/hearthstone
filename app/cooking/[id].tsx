import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMealPlanStore, useProgressStore } from '../../src/stores';
import { colors, spacing, borderRadius, shadows, glows } from '../../src/lib/theme';
import { Button, Checkbox, ProgressBar, AnimatedContainer, Celebration } from '../../src/components';
import { RatingModal } from '../../src/components/modals/RatingModal';

export default function CookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    todayRecommendation,
    setTodayRecommendation,
    addPlan,
    markCompleted,
    startCookingSession,
    updateCookingProgress,
    endCookingSession,
    activeCookingSession,
  } = useMealPlanStore();
  const { addXP, updateStreak } = useProgressStore();

  // State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get recipe from recommendation
  const recipe = todayRecommendation?.recipe;

  // Calculate scaled servings
  const scaledServings = recipe ? recipe.servings * servingMultiplier : 0;

  // Scale ingredient amount
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

  // Initialize cooking session
  useEffect(() => {
    if (recipe && !planId) {
      // Create the meal plan entry (initially incomplete)
      const newPlanId = addPlan({
        date: new Date(),
        mealType: 'dinner',
        recipe: recipe,
        notes: todayRecommendation?.reasoning || '',
        completed: false,
        rating: null,
      });
      setPlanId(newPlanId);
      startCookingSession(newPlanId, recipe.id);
    }
  }, [recipe]);

  // Restore from active session
  useEffect(() => {
    if (activeCookingSession && activeCookingSession.currentStep > 0) {
      setCurrentStepIndex(activeCookingSession.currentStep);
    }
  }, []);

  // Handle missing recipe
  useEffect(() => {
    if (!recipe) {
      router.replace('/');
    }
  }, [recipe, router]);

  if (!recipe) {
    return null;
  }

  const steps = recipe.steps;
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      timerRef.current = setTimeout(() => {
        setTimerSeconds((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      Alert.alert('Timer Complete!', `Step ${currentStepIndex + 1} timer finished.`);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timerSeconds, currentStepIndex]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    if (currentStep.duration) {
      setTimerSeconds(currentStep.duration * 60);
      setIsTimerRunning(true);
    }
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    if (currentStep.duration) {
      setTimerSeconds(currentStep.duration * 60);
    }
  };

  const handleNextStep = () => {
    // Mark current step as completed
    setCompletedSteps((prev) => new Set(prev).add(currentStepIndex));

    // Reset timer for next step
    setIsTimerRunning(false);
    setTimerSeconds(null);

    if (isLastStep) {
      // Show rating modal when finishing last step
      setShowRatingModal(true);
    } else {
      const nextStep = currentStepIndex + 1;
      setCurrentStepIndex(nextStep);
      updateCookingProgress(nextStep);
    }
  };

  const handlePrevStep = () => {
    if (!isFirstStep) {
      setIsTimerRunning(false);
      setTimerSeconds(null);
      const prevStep = currentStepIndex - 1;
      setCurrentStepIndex(prevStep);
      updateCookingProgress(prevStep);
    }
  };

  const handleIngredientToggle = (index: number) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleRatingSubmit = (rating: number, notes?: string) => {
    if (planId) {
      markCompleted(planId, rating, notes);
    }

    // Award XP based on difficulty (+ bonus for rating)
    const difficultyXP = { easy: 50, medium: 100, hard: 150 };
    const baseXP = difficultyXP[recipe?.difficulty || 'medium'];
    const ratingBonus = rating * 10; // 10-50 bonus XP based on rating
    addXP(baseXP + ratingBonus);

    // Update cooking streak
    updateStreak(true);

    endCookingSession();
    setTodayRecommendation(null);
    router.replace('/');
  };

  const handleRatingClose = () => {
    // User cancelled rating - still mark as complete but without rating
    if (planId) {
      markCompleted(planId);
    }

    // Still award base XP even without rating
    const difficultyXP = { easy: 50, medium: 100, hard: 150 };
    addXP(difficultyXP[recipe?.difficulty || 'medium']);

    // Update cooking streak
    updateStreak(true);

    endCookingSession();
    setTodayRecommendation(null);
    router.replace('/');
  };

  const handleExitCooking = () => {
    Alert.alert(
      'Exit Cooking?',
      'Your progress will be saved. You can resume later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            // Keep the session for resume, just navigate back
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExitCooking} style={styles.backButton}>
          <Text style={styles.backButtonText}>Exit</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {recipe.name}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ingredients Checklist (shown on first step) */}
        {currentStepIndex === 0 && (
          <AnimatedContainer animation="fadeSlideUp">
            <View style={styles.ingredientsCard}>
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
                  ]}>−</Text>
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

              <Text style={styles.sectionSubtitle}>
                Check off items as you gather them
              </Text>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <Checkbox
                    checked={checkedIngredients.has(index)}
                    onChange={() => handleIngredientToggle(index)}
                    label={`${scaleAmount(ingredient.amount)} ${ingredient.unit} ${ingredient.name}${ingredient.optional ? ' (optional)' : ''}`}
                  />
                </View>
              ))}
            </View>
          </AnimatedContainer>
        )}

        {/* Current Step */}
        <AnimatedContainer animation="fadeSlideUp" delay={100}>
          <View style={styles.stepCard}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>
                Step {currentStepIndex + 1} of {steps.length}
              </Text>
              {currentStep.duration && (
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    {currentStep.duration} min
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.stepInstruction}>{currentStep.instruction}</Text>

            {currentStep.tip && (
              <View style={styles.tipContainer}>
                <Text style={styles.tipLabel}>Tip</Text>
                <Text style={styles.tipText}>{currentStep.tip}</Text>
              </View>
            )}

            {/* Timer */}
            {currentStep.duration && (
              <View style={styles.timerSection}>
                <Text style={styles.timerDisplay}>
                  {timerSeconds !== null ? formatTime(timerSeconds) : `${currentStep.duration}:00`}
                </Text>
                <View style={styles.timerButtons}>
                  {!isTimerRunning ? (
                    <Button
                      title={timerSeconds === null ? 'Start Timer' : 'Resume'}
                      onPress={handleStartTimer}
                      variant="secondary"
                      size="sm"
                    />
                  ) : (
                    <Button
                      title="Pause"
                      onPress={handlePauseTimer}
                      variant="outline"
                      size="sm"
                    />
                  )}
                  {timerSeconds !== null && (
                    <Button
                      title="Reset"
                      onPress={handleResetTimer}
                      variant="ghost"
                      size="sm"
                    />
                  )}
                </View>
              </View>
            )}
          </View>
        </AnimatedContainer>

        {/* Progress */}
        <View style={styles.progressSection}>
          <ProgressBar
            progress={progress}
            height={8}
            showLabel
            labelPosition="right"
          />
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <Button
          title="Previous"
          onPress={handlePrevStep}
          variant="outline"
          disabled={isFirstStep}
          style={styles.navButton}
        />
        <Button
          title={isLastStep ? 'Finish Cooking' : 'Next Step'}
          onPress={handleNextStep}
          variant="primary"
          style={styles.navButton}
          glow={isLastStep}
        />
      </View>

      {/* Celebration Animation */}
      <Celebration visible={showRatingModal} message="Well done, chef!" />

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={handleRatingClose}
        onSubmit={handleRatingSubmit}
        mealName={recipe.name}
      />
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
  ingredientsCard: {
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
  sectionSubtitle: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: spacing.lg,
  },
  ingredientRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  stepCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.lg,
    borderTopWidth: 3,
    borderTopColor: colors.hearthOrange,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.hearthOrange,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  durationBadge: {
    backgroundColor: colors.sageGreenLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.sageGreen,
  },
  stepInstruction: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.charcoal,
    marginBottom: spacing.lg,
  },
  tipContainer: {
    backgroundColor: colors.hearthOrangeLight,
    borderLeftWidth: 3,
    borderLeftColor: colors.hearthOrange,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
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
  timerSection: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.charcoal,
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.md,
  },
  timerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  progressSection: {
    marginBottom: spacing.xl,
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  navButton: {
    flex: 1,
  },
});
