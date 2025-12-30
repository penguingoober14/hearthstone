import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMealPlanStore, useUserStore } from '../../src/stores';

// Color palette from design doc
const colors = {
  hearthOrange: '#E85D04',
  charcoal: '#2D3436',
  cream: '#FDF6E3',
  sageGreen: '#52796F',
};

export default function TonightScreen() {
  // Get data from stores
  const { todayRecommendation, setTodayRecommendation, markCompleted, addPlan, isLoading } = useMealPlanStore();
  const { partner } = useUserStore();

  const handleLetsCook = () => {
    if (!todayRecommendation) return;

    // Add to meal plan and mark as completed
    addPlan({
      date: new Date(),
      mealType: 'dinner',
      recipe: todayRecommendation.recipe,
      notes: todayRecommendation.reasoning,
      completed: true,
      rating: null,
    });

    // Clear the recommendation after cooking
    setTodayRecommendation(null);
  };

  const handleNotTonight = () => {
    // Clear the recommendation (future: could implement rejectAndGetNext)
    setTodayRecommendation(null);
  };

  const handleGenerateRecommendation = () => {
    // TODO: Connect to recommendation engine
    // For now, set a sample recommendation for testing
    setTodayRecommendation({
      recipe: {
        id: 'sample_1',
        name: 'Chicken Tikka Masala',
        description: 'Classic Indian curry with tender chicken in creamy tomato sauce',
        imageUrl: null,
        prepTime: 15,
        cookTime: 20,
        servings: 4,
        difficulty: 'medium',
        cuisine: 'Indian',
        ingredients: [],
        steps: [],
        tags: ['curry', 'chicken', 'indian'],
        estimatedCost: 8,
      },
      score: 0.92,
      reasoning: 'Uses the chicken expiring tomorrow + your leftover yogurt',
      expiringIngredients: [],
      missingIngredients: [],
      estimatedSavings: 5,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>HEARTHSTONE</Text>
        </View>
        <Text style={styles.sectionTitle}>Tonight</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.hearthOrange} />
          <Text style={styles.loadingText}>Finding the perfect meal...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - no recommendation
  if (!todayRecommendation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>HEARTHSTONE</Text>
        </View>

        <Text style={styles.sectionTitle}>Tonight</Text>

        <View style={styles.emptyStateCard}>
          <Text style={styles.emptyStateEmoji}>🍳</Text>
          <Text style={styles.emptyStateTitle}>No meal planned yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Let us find the perfect dinner based on what you have in your kitchen
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGenerateRecommendation}
          >
            <Text style={styles.primaryButtonText}>GENERATE RECOMMENDATION</Text>
          </TouchableOpacity>
        </View>

        {partner && (
          <View style={styles.partnerStatus}>
            <Text style={styles.partnerStatusText}>
              Partner: {partner.name} is connected
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // Extract meal data from recommendation
  const { recipe, reasoning } = todayRecommendation;
  const totalTime = recipe.prepTime + recipe.cookTime;
  const difficultyDisplay = recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>HEARTHSTONE</Text>
      </View>

      <Text style={styles.sectionTitle}>Tonight</Text>

      <View style={styles.mealCard}>
        {/* Placeholder for meal image */}
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>
            {recipe.cuisine === 'Indian' ? '🍛' :
             recipe.cuisine === 'Italian' ? '🍝' :
             recipe.cuisine === 'Mexican' ? '🌮' :
             recipe.cuisine === 'Japanese' ? '🍱' :
             recipe.cuisine === 'Chinese' ? '🥡' : '🍽️'}
          </Text>
        </View>

        <Text style={styles.mealName}>{recipe.name}</Text>
        <Text style={styles.mealSubtitle}>{recipe.description}</Text>

        <View style={styles.metricsRow}>
          <Text style={styles.metric}>🕐 {totalTime} min</Text>
          <Text style={styles.metric}>🔥 {difficultyDisplay}</Text>
          <Text style={styles.metric}>💰 £{recipe.estimatedCost}</Text>
        </View>

        <Text style={styles.reasoning}>"{reasoning}"</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleLetsCook}
        >
          <Text style={styles.primaryButtonText}>LET'S COOK</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryLink}
          onPress={handleNotTonight}
        >
          <Text style={styles.secondaryLinkText}>Not tonight →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.partnerStatus}>
        {partner ? (
          <>
            <Text style={styles.partnerStatusText}>
              Partner: {partner.name} is connected
            </Text>
            <Text style={styles.partnerStatusText}>
              Serving {recipe.servings} people
            </Text>
          </>
        ) : (
          <Text style={styles.partnerStatusText}>
            Cooking for 1 tonight
          </Text>
        )}
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
  // Loading state styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.charcoal,
  },
  // Empty state styles
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  // Meal card styles
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
