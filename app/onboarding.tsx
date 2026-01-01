import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserStore, useProgressStore } from '../src/stores';
import { useAuth } from '../src/contexts/AuthContext';
import { useToast } from '../src/components/Toast';
import { colors, spacing, borderRadius, shadows } from '../src/lib/theme';
import { Button, ProgressBar, AnimatedContainer } from '../src/components';
import type { UserPreferences } from '../src/types';

type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

const SKILL_LEVELS: { value: SkillLevel; label: string; emoji: string; desc: string }[] = [
  { value: 'beginner', label: 'Beginner', emoji: '🌱', desc: 'Just starting my cooking journey' },
  { value: 'intermediate', label: 'Home Cook', emoji: '👨‍🍳', desc: 'Comfortable with most recipes' },
  { value: 'advanced', label: 'Expert', emoji: '⭐', desc: 'Ready for any culinary challenge' },
];

const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'gluten-free', label: 'Gluten-Free', emoji: '🌾' },
  { value: 'dairy-free', label: 'Dairy-Free', emoji: '🥛' },
  { value: 'nut-free', label: 'Nut-Free', emoji: '🥜' },
  { value: 'halal', label: 'Halal', emoji: '🍖' },
  { value: 'kosher', label: 'Kosher', emoji: '✡️' },
];

