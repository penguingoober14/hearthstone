import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
  hearthOrange: '#E85D04',
  charcoal: '#2D3436',
  cream: '#FDF6E3',
  sageGreen: '#52796F',
};

// Mock quest data
const userProgress = {
  level: 12,
  currentXP: 2340,
  nextLevelXP: 3000,
};

const activeChallenges = [
  {
    id: '1',
    title: 'World Tour: Thai Week',
    emoji: '🌍',
    description: 'Cook 3 Thai dishes',
    progress: 1,
    total: 3,
    reward: 'Thai recipe pack',
  },
  {
    id: '2',
    title: 'Zero Waste Week',
    emoji: '🥗',
    description: 'No food expires',
    progress: 5,
    total: 7,
    reward: '500 XP + badge',
  },
];

const achievements = ['🏆', '🔥', '👨‍🍳', '🌮', '🍝', '🥗'];

const coupleChallenge = {
  title: 'Cook Together',
  progress: 4,
  total: 5,
  subtitle: "This week's goal",
};

export default function QuestScreen() {
  const xpPercentage = (userProgress.currentXP / userProgress.nextLevelXP) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Level Header */}
        <View style={styles.levelHeader}>
          <Text style={styles.title}>Kitchen Quest</Text>
          <Text style={styles.levelBadge}>Lvl {userProgress.level}</Text>
        </View>

        {/* XP Progress */}
        <View style={styles.xpContainer}>
          <View style={styles.xpBar}>
            <View style={[styles.xpFill, { width: `${xpPercentage}%` }]} />
          </View>
          <Text style={styles.xpText}>
            {userProgress.currentXP.toLocaleString()} / {userProgress.nextLevelXP.toLocaleString()} XP
          </Text>
        </View>

        {/* Active Challenges */}
        <Text style={styles.sectionTitle}>Active Challenges</Text>
        {activeChallenges.map(challenge => (
          <View key={challenge.id} style={styles.challengeCard}>
            <View style={styles.challengeHeader}>
              <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
              <View style={styles.challengeInfo}>
                <Text style={styles.challengeTitle}>{challenge.title}</Text>
                <Text style={styles.challengeDesc}>{challenge.description}</Text>
              </View>
            </View>
            <View style={styles.challengeProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(challenge.progress / challenge.total) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {challenge.progress}/{challenge.total}
              </Text>
            </View>
            <Text style={styles.rewardText}>Reward: {challenge.reward}</Text>
            <TouchableOpacity style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View →</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Achievements */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achievementsCard}>
          <View style={styles.achievementsRow}>
            {achievements.map((emoji, index) => (
              <Text key={index} style={styles.achievementEmoji}>{emoji}</Text>
            ))}
            <View style={styles.moreAchievements}>
              <Text style={styles.moreText}>+12</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAllLink}>All →</Text>
          </TouchableOpacity>
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
        <TouchableOpacity style={styles.browseButton}>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 12,
    marginTop: 8,
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
  challengeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.charcoal,
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
