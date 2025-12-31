import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore, useProgressStore } from '../../src/stores';
import { colors, spacing, borderRadius, shadows, glows } from '../../src/lib/theme';
import { containers, cards, layout } from '../../src/lib/globalStyles';
import { Typography, BadgePill, AnimatedCard } from '../../src/components';

export default function DashboardScreen() {
  const { monthlyStats, weeklyStats, partner } = useUserStore();
  const { progress } = useProgressStore();

  // Derive stats from stores with safe defaults
  const streak = progress.streak ?? 0;
  const longestStreak = progress.longestStreak ?? 0;
  const monthSaved = monthlyStats.moneySaved ?? 0;
  const monthMeals = monthlyStats.mealsCooked ?? 0;
  const weeklyHoursSaved = weeklyStats.hoursSaved ?? 0;
  const itemsSaved = monthlyStats.itemsSavedFromExpiry ?? 0;
  const cuisinesExplored = monthlyStats.cuisinesExplored ?? [];

  // Calculate couple cooking percentage safely
  const couplesMeals = monthlyStats.couplesMeals ?? 0;
  const totalMeals = monthlyStats.totalMeals ?? 0;
  const couplePercentage = totalMeals > 0
    ? Math.round((couplesMeals / totalMeals) * 100)
    : 0;

  // Show "Your longest yet!" only if current streak equals longest streak and streak > 0
  const isLongestStreak = streak > 0 && streak === longestStreak;

  // Get partner name or default
  const partnerName = partner?.name ?? 'your partner';

  // Alert handlers for stat cards
  const handleMoneySavedPress = () => {
    Alert.alert(
      'Money Saved',
      `You've saved ${monthSaved} this month by cooking at home instead of eating out!\n\nThat's money you can put towards better ingredients, kitchen gadgets, or a special treat.`,
      [{ text: 'Great!', style: 'default' }]
    );
  };

  const handleMealsCookedPress = () => {
    Alert.alert(
      'Meals Cooked',
      `${monthMeals} meals prepared with love this month!\n\nEvery home-cooked meal is a step towards healthier eating and culinary mastery.`,
      [{ text: 'Keep cooking!', style: 'default' }]
    );
  };

  const handleHoursSavedPress = () => {
    Alert.alert(
      'Hours Saved',
      `You're saving about ${weeklyHoursSaved} hours per week through efficient meal planning!\n\nSmart prep and batch cooking add up to more time for what you love.`,
      [{ text: 'Nice!', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Kitchen Story</Text>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNumber}>{streak}-DAY STREAK</Text>
          {isLongestStreak && (
            <Text style={styles.streakSubtitle}>Your longest yet!</Text>
          )}
        </View>

        {/* Monthly Stats */}
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.statsRow}>
          <AnimatedCard
            style={[styles.statCard, styles.statCardOrange]}
            onPress={handleMoneySavedPress}
            animateOnMount
            mountDelay={0}
            elevation="sm"
          >
            <Text style={styles.statNumber}>{monthSaved}</Text>
            <Text style={styles.statLabel}>saved vs eat out</Text>
          </AnimatedCard>
          <AnimatedCard
            style={[styles.statCard, styles.statCardGreen]}
            onPress={handleMealsCookedPress}
            animateOnMount
            mountDelay={100}
            elevation="sm"
          >
            <Text style={styles.statNumber}>{monthMeals}</Text>
            <Text style={styles.statLabel}>meals cooked</Text>
          </AnimatedCard>
          <AnimatedCard
            style={[styles.statCard, styles.statCardBlue]}
            onPress={handleHoursSavedPress}
            animateOnMount
            mountDelay={200}
            elevation="sm"
          >
            <Text style={styles.statNumber}>{weeklyHoursSaved}</Text>
            <Text style={styles.statLabel}>hrs/wk saved</Text>
          </AnimatedCard>
        </View>

        {/* Food Rescue */}
        <View style={styles.rescueCard}>
          <Text style={styles.rescueTitle}>Food Rescue</Text>
          <Text style={styles.rescueEmoji}>🥕🥦🍗</Text>
          <Text style={styles.rescueText}>{itemsSaved} items saved from expiring this month</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
          <Text style={styles.progressLabel}>vs last month</Text>
        </View>

        {/* Taste Journey */}
        <View style={styles.journeyCard}>
          <Text style={styles.journeyTitle}>Taste Journey</Text>
          <Text style={styles.journeyText}>{cuisinesExplored.length} cuisines explored</Text>
          {cuisinesExplored.length > 0 && (
            <View style={styles.cuisinesContainer}>
              {cuisinesExplored.map((cuisine, index) => (
                <BadgePill
                  key={index}
                  label={cuisine}
                  variant="muted"
                  size="sm"
                />
              ))}
            </View>
          )}
        </View>

        {/* Together Stats */}
        {totalMeals > 0 && (
          <View style={styles.togetherCard}>
            <Text style={styles.togetherText}>
              You & {partnerName} cooked {couplePercentage}% of meals together this month 💕
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  streakCard: {
    backgroundColor: colors.hearthOrange,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...glows.glowOrange,
  },
  streakEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  streakSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderTopWidth: 3,
  },
  statCardOrange: {
    borderTopColor: colors.hearthOrange,
  },
  statCardGreen: {
    borderTopColor: colors.sageGreen,
  },
  statCardBlue: {
    borderTopColor: colors.info,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  rescueCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.xl,
    ...shadows.md,
  },
  rescueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  rescueEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  rescueText: {
    fontSize: 14,
    color: colors.charcoal,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 12,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.sageGreen,
    borderRadius: borderRadius.md,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  journeyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.xl,
    ...shadows.md,
  },
  journeyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  journeyText: {
    fontSize: 14,
    color: colors.charcoal,
  },
  cuisinesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  togetherCard: {
    backgroundColor: colors.sageGreenLight,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginTop: spacing.xl,
    marginBottom: spacing.xxxl + spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.sageGreen,
    ...shadows.md,
  },
  togetherText: {
    fontSize: 16,
    color: colors.sageGreen,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
