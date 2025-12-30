import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProgressStore } from '../../src/stores';
import { useStreak } from '../../src/hooks';
import type { Challenge, Achievement } from '../../src/types';

const colors = {
  hearthOrange: '#E85D04',
  charcoal: '#2D3436',
  cream: '#FDF6E3',
  sageGreen: '#52796F',
};

// Hardcoded couple challenge (until we have couple store)
const coupleChallenge = {
  title: 'Cook Together',
  progress: 4,
  total: 5,
  subtitle: "This week's goal",
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
          <Text style={styles.title}>Kitchen Quest</Text>
          <Text style={styles.levelBadge}>Lvl {progress.level}</Text>
        </View>

        {/* XP Progress */}
        <View style={styles.xpContainer}>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${xpPercentage}%` }]} />
          </View>
          <Text style={styles.xpText}>
            {progress.currentXP.toLocaleString()} / {progress.nextLevelXP.toLocaleString()} XP
          </Text>
        </View>

        {/* Streak Section */}
        {currentStreak > 0 && (
          <View style={styles.streakCard}>
            <Text style={styles.streakEmoji}>
              {nextMilestone?.emoji || '🔥'}
            </Text>
            <Text style={styles.streakMessage}>{streakMessage}</Text>
            {nextMilestone && (
              <Text style={styles.nextMilestoneText}>
                Next: {nextMilestone.label} ({nextMilestone.days - currentStreak} days away)
              </Text>
            )}
          </View>
        )}

        {/* Active Challenges */}
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        {activeChallenges.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>
              No active challenges - check back tomorrow!
            </Text>
          </View>
        ) : (
          activeChallenges.map((challenge: Challenge) => (
            <View key={challenge.id} style={styles.challengeCard}>
              <View style={styles.challengeHeader}>
                <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
                <View style={styles.challengeInfo}>
                  <View style={styles.challengeTitleRow}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    <Text style={styles.challengeType}>{challenge.type}</Text>
                  </View>
                  <Text style={styles.challengeDesc}>{challenge.description}</Text>
                </View>
              </View>
              <View style={styles.challengeProgress}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(challenge.progress / challenge.target) * 100}%` }
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {challenge.progress}/{challenge.target}
                </Text>
              </View>
              <Text style={styles.rewardText}>Reward: {formatReward(challenge)}</Text>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => handleViewChallenge(challenge)}
              >
                <Text style={styles.viewButtonText}>View -&gt;</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Achievements */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsCard}>
          {earnedAchievements.length === 0 ? (
            <Text style={styles.noAchievementsText}>
              No achievements yet. Start cooking to earn your first!
            </Text>
          ) : (
            <>
              <View style={styles.achievementsRow}>
                {earnedAchievements.slice(0, 6).map((achievement: Achievement) => (
                  <Text key={achievement.id} style={styles.achievementEmoji}>
                    {achievement.emoji}
                  </Text>
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
                <Text style={styles.viewAllLink}>All -&gt;</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Couple Challenges */}
        <Text style={styles.sectionTitle}>Couple Challenges</Text>
        <View style={styles.coupleCard}>
          <Text style={styles.coupleEmoji}>👫</Text>
          <Text style={styles.coupleTitle}>
            {coupleChallenge.title}: {coupleChallenge.progress}/{coupleChallenge.total} meals
          </Text>
          <Text style={styles.coupleSubtitle}>{coupleChallenge.subtitle}</Text>
          <Text style={styles.coupleMotivation}>"One more for the badge!"</Text>
        </View>

        {/* Browse All */}
        <TouchableOpacity style={styles.browseButton} onPress={handleBrowseAllChallenges}>
          <Text style={styles.browseButtonText}>Browse All Challenges -&gt;</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: 20,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  levelBadge: {
    backgroundColor: colors.hearthOrange,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  xpContainer: {
    marginBottom: 24,
  },
  xpBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.hearthOrange,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  streakCard: {
    backgroundColor: 'rgba(232, 93, 4, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  streakEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  streakMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal,
    textAlign: 'center',
  },
  nextMilestoneText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 12,
    marginTop: 8,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  challengeEmoji: {
    fontSize: 32,
    marginRight: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal,
    flex: 1,
  },
  challengeType: {
    fontSize: 12,
    color: colors.hearthOrange,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginLeft: 8,
  },
  challengeDesc: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  challengeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.sageGreen,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: colors.charcoal,
    fontWeight: '500',
  },
  rewardText: {
    fontSize: 13,
    color: colors.sageGreen,
    marginBottom: 8,
  },
  viewButton: {
    alignSelf: 'flex-end',
  },
  viewButtonText: {
    color: colors.hearthOrange,
    fontWeight: '600',
  },
  achievementsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  achievementsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementEmoji: {
    fontSize: 28,
    marginRight: 8,
  },
  moreAchievements: {
    backgroundColor: '#E5E7EB',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  noAchievementsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  viewAllLink: {
    color: colors.hearthOrange,
    textAlign: 'right',
    fontWeight: '600',
  },
  coupleCard: {
    backgroundColor: 'rgba(82, 121, 111, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  coupleEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  coupleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal,
  },
  coupleSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  coupleMotivation: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.sageGreen,
    marginTop: 8,
  },
  browseButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colors.hearthOrange,
  },
  browseButtonText: {
    color: colors.hearthOrange,
    fontSize: 16,
    fontWeight: '600',
  },
});
