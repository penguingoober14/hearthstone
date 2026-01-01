import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useUserStore, useProgressStore } from '../src/stores';
import { colors, spacing, borderRadius, shadows } from '../src/lib/theme';
import { AnimatedContainer } from '../src/components';
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

const TIME_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, partner, updatePreferences, logout } = useUserStore();
  const { cookingStats } = useProgressStore();

  // Get current preferences with defaults
  const preferences = user?.preferences ?? {
    dietaryRestrictions: [],
    favoriteCuisines: [],
    cookingSkillLevel: 'intermediate' as SkillLevel,
    weeknightMaxTime: 45,
    weekendMaxTime: 90,
    chefMode: false,
  };

  // Local state for immediate UI feedback
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    preferences.dietaryRestrictions
  );
  const [favoriteCuisines, setFavoriteCuisines] = useState<string[]>(
    preferences.favoriteCuisines
  );
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(
    preferences.cookingSkillLevel
  );
  const [weeknightMaxTime, setWeeknightMaxTime] = useState<number>(
    preferences.weeknightMaxTime
  );
  const [weekendMaxTime, setWeekendMaxTime] = useState<number>(
    preferences.weekendMaxTime
  );
  const [chefMode, setChefMode] = useState<boolean>(preferences.chefMode);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handleChefModeToggle = (value: boolean) => {
    setChefMode(value);
    updatePreferences({ chefMode: value });
  };

  const toggleDietary = (value: string) => {
    const updated = dietaryRestrictions.includes(value)
      ? dietaryRestrictions.filter((v) => v !== value)
      : [...dietaryRestrictions, value];
    setDietaryRestrictions(updated);
    updatePreferences({ dietaryRestrictions: updated });
  };

  const toggleCuisine = (value: string) => {
    const updated = favoriteCuisines.includes(value)
      ? favoriteCuisines.filter((v) => v !== value)
      : [...favoriteCuisines, value];
    setFavoriteCuisines(updated);
    updatePreferences({ favoriteCuisines: updated });
  };

  const handleSkillLevelChange = (level: SkillLevel) => {
    setSkillLevel(level);
    updatePreferences({ cookingSkillLevel: level });
  };

  const handleWeeknightTimeChange = (time: number) => {
    setWeeknightMaxTime(time);
    updatePreferences({ weeknightMaxTime: time });
  };

  const handleWeekendTimeChange = (time: number) => {
    setWeekendMaxTime(time);
    updatePreferences({ weekendMaxTime: time });
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear temporary data and cached images. Your preferences and meal plans will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            // In a real app, this would clear AsyncStorage cache keys
            Alert.alert('Cache Cleared', 'Temporary data has been cleared.');
          },
        },
      ]
    );
  };

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will delete all your data including meal plans, preferences, and progress. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/onboarding');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.charcoal} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Chef Mode Section */}
        <AnimatedContainer animation="fadeSlideUp" delay={0}>
          <Text style={styles.sectionTitle}>Display</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Chef Mode</Text>
                <Text style={styles.settingDesc}>
                  Hide gamification (XP, levels, challenges)
                </Text>
              </View>
              <Switch
                value={chefMode}
                onValueChange={handleChefModeToggle}
                trackColor={{ false: colors.gray300, true: colors.sageGreenLight }}
                thumbColor={chefMode ? colors.sageGreen : colors.gray400}
              />
            </View>
          </View>
        </AnimatedContainer>

        {/* Partner Section */}
        <AnimatedContainer animation="fadeSlideUp" delay={50}>
          <Text style={styles.sectionTitle}>Cooking Partner</Text>
          <View style={styles.card}>
            {partner ? (
              <View style={styles.partnerConnected}>
                <View style={styles.partnerAvatar}>
                  <Text style={styles.partnerInitial}>
                    {partner.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>{partner.name}</Text>
                  <Text style={styles.partnerStats}>
                    {cookingStats.coupleMeals} meals cooked together
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.partnerEditButton}
                  onPress={() => router.push('/partner')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="settings-outline" size={20} color={colors.gray500} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.actionRow}
                onPress={() => router.push('/partner')}
                activeOpacity={0.7}
              >
                <Ionicons name="people-outline" size={20} color={colors.sageGreen} />
                <Text style={[styles.actionLabel, { color: colors.sageGreen }]}>
                  Connect with a partner
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
              </TouchableOpacity>
            )}
          </View>
        </AnimatedContainer>

        {/* Dietary Restrictions Section */}
        <AnimatedContainer animation="fadeSlideUp" delay={100}>
          <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              Select any dietary restrictions that apply to you
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
                      dietaryRestrictions.includes(option.value) &&
                        styles.chipLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AnimatedContainer>

        {/* Favorite Cuisines Section */}
        <AnimatedContainer animation="fadeSlideUp" delay={150}>
          <Text style={styles.sectionTitle}>Favorite Cuisines</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              Pick cuisines you love for better recommendations
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
                      favoriteCuisines.includes(option.value) &&
                        styles.chipLabelSelected,
                    ]}
                  >
                    {option.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AnimatedContainer>

        {/* Cooking Skill Level Section */}
        <AnimatedContainer animation="fadeSlideUp" delay={200}>
          <Text style={styles.sectionTitle}>Cooking Skill Level</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              This helps us recommend recipes that match your experience
            </Text>
            <View style={styles.skillOptionsContainer}>
              {SKILL_LEVELS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.skillOption,
                    skillLevel === option.value && styles.skillOptionSelected,
                  ]}
                  onPress={() => handleSkillLevelChange(option.value)}
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
          </View>
        </AnimatedContainer>

        {/* Time Preferences Section */}
        <AnimatedContainer animation="fadeSlideUp" delay={250}>
          <Text style={styles.sectionTitle}>Time Preferences</Text>
          <View style={styles.card}>
            <Text style={styles.cardDescription}>
              Set your maximum cooking time for different days
            </Text>

            {/* Weeknight Time */}
            <Text style={styles.timeLabel}>Weeknight max cooking time</Text>
            <View style={styles.timeChipContainer}>
              {TIME_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={`weeknight-${option.value}`}
                  style={[
                    styles.timeChip,
                    weeknightMaxTime === option.value && styles.timeChipSelected,
                  ]}
                  onPress={() => handleWeeknightTimeChange(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timeChipLabel,
                      weeknightMaxTime === option.value &&
                        styles.timeChipLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Weekend Time */}
            <Text style={[styles.timeLabel, styles.timeLabelSpaced]}>
              Weekend max cooking time
            </Text>
            <View style={styles.timeChipContainer}>
              {TIME_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={`weekend-${option.value}`}
                  style={[
                    styles.timeChip,
                    weekendMaxTime === option.value && styles.timeChipSelected,
                  ]}
                  onPress={() => handleWeekendTimeChange(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timeChipLabel,
                      weekendMaxTime === option.value &&
                        styles.timeChipLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </AnimatedContainer>

        {/* Data Management Section */}
        <AnimatedContainer animation="fadeSlideUp" delay={300}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleClearCache}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={20} color={colors.gray600} />
              <Text style={styles.actionLabel}>Clear Cache</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleResetApp}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={20} color={colors.softRed} />
              <Text style={[styles.actionLabel, styles.destructiveLabel]}>
                Reset App
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.gray400} />
            </TouchableOpacity>
          </View>
        </AnimatedContainer>

        {/* About Section */}
        <AnimatedContainer animation="fadeSlideUp" delay={350}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>App Version</Text>
              <Text style={styles.aboutValue}>{appVersion}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>User</Text>
              <Text style={styles.aboutValue}>{user?.name ?? 'Guest'}</Text>
            </View>
          </View>
        </AnimatedContainer>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.charcoal,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.gray500,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.xs,
  },
  settingDesc: {
    fontSize: 13,
    color: colors.gray500,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: colors.gray200,
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
  skillOptionsContainer: {
    gap: spacing.md,
  },
  skillOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  skillOptionSelected: {
    borderColor: colors.hearthOrange,
    backgroundColor: colors.hearthOrangeLight,
  },
  skillEmoji: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  skillTextContainer: {
    flex: 1,
  },
  skillLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal,
  },
  skillLabelSelected: {
    color: colors.hearthOrange,
  },
  skillDesc: {
    fontSize: 13,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  checkmark: {
    fontSize: 18,
    color: colors.hearthOrange,
    fontWeight: 'bold',
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  timeLabelSpaced: {
    marginTop: spacing.lg,
  },
  timeChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeChip: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  timeChipSelected: {
    borderColor: colors.hearthOrange,
    backgroundColor: colors.hearthOrangeLight,
  },
  timeChipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.charcoal,
  },
  timeChipLabelSelected: {
    color: colors.hearthOrange,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  actionLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.charcoal,
    marginLeft: spacing.md,
  },
  destructiveLabel: {
    color: colors.softRed,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.sm,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  aboutLabel: {
    fontSize: 16,
    color: colors.charcoal,
  },
  aboutValue: {
    fontSize: 16,
    color: colors.gray500,
  },
  bottomSpacer: {
    height: spacing.xxxl,
  },
  partnerConnected: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.sageGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  partnerInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  partnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal,
  },
  partnerStats: {
    fontSize: 13,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  partnerEditButton: {
    padding: spacing.sm,
  },
});
