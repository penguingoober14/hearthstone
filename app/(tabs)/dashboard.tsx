import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
  hearthOrange: '#E85D04',
  charcoal: '#2D3436',
  cream: '#FDF6E3',
  sageGreen: '#52796F',
};

export default function DashboardScreen() {
  // TODO: Replace with real data from stores
  const stats = {
    streak: 14,
    monthSaved: 247,
    monthMeals: 18,
    weeklyHoursSaved: 2.1,
    itemsSaved: 12,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your Kitchen Story</Text>

        {/* Streak Card */}
        <View style={styles.streakCard}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNumber}>{stats.streak}-DAY STREAK</Text>
          <Text style={styles.streakSubtitle}>Your longest yet!</Text>
        </View>

        {/* Monthly Stats */}
        <Text style={styles.sectionTitle}>This Month</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>£{stats.monthSaved}</Text>
            <Text style={styles.statLabel}>saved vs eat out</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.monthMeals}</Text>
            <Text style={styles.statLabel}>meals cooked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.weeklyHoursSaved}</Text>
            <Text style={styles.statLabel}>hrs/wk saved</Text>
          </View>
        </View>

        {/* Food Rescue */}
        <View style={styles.rescueCard}>
          <Text style={styles.rescueTitle}>Food Rescue</Text>
          <Text style={styles.rescueEmoji}>🥕🥦🍗</Text>
          <Text style={styles.rescueText}>{stats.itemsSaved} items saved from expiring this month</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
          <Text style={styles.progressLabel}>vs last month</Text>
        </View>

        {/* Taste Journey */}
        <View style={styles.journeyCard}>
          <Text style={styles.journeyTitle}>Taste Journey</Text>
          <Text style={styles.journeyText}>8 cuisines explored</Text>
          <Text style={styles.journeyHighlight}>NEW: Thai unlocked! 🇹🇭</Text>
        </View>

        {/* Together Stats */}
        <View style={styles.togetherCard}>
          <Text style={styles.togetherText}>
            You & Alex cooked 73% of meals together this month 💕
          </Text>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
    marginTop: 20,
    marginBottom: 12,
  },
  streakCard: {
    backgroundColor: colors.hearthOrange,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  streakEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  rescueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  rescueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 12,
  },
  rescueEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  rescueText: {
    fontSize: 14,
    color: colors.charcoal,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.sageGreen,
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  journeyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  journeyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 8,
  },
  journeyText: {
    fontSize: 14,
    color: colors.charcoal,
  },
  journeyHighlight: {
    fontSize: 14,
    color: colors.hearthOrange,
    fontWeight: '600',
    marginTop: 4,
  },
  togetherCard: {
    backgroundColor: 'rgba(82, 121, 111, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  togetherText: {
    fontSize: 16,
    color: colors.sageGreen,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
