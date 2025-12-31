import type { Recipe, MealRecommendation, InventoryItem } from '../types';

/**
 * Sample recipes for testing and development
 * These will eventually be replaced by actual recipe data from a backend
 */

export const CHICKEN_TIKKA_MASALA: Recipe = {
  id: 'demo_recipe_tikka_masala',
  name: 'Chicken Tikka Masala',
  description: 'Classic Indian curry with tender chicken in creamy tomato sauce',
  imageUrl: null,
  prepTime: 15,
  cookTime: 25,
  servings: 4,
  difficulty: 'medium',
  cuisine: 'Indian',
  ingredients: [
    // Marinade
    { name: 'chicken breast', amount: 500, unit: 'g', optional: false },
    { name: 'plain yogurt', amount: 150, unit: 'g', optional: false },
    { name: 'garam masala', amount: 1, unit: 'tbsp', optional: false },
    { name: 'turmeric powder', amount: 1, unit: 'tsp', optional: false },
    { name: 'cumin powder', amount: 1, unit: 'tsp', optional: false },
    { name: 'paprika', amount: 1, unit: 'tsp', optional: false },
    { name: 'salt', amount: 1, unit: 'tsp', optional: false },
    { name: 'lemon juice', amount: 2, unit: 'tbsp', optional: false },
    // Sauce
    { name: 'butter', amount: 30, unit: 'g', optional: false },
    { name: 'olive oil', amount: 1, unit: 'tbsp', optional: false },
    { name: 'onion', amount: 1, unit: 'large', optional: false },
    { name: 'garlic cloves', amount: 4, unit: 'cloves', optional: false },
    { name: 'fresh ginger', amount: 2, unit: 'cm', optional: false },
    { name: 'tomato passata', amount: 400, unit: 'g', optional: false },
    { name: 'heavy cream', amount: 200, unit: 'ml', optional: false },
    { name: 'fresh coriander', amount: 1, unit: 'handful', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Cut chicken into bite-sized pieces. In a bowl, mix yogurt, garam masala, turmeric, cumin, paprika, salt, and lemon juice.',
      duration: 5,
      tip: 'Marinate for at least 30 minutes for best flavor, or overnight in the fridge.',
    },
    {
      order: 2,
      instruction: 'Add chicken to marinade, ensuring all pieces are well coated. Cover and refrigerate.',
      duration: 5,
      tip: null,
    },
    {
      order: 3,
      instruction: 'Heat oil in a large pan over medium-high heat. Cook marinated chicken pieces until charred and cooked through, about 4-5 minutes per side. Set aside.',
      duration: 10,
      tip: 'Work in batches to avoid overcrowding - this ensures proper browning.',
    },
    {
      order: 4,
      instruction: 'In the same pan, melt butter over medium heat. Add finely diced onion and cook until softened and golden.',
      duration: 5,
      tip: null,
    },
    {
      order: 5,
      instruction: 'Add minced garlic and grated ginger, stir for 1 minute until fragrant.',
      duration: 1,
      tip: 'Be careful not to burn the garlic.',
    },
    {
      order: 6,
      instruction: 'Pour in tomato passata and stir well. Simmer for 5 minutes.',
      duration: 5,
      tip: null,
    },
    {
      order: 7,
      instruction: 'Reduce heat to low, stir in heavy cream, and add the cooked chicken back to the pan. Simmer for 5 more minutes.',
      duration: 5,
      tip: 'Taste and adjust salt and spices if needed.',
    },
    {
      order: 8,
      instruction: 'Garnish with fresh coriander and serve hot with basmati rice or naan bread.',
      duration: 2,
      tip: 'Serve in a shared bowl for a more intimate dining experience!',
    },
  ],
  tags: ['curry', 'chicken', 'indian', 'comfort-food', 'date-night'],
  estimatedCost: 12,
};

export const PASTA_CARBONARA: Recipe = {
  id: 'demo_recipe_carbonara',
  name: 'Spaghetti Carbonara',
  description: 'Creamy Italian pasta with crispy pancetta and parmesan',
  imageUrl: null,
  prepTime: 10,
  cookTime: 20,
  servings: 2,
  difficulty: 'medium',
  cuisine: 'Italian',
  ingredients: [
    { name: 'spaghetti', amount: 200, unit: 'g', optional: false },
    { name: 'pancetta or guanciale', amount: 150, unit: 'g', optional: false },
    { name: 'egg yolks', amount: 4, unit: 'large', optional: false },
    { name: 'parmesan cheese', amount: 100, unit: 'g', optional: false },
    { name: 'black pepper', amount: 2, unit: 'tsp', optional: false },
    { name: 'salt', amount: 1, unit: 'tsp', optional: false },
    { name: 'garlic clove', amount: 1, unit: 'clove', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Bring a large pot of salted water to boil. Cook spaghetti according to package directions until al dente.',
      duration: 10,
      tip: 'Reserve 1 cup of pasta water before draining!',
    },
    {
      order: 2,
      instruction: 'While pasta cooks, cut pancetta into small cubes and fry in a cold pan, gradually increasing heat until crispy.',
      duration: 8,
      tip: 'Starting cold renders the fat slowly for extra crispiness.',
    },
    {
      order: 3,
      instruction: 'In a bowl, whisk egg yolks with grated parmesan and plenty of black pepper.',
      duration: 2,
      tip: null,
    },
    {
      order: 4,
      instruction: 'Remove pan from heat. Add drained pasta to the pancetta, toss to coat in the fat.',
      duration: 1,
      tip: 'The pan must be OFF the heat for the next step to avoid scrambled eggs.',
    },
    {
      order: 5,
      instruction: 'Pour egg mixture over pasta, tossing constantly. Add pasta water as needed to create a silky sauce.',
      duration: 2,
      tip: 'Keep tossing! The residual heat will cook the eggs gently.',
    },
    {
      order: 6,
      instruction: 'Serve immediately with extra parmesan and black pepper on top.',
      duration: 1,
      tip: 'Carbonara waits for no one - serve it right away!',
    },
  ],
  tags: ['pasta', 'italian', 'quick', 'comfort-food', 'date-night'],
  estimatedCost: 8,
};

