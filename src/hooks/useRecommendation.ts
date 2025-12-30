import { useState, useCallback } from 'react';
import type { MealRecommendation, InventoryItem, Recipe } from '../types';
import { useInventoryStore } from '../stores/inventoryStore';
import { useUserStore } from '../stores/userStore';
import { useMealPlanStore } from '../stores/mealPlanStore';

interface UseRecommendationReturn {
  recommendation: MealRecommendation | null;
  isLoading: boolean;
  error: string | null;
  fetchRecommendation: () => Promise<void>;
  rejectAndGetNext: (reason?: string) => Promise<void>;
}

export function useRecommendation(): UseRecommendationReturn {
  const [recommendation, setRecommendation] = useState<MealRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { items: inventory, getExpiringSoon } = useInventoryStore();
  const { user } = useUserStore();
  const { setTodayRecommendation } = useMealPlanStore();

  const fetchRecommendation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const expiring = getExpiringSoon(5);
      const preferences = user?.preferences;

      // TODO: Replace with actual AI API call
      // This will call the Deno proxy -> Gemini API
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventory: inventory.map((item) => ({
            name: item.name,
            expiryDate: item.expiryDate,
            location: item.location,
          })),
          expiringSoon: expiring.map((item) => item.name),
          preferences: {
            dietary: preferences?.dietaryRestrictions ?? [],
            disliked: preferences?.dislikedIngredients ?? [],
            maxTime: preferences?.weeknightMaxTime ?? 45,
            skillLevel: preferences?.cookingSkillLevel ?? 'intermediate',
          },
          isWeekend: [0, 6].includes(new Date().getDay()),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendation');
      }

      const data: MealRecommendation = await response.json();
      setRecommendation(data);
      setTodayRecommendation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [inventory, getExpiringSoon, user, setTodayRecommendation]);

  const rejectAndGetNext = useCallback(
    async (reason?: string) => {
      // TODO: Log rejection reason for learning
      console.log('Rejected recommendation:', reason);
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
