import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Color palette from design doc
const colors = {
  hearthOrange: '#E85D04',
  charcoal: '#2D3436',
  cream: '#FDF6E3',
  sageGreen: '#52796F',
};

export default function TonightScreen() {
  // TODO: Replace with real data from recommendation engine
  const meal = {
    name: 'Chicken Tikka Masala',
    subtitle: 'with Garlic Naan & Raita',
    time: 35,
    difficulty: 'Medium',
    cost: 8,
    reasoning: 'Uses the chicken expiring tomorrow + your leftover yogurt',
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HEARTHSTONE</Text>
      </View>

      <Text style={styles.sectionTitle}>Tonight</Text>

      <View style={styles.mealCard}>
        {/* Placeholder for meal image */}
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>🍛</Text>
        </View>

        <Text style={styles.mealName}>{meal.name}</Text>
        <Text style={styles.mealSubtitle}>{meal.subtitle}</Text>

        <View style={styles.metricsRow}>
          <Text style={styles.metric}>🕐 {meal.time} min</Text>
          <Text style={styles.metric}>🔥 {meal.difficulty}</Text>
          <Text style={styles.metric}>💰 £{meal.cost}</Text>
        </View>

        <Text style={styles.reasoning}>"{meal.reasoning}"</Text>

        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>LET'S COOK</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryLink}>
          <Text style={styles.secondaryLinkText}>Not tonight →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.partnerStatus}>
        <Text style={styles.partnerStatusText}>Partner: Alex is home at 6:30</Text>
        <Text style={styles.partnerStatusText}>Prep done: Rice is ready ✓</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
    marginBottom: 16,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imagePlaceholder: {
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePlaceholderText: {
    fontSize: 64,
  },
  mealName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: 4,
  },
  mealSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metric: {
    fontSize: 14,
    color: colors.charcoal,
  },
  reasoning: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#6B7280',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: colors.hearthOrange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryLink: {
    alignItems: 'center',
  },
  secondaryLinkText: {
    color: '#6B7280',
    fontSize: 14,
  },
  partnerStatus: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(82, 121, 111, 0.1)',
    borderRadius: 12,
  },
  partnerStatusText: {
    fontSize: 14,
    color: colors.sageGreen,
    marginBottom: 4,
  },
});