export const STIR_FRY_VEGETABLES: Recipe = {
  id: 'demo_recipe_stirfry',
  name: 'Garlic Ginger Stir-Fry',
  description: 'Quick and healthy vegetable stir-fry with tofu',
  imageUrl: null,
  prepTime: 15,
  cookTime: 10,
  servings: 2,
  difficulty: 'easy',
  cuisine: 'Chinese',
  ingredients: [
    { name: 'firm tofu', amount: 400, unit: 'g', optional: false },
    { name: 'broccoli florets', amount: 200, unit: 'g', optional: false },
    { name: 'bell peppers', amount: 2, unit: 'medium', optional: false },
    { name: 'snap peas', amount: 150, unit: 'g', optional: false },
    { name: 'garlic cloves', amount: 4, unit: 'cloves', optional: false },
    { name: 'fresh ginger', amount: 3, unit: 'cm', optional: false },
    { name: 'soy sauce', amount: 3, unit: 'tbsp', optional: false },
    { name: 'sesame oil', amount: 2, unit: 'tbsp', optional: false },
    { name: 'vegetable oil', amount: 2, unit: 'tbsp', optional: false },
    { name: 'cornstarch', amount: 1, unit: 'tbsp', optional: false },
    { name: 'sesame seeds', amount: 1, unit: 'tbsp', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Press tofu for 15 minutes, then cut into cubes. Toss with cornstarch and a pinch of salt.',
      duration: 3,
      tip: 'Pressing removes excess water for crispier tofu.',
    },
    {
      order: 2,
      instruction: 'Heat vegetable oil in a wok over high heat. Fry tofu until golden on all sides, then set aside.',
      duration: 5,
      tip: 'Dont overcrowd the wok - work in batches if needed.',
    },
    {
      order: 3,
      instruction: 'Add more oil if needed. Stir-fry garlic and ginger for 30 seconds until fragrant.',
      duration: 1,
      tip: null,
    },
    {
      order: 4,
      instruction: 'Add broccoli and bell peppers. Stir-fry for 2-3 minutes, keeping vegetables crisp.',
      duration: 3,
      tip: null,
    },
    {
      order: 5,
      instruction: 'Add snap peas and tofu. Pour in soy sauce and sesame oil. Toss everything together.',
      duration: 2,
      tip: 'Taste and add more soy sauce if needed.',
    },
    {
      order: 6,
      instruction: 'Serve over rice, garnished with sesame seeds.',
      duration: 1,
      tip: 'Great for meal prep - keeps well for 3 days!',
    },
  ],
  tags: ['vegetarian', 'healthy', 'quick', 'asian', 'weeknight'],
  estimatedCost: 10,
};

// Sample inventory items for demo expiring ingredients
export const DEMO_EXPIRING_CHICKEN: InventoryItem = {
  id: 'demo_inv_chicken',
  name: 'Chicken Breast',
  emoji: '🍗',
  quantity: 500,
  unit: 'g',
  location: 'fridge',
  expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
  addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  category: 'protein',
};

export const DEMO_EXPIRING_YOGURT: InventoryItem = {
  id: 'demo_inv_yogurt',
  name: 'Plain Yogurt',
  emoji: '🥛',
  quantity: 200,
  unit: 'g',
  location: 'fridge',
  expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
  addedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  category: 'dairy',
};

/**
 * Create a sample recommendation from a recipe
 */
export function createSampleRecommendation(
  recipe: Recipe,
  options?: {
    reasoning?: string;
    expiringIngredients?: InventoryItem[];
    missingIngredients?: string[];
    score?: number;
    estimatedSavings?: number;
  }
): MealRecommendation {
  return {
    recipe,
    score: options?.score ?? 0.92,
    reasoning: options?.reasoning ?? 'A delicious meal perfect for tonight',
    expiringIngredients: options?.expiringIngredients ?? [],
    missingIngredients: options?.missingIngredients ?? [],
    estimatedSavings: options?.estimatedSavings ?? 5,
  };
}

/**
 * Get a demo recommendation for Chicken Tikka Masala with expiring ingredients
 */
export function getDemoTikkaMasalaRecommendation(): MealRecommendation {
  return createSampleRecommendation(CHICKEN_TIKKA_MASALA, {
    reasoning: 'Uses the chicken expiring tomorrow + your leftover yogurt',
    expiringIngredients: [DEMO_EXPIRING_CHICKEN, DEMO_EXPIRING_YOGURT],
    missingIngredients: ['garam masala', 'heavy cream'],
    score: 0.92,
    estimatedSavings: 8,
  });
}

/**
 * All available sample recipes
 */
export const SAMPLE_RECIPES: Recipe[] = [
  CHICKEN_TIKKA_MASALA,
  PASTA_CARBONARA,
  STIR_FRY_VEGETABLES,
];
