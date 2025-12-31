import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgressStore } from '../../src/stores';
import { useStreak } from '../../src/hooks';
import type { Challenge, Achievement } from '../../src/types';
import { colors, spacing, borderRadius, shadows, glows } from '../../src/lib/theme';
import { containers, cards, layout, accents } from '../../src/lib/globalStyles';
import { Typography, BadgePill, ProgressBar, AnimatedCard } from '../../src/components';

// Hardcoded couple challenge (until we have couple store)
const coupleChallenge = {
  title: 'Cook Together',
  progress: 4,
  total: 5,
  subtitle: "This week's goal",
};

// Helper to get badge variant based on challenge type
const getChallengeTypeVariant = (type: string): 'primary' | 'success' | 'warning' => {
  switch (type) {
    case 'daily':
      return 'primary';
    case 'weekly':
      return 'success';
    case 'special':
      return 'warning';
    default:
      return 'primary';
  }
};

// Helper to get border color based on challenge type
const getChallengeBorderColor = (type: string): string => {
  switch (type) {
    case 'daily':
      return colors.hearthOrange;
    case 'weekly':
      return colors.sageGreen;
    case 'special':
      return colors.info;
    default:
      return colors.hearthOrange;
  }
};

export default function QuestScreen() {
  const { progress, activeChallenges } = useProgressStore();
  const { streakMessage, currentStreak, nextMilestone } = useStreak();

  const xpPercentage = (progress.currentXP / progress.nextLevelXP) * 100;

  // Get earned achievements (those with unlockedAt date)
  const earnedAchievements = progress.achievements.filter(
    (a: Achievement) => a.unlockedAt !== null
  );

  // Get remaining count for "+N more" display
  const remainingAchievementsCount = Math.max(
    0,
    progress.achievements.length - earnedAchievements.length
  );

  const handleViewChallenge = (challenge: Challenge) => {
    const progressPercent = Math.round((challenge.progress / challenge.target) * 100);
    const rewardText = challenge.reward.badge
      ? `${challenge.reward.xp} XP + ${challenge.reward.badge.emoji} ${challenge.reward.badge.name}`
      : `${challenge.reward.xp} XP`;

    Alert.alert(
      `${challenge.emoji} ${challenge.title}`,
      `${challenge.description}\n\nProgress: ${challenge.progress}/${challenge.target} (${progressPercent}%)\nType: ${challenge.type}\nReward: ${rewardText}\n\nExpires: ${new Date(challenge.expiresAt).toLocaleDateString()}`,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const handleBrowseAllChallenges = () => {
    Alert.alert(
      'Available Challenges',
      'Challenge browser coming soon! Check back for new daily, weekly, and special challenges.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleViewAllAchievements = () => {
    const achievementsList = progress.achievements
      .map((a: Achievement) => {
        const status = a.unlockedAt ? 'Unlocked' : `${a.progress}/${a.target}`;
        return `${a.emoji} ${a.name} - ${status}`;
      })
      .join('\n');

    Alert.alert(
      'All Achievements',
      achievementsList || 'No achievements yet. Start cooking to earn your first!',
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const formatReward = (challenge: Challenge): string => {
    if (challenge.reward.badge) {
      return `${challenge.reward.xp} XP + ${challenge.reward.badge.emoji}`;
    }
    return `${challenge.reward.xp} XP`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Level Header */}
        <View style={styles.levelHeader}>
          <Typography variant="h1">Kitchen Quest</Typography>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lvl {progress.level}</Text>
          </View>
        </View>

        {/* XP Progress */}
        <View style={styles.xpContainer}>
          <ProgressBar
            progress={xpPercentage}
            height={12}
            color={colors.hearthOrange}
          />
          <Typography variant="caption" style={styles.xpText}>
            {progress.currentXP.toLocaleString()} / {progress.nextLevelXP.toLocaleString()} XP
          </Typography>
        </View>

        {/* Streak Section */}
        {currentStreak > 0 && (
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>
              {nextMilestone?.emoji || '🔥'}
            </Text>
            <Typography variant="h4" style={styles.streakMessage}>{streakMessage}</Typography>
            {nextMilestone && (
              <Typography variant="bodySmall" style={styles.nextMilestoneText}>
                Next: {nextMilestone.label} ({nextMilestone.days - currentStreak} days away)
              </Typography>
            )}
          </View>
        )}

        {/* Active Challenges */}
        <Typography variant="h4" style={styles.sectionTitle}>Active Challenges</Typography>
        {activeChallenges.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Typography variant="bodySmall" color={colors.gray500} style={styles.emptyText}>
              No active challenges - check back tomorrow!
            </Typography>
          </View>
        ) : (
          activeChallenges.map((challenge: Challenge, index: number) => (
            <AnimatedCard
              key={challenge.id}
              style={[
                styles.challengeCard,
                { borderTopColor: getChallengeBorderColor(challenge.type) }
              ]}
              onPress={() => handleViewChallenge(challenge)}
              animateOnMount
              mountDelay={index * 100}
              elevation="md"
            >
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
                <View style={styles.challengeInfo}>
                  <View style={styles.challengeTitleRow}>
                    <Typography variant="h4" style={styles.challengeTitle}>{challenge.title}</Typography>
                    <BadgePill
                      label={challenge.type}
                      variant={getChallengeTypeVariant(challenge.type)}
                      size="sm"
                    />
                  </View>
                  <Typography variant="bodySmall" style={styles.challengeDesc}>{challenge.description}</Typography>
                </View>
              </View>
              <View style={styles.challengeProgress}>
                <View style={styles.progressBarWrapper}>
                  <ProgressBar
                    progress={(challenge.progress / challenge.target) * 100}
                    height={8}
                    color={colors.sageGreen}
                  />
                </View>
                <Typography variant="body" style={styles.progressText}>
                  {challenge.progress}/{challenge.target}
                </Typography>
              </View>
              <Typography variant="bodySmall" color={colors.sageGreen} style={styles.rewardText}>
                Reward: {formatReward(challenge)}
              </Typography>
              <View style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View</Text>
              </View>
            </AnimatedCard>
          ))
        )}

        {/* Achievements */}
        <Typography variant="h4" style={styles.sectionTitle}>Achievements</Typography>
        <View style={styles.achievementsCard}>
          {earnedAchievements.length === 0 ? (
            <Typography variant="bodySmall" color={colors.gray500} style={styles.noAchievementsText}>
              No achievements yet. Start cooking to earn your first!
            </Typography>
          ) : (
            <>
              <View style={styles.achievementsGrid}>
                {earnedAchievements.slice(0, 6).map((achievement: Achievement) => (
                  <View key={achievement.id} style={styles.achievementCircle}>
                    <Text style={styles.achievementEmoji}>
                      {achievement.emoji}
                    </Text>
                  </View>
                ))}
                {(earnedAchievements.length > 6 || remainingAchievementsCount > 0) && (
                  <View style={styles.moreAchievements}>
                    <Text style={styles.moreText}>
                      +{Math.max(earnedAchievements.length - 6, 0) + remainingAchievementsCount}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity onPress={handleViewAllAchievements}>
                <Text style={styles.viewAllLink}>All →</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Couple Challenges */}
        <Typography variant="h4" style={styles.sectionTitle}>Couple Challenges</Typography>
        <View style={styles.coupleCard}>
          <Text style={styles.coupleEmoji}>👫</Text>
          <Typography variant="h4" style={styles.coupleTitle}>
            {coupleChallenge.title}: {coupleChallenge.progress}/{coupleChallenge.total} meals
          </Typography>
          <Typography variant="bodySmall" style={styles.coupleSubtitle}>
            {coupleChallenge.subtitle}
          </Typography>
          <Typography variant="bodySmall" color={colors.sageGreen} style={styles.coupleMotivation}>
            "One more for the badge!"
          </Typography>
        </View>

        {/* Browse All */}
        <TouchableOpacity style={styles.browseButton} onPress={handleBrowseAllChallenges}>
          <Text style={styles.browseButtonText}>Browse All Challenges →</Text>
        </TouchableOpacity>
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
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelBadge: {
    backgroundColor: colors.hearthOrange,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
    ...glows.glowOrange,
  },
  levelBadgeText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  xpContainer: {
    marginBottom: spacing.xxl,
  },
  xpText: {
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  streakCard: {
    backgroundColor: colors.hearthOrangeLight,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...glows.glowOrange,
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  streakMessage: {
    textAlign: 'center',
  },
  nextMilestoneText: {
    marginTop: spacing.xs,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
  },
  challengeCard: {
    marginBottom: spacing.md,
    borderTopWidth: 3,
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  challengeEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeTitle: {
    flex: 1,
    marginRight: spacing.sm,
  },
  challengeDesc: {
    marginTop: spacing.xs,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressBarWrapper: {
    flex: 1,
    marginRight: spacing.md,
  },
  progressText: {
    fontWeight: '500',
  },
  rewardText: {
    marginBottom: spacing.sm,
  },
  viewButton: {
    alignSelf: 'flex-end',
  },
  viewButtonText: {
    color: colors.hearthOrange,
    fontWeight: '600',
  },
  achievementsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  achievementCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementEmoji: {
    fontSize: 24,
  },
  moreAchievements: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.gray600,
  },
  noAchievementsText: {
    textAlign: 'center',
  },
  viewAllLink: {
    color: colors.hearthOrange,
    textAlign: 'right',
    fontWeight: '600',
  },
  coupleCard: {
    backgroundColor: colors.sageGreenLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.sageGreen,
    ...shadows.sm,
  },
  coupleEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  coupleTitle: {
    textAlign: 'center',
  },
  coupleSubtitle: {
    marginTop: spacing.xs,
  },
  coupleMotivation: {
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  browseButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colors.hearthOrange,
    ...shadows.sm,
  },
  browseButtonText: {
    color: colors.hearthOrange,
    fontSize: 16,
    fontWeight: '600',
  },
});
