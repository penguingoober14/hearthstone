import { useState, useCallback, useRef } from 'react';
import type { MealRecommendation, Recipe } from '../types';
import { useInventoryStore } from '../stores/inventoryStore';
import { useUserStore } from '../stores/userStore';
import { useMealPlanStore } from '../stores/mealPlanStore';
import { SAMPLE_RECIPES, createSampleRecommendation } from '../data/sampleRecipes';

interface UseRecommendationReturn {
  recommendation: MealRecommendation | null;
  isLoading: boolean;
  error: string | null;
  fetchRecommendation: () => Promise<void>;
  rejectAndGetNext: (reason?: string) => Promise<void>;
}

/**
 * Generate reasoning text based on context
 */
function generateReasoning(
  recipe: Recipe,
  expiringItems: string[],
  isWeekend: boolean
): string {
  const reasons: string[] = [];

  // Check for expiring ingredients that match recipe
  const matchingExpiring = expiringItems.filter((item) =>
    recipe.ingredients.some((ing) =>
      ing.name.toLowerCase().includes(item.toLowerCase()) ||
      item.toLowerCase().includes(ing.name.toLowerCase())
    )
  );

  if (matchingExpiring.length > 0) {
    reasons.push(`Uses ${matchingExpiring.join(' and ')} before they expire`);
  }

  // Difficulty-based reasoning
  if (recipe.difficulty === 'easy') {
    reasons.push('Quick and easy for a weeknight');
  } else if (recipe.difficulty === 'hard' && isWeekend) {
    reasons.push('A fun weekend cooking challenge');
  }

  // Time-based reasoning
  const totalTime = recipe.prepTime + recipe.cookTime;
  if (totalTime <= 30) {
    reasons.push('Ready in under 30 minutes');
  }

  // Cuisine variety
  reasons.push(`Try some ${recipe.cuisine} cuisine tonight`);

  // Return a random subset of reasons
  const selectedReasons = reasons.slice(0, 2);
  return selectedReasons.join(' • ') || 'A delicious meal for tonight';
}

export function useRecommendation(): UseRecommendationReturn {
  const [recommendation, setRecommendation] = useState<MealRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRecipeIndex = useRef<number>(-1);

  const { getExpiringSoon } = useInventoryStore();
  const { user } = useUserStore();
  const { setTodayRecommendation } = useMealPlanStore();

  const fetchRecommendation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate network delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      const expiring = getExpiringSoon(5);
      const expiringNames = expiring.map((item) => item.name);
      const preferences = user?.preferences;
      const isWeekend = [0, 6].includes(new Date().getDay());
      const maxTime = isWeekend
        ? (preferences?.weekendMaxTime ?? 90)
        : (preferences?.weeknightMaxTime ?? 45);

      // Filter recipes based on preferences
      let availableRecipes = SAMPLE_RECIPES.filter((recipe) => {
        // Filter by time
        const totalTime = recipe.prepTime + recipe.cookTime;
        if (totalTime > maxTime) return false;

        // Filter by dietary restrictions
        if (preferences?.dietaryRestrictions?.length) {
          // Simple check - in production, recipes would have dietary tags
        }

        return true;
      });

      // If all filtered out, use all recipes
      if (availableRecipes.length === 0) {
        availableRecipes = SAMPLE_RECIPES;
      }

      // Select a different recipe than last time if possible
      let recipeIndex: number;
      if (availableRecipes.length === 1) {
        recipeIndex = 0;
      } else {
        do {
          recipeIndex = Math.floor(Math.random() * availableRecipes.length);
        } while (recipeIndex === lastRecipeIndex.current && availableRecipes.length > 1);
      }
      lastRecipeIndex.current = recipeIndex;

      const selectedRecipe = availableRecipes[recipeIndex];
      const reasoning = generateReasoning(selectedRecipe, expiringNames, isWeekend);

      // Find matching expiring inventory items
      const matchingExpiring = expiring.filter((item) =>
        selectedRecipe.ingredients.some((ing) =>
          ing.name.toLowerCase().includes(item.name.toLowerCase()) ||
          item.name.toLowerCase().includes(ing.name.toLowerCase())
        )
      );

      // Calculate missing ingredients (simplified)
      const missingIngredients = selectedRecipe.ingredients
        .filter((ing) => !ing.optional)
        .filter((ing) => !expiring.some((item) =>
          item.name.toLowerCase().includes(ing.name.toLowerCase())
        ))
        .slice(0, 3)
        .map((ing) => ing.name);

      const newRecommendation = createSampleRecommendation(selectedRecipe, {
        reasoning,
        expiringIngredients: matchingExpiring,
        missingIngredients,
        score: 0.75 + Math.random() * 0.2, // 0.75 - 0.95
        estimatedSavings: matchingExpiring.length * 3, // £3 per expiring item used
      });

      setRecommendation(newRecommendation);
      setTodayRecommendation(newRecommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [getExpiringSoon, user, setTodayRecommendation]);

  const rejectAndGetNext = useCallback(
    async (_reason?: string) => {
      await fetchRecommendation();
    },
    [fetchRecommendation]
  );

  return {
    recommendation,
    isLoading,
    error,
    fetchRecommendation,
    rejectAndGetNext,
  };
}