const CUISINE_OPTIONS = [
  { value: 'Italian', emoji: '🍝' },
  { value: 'Mexican', emoji: '🌮' },
  { value: 'Chinese', emoji: '🥡' },
  { value: 'Japanese', emoji: '🍣' },
  { value: 'Indian', emoji: '🍛' },
  { value: 'Thai', emoji: '🍜' },
  { value: 'Mediterranean', emoji: '🫒' },
  { value: 'American', emoji: '🍔' },
];

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useUserStore();
  const { initializeChallenges } = useProgressStore();
  const { isAuthenticated, updateProfile, initializeUserProgress } = useAuth();
  const { showToast } = useToast();

  // Form state
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>([]);

  const progress = (step / TOTAL_STEPS) * 100;

  const canProceed = () => {
    switch (step) {
      case 1:
        return name.trim().length >= 2;
      case 2:
        return true; // Skill level has a default
      case 3:
        return true; // Dietary restrictions are optional
      case 4:
        return true; // Cuisines are optional
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  /**
   * Sync user data to Supabase (async, non-blocking)
   * Handles profile update and progress initialization
   */
  const syncToSupabase = async (preferences: Partial<UserPreferences>) => {
    // Only sync if user is authenticated with Supabase
    if (!isAuthenticated) {
      return;
    }

    try {
      // Sync profile to Supabase (name and preferences)
      const { error: profileError } = await updateProfile({
        name: name.trim(),
        preferences: {
          cookingSkillLevel: skillLevel,
          dietaryRestrictions,
          favoriteCuisines,
          ...preferences,
        },
      });

      if (profileError) {
        console.error('Error syncing profile to Supabase:', profileError.message);
        showToast('Profile saved locally. Cloud sync will retry later.', 'info');
      }

      // Initialize user progress in Supabase
      const { error: progressError } = await initializeUserProgress();

      if (progressError) {
        console.error('Error initializing progress in Supabase:', progressError.message);
        // Don't show another toast - profile error toast is enough
      }
    } catch (err) {
      console.error('Error syncing to Supabase:', err);
      showToast('Profile saved locally. Cloud sync will retry later.', 'info');
    }
  };

  const handleComplete = () => {
    const preferences: Partial<UserPreferences> = {
      cookingSkillLevel: skillLevel,
      dietaryRestrictions,
      favoriteCuisines,
    };

    // Step 1: Update local store (synchronous)
    completeOnboarding(name.trim(), preferences);

    // Step 2: Initialize challenges based on skill level (synchronous)
    initializeChallenges(skillLevel);

    // Step 3: Sync to Supabase (async, non-blocking)
    // This runs in the background and doesn't block navigation
    syncToSupabase(preferences);

    // Step 4: Navigate to home immediately
    router.replace('/');
  };

  const toggleDietary = (value: string) => {
    setDietaryRestrictions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const toggleCuisine = (value: string) => {
    setFavoriteCuisines((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <AnimatedContainer animation="fadeSlideUp" key="step1">
            <Text style={styles.stepEmoji}>👋</Text>
            <Text style={styles.stepTitle}>Welcome to Hearthstone!</Text>
            <Text style={styles.stepSubtitle}>
              Let's personalize your cooking experience. What should we call you?
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Your name"
              placeholderTextColor={colors.gray400}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoFocus
            />
          </AnimatedContainer>
        );

      case 2:
        return (
          <AnimatedContainer animation="fadeSlideUp" key="step2">
            <Text style={styles.stepEmoji}>🍳</Text>
            <Text style={styles.stepTitle}>Your Cooking Skill</Text>
            <Text style={styles.stepSubtitle}>
              This helps us recommend recipes that match your experience.
            </Text>
            <View style={styles.optionsContainer}>
              {SKILL_LEVELS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.skillOption,
                    skillLevel === option.value && styles.skillOptionSelected,
                  ]}
                  onPress={() => setSkillLevel(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.skillEmoji}>{option.emoji}</Text>
                  <View style={styles.skillTextContainer}>
                    <Text
                      style={[
                        styles.skillLabel,
                        skillLevel === option.value && styles.skillLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.skillDesc}>{option.desc}</Text>
                  </View>
                  {skillLevel === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedContainer>
        );

      case 3:
        return (
          <AnimatedContainer animation="fadeSlideUp" key="step3">
            <Text style={styles.stepEmoji}>🥗</Text>
            <Text style={styles.stepTitle}>Dietary Preferences</Text>
            <Text style={styles.stepSubtitle}>
              Select any that apply. You can skip if none apply.
            </Text>
            <View style={styles.chipContainer}>
              {DIETARY_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    dietaryRestrictions.includes(option.value) && styles.chipSelected,
                  ]}
                  onPress={() => toggleDietary(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      dietaryRestrictions.includes(option.value) && styles.chipLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedContainer>
        );

      case 4:
        return (
          <AnimatedContainer animation="fadeSlideUp" key="step4">
            <Text style={styles.stepEmoji}>🌍</Text>
            <Text style={styles.stepTitle}>Favorite Cuisines</Text>
            <Text style={styles.stepSubtitle}>
              Pick cuisines you love. We'll suggest recipes to match!
            </Text>
            <View style={styles.chipContainer}>
              {CUISINE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    favoriteCuisines.includes(option.value) && styles.chipSelected,
                  ]}
                  onPress={() => toggleCuisine(option.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      favoriteCuisines.includes(option.value) && styles.chipLabelSelected,
                    ]}
                  >
                    {option.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </AnimatedContainer>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} height={6} color={colors.hearthOrange} />
          <Text style={styles.stepIndicator}>
            Step {step} of {TOTAL_STEPS}
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navigation}>
          {step > 1 ? (
            <Button
              title="Back"
              onPress={handleBack}
              variant="outline"
              style={styles.navButton}
            />
          ) : (
            <View style={styles.navButton} />
          )}
          <Button
            title={step === TOTAL_STEPS ? "Let's Cook!" : 'Next'}
            onPress={handleNext}
            variant="primary"
            disabled={!canProceed()}
            style={styles.navButton}
            glow={step === TOTAL_STEPS}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  keyboardAvoid: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  stepIndicator: {
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  stepEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: 16,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 18,
    color: colors.charcoal,
    borderWidth: 2,
    borderColor: colors.gray200,
    ...shadows.sm,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  skillOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    ...shadows.sm,
  },
  skillOptionSelected: {
    borderColor: colors.hearthOrange,
    backgroundColor: colors.hearthOrangeLight,
  },
  skillEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  skillTextContainer: {
    flex: 1,
  },
  skillLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
  },
  skillLabelSelected: {
    color: colors.hearthOrange,
  },
  skillDesc: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  checkmark: {
    fontSize: 20,
    color: colors.hearthOrange,
    fontWeight: 'bold',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: colors.gray200,
    ...shadows.sm,
  },
  chipSelected: {
    borderColor: colors.sageGreen,
    backgroundColor: colors.sageGreenLight,
  },
  chipEmoji: {
    fontSize: 18,
    marginRight: spacing.xs,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.charcoal,
  },
  chipLabelSelected: {
    color: colors.sageGreen,
  },
  navigation: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  navButton: {
    flex: 1,
  },
});
