import type { Recipe, MealRecommendation, InventoryItem } from '../types';

/**
 * Sample recipes for testing and development
 * These will eventually be replaced by actual recipe data from a backend
 */

// ============================================================================
// BREAKFAST RECIPES (3)
// ============================================================================

export const AVOCADO_TOAST: Recipe = {
  id: 'recipe_avocado_toast',
  name: 'Avocado Toast with Poached Eggs',
  description: 'Creamy avocado on crispy sourdough topped with perfectly poached eggs',
  imageUrl: null,
  prepTime: 5,
  cookTime: 10,
  servings: 2,
  difficulty: 'easy',
  cuisine: 'American',
  ingredients: [
    { name: 'sourdough bread', amount: 2, unit: 'slices', optional: false },
    { name: 'ripe avocado', amount: 1, unit: 'large', optional: false },
    { name: 'eggs', amount: 2, unit: 'large', optional: false },
    { name: 'white vinegar', amount: 1, unit: 'tbsp', optional: false },
    { name: 'lime juice', amount: 1, unit: 'tsp', optional: false },
    { name: 'red pepper flakes', amount: 0.5, unit: 'tsp', optional: true },
    { name: 'salt', amount: 0.5, unit: 'tsp', optional: false },
    { name: 'black pepper', amount: 0.25, unit: 'tsp', optional: false },
    { name: 'cherry tomatoes', amount: 4, unit: 'pieces', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Bring a pot of water to a gentle simmer. Add white vinegar.',
      duration: 3,
      tip: 'The water should have small bubbles, not a rolling boil.',
    },
    {
      order: 2,
      instruction: 'Toast the sourdough bread until golden and crispy.',
      duration: 3,
      tip: null,
    },
    {
      order: 3,
      instruction: 'Mash avocado with lime juice, salt, and pepper in a bowl.',
      duration: 2,
      tip: 'Leave some chunks for texture if you prefer.',
    },
    {
      order: 4,
      instruction: 'Create a gentle whirlpool in the water and slide in the eggs one at a time. Poach for 3 minutes for runny yolks.',
      duration: 3,
      tip: 'Crack eggs into a small bowl first for easier sliding.',
    },
    {
      order: 5,
      instruction: 'Spread mashed avocado on toast, top with poached eggs, and garnish with red pepper flakes and halved cherry tomatoes.',
      duration: 2,
      tip: 'Season the eggs with a pinch of flaky salt for the perfect finish.',
    },
  ],
  tags: ['breakfast', 'healthy', 'quick', 'vegetarian'],
  estimatedCost: 6,
};

export const JAPANESE_TAMAGOYAKI: Recipe = {
  id: 'recipe_tamagoyaki',
  name: 'Tamagoyaki (Japanese Rolled Omelette)',
  description: 'Sweet and savory Japanese rolled egg omelette, perfect for breakfast or bento boxes',
  imageUrl: null,
  prepTime: 5,
  cookTime: 10,
  servings: 2,
  difficulty: 'medium',
  cuisine: 'Japanese',
  ingredients: [
    { name: 'eggs', amount: 4, unit: 'large', optional: false },
    { name: 'dashi stock', amount: 2, unit: 'tbsp', optional: false },
    { name: 'soy sauce', amount: 1, unit: 'tsp', optional: false },
    { name: 'mirin', amount: 1, unit: 'tbsp', optional: false },
    { name: 'sugar', amount: 1, unit: 'tsp', optional: false },
    { name: 'vegetable oil', amount: 1, unit: 'tbsp', optional: false },
    { name: 'green onions', amount: 1, unit: 'stalk', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Whisk eggs with dashi, soy sauce, mirin, and sugar until well combined.',
      duration: 2,
      tip: 'Strain the mixture through a sieve for silkier texture.',
    },
    {
      order: 2,
      instruction: 'Heat a rectangular tamagoyaki pan (or small non-stick pan) over medium heat. Lightly oil the surface.',
      duration: 1,
      tip: 'Use a paper towel dipped in oil to coat evenly.',
    },
    {
      order: 3,
      instruction: 'Pour a thin layer of egg mixture into the pan. When almost set, roll the egg from one end to the other.',
      duration: 3,
      tip: 'Use chopsticks or a spatula to help roll.',
    },
    {
      order: 4,
      instruction: 'Push the rolled egg to one side, oil the empty pan, and pour another thin layer. Lift the roll to let the new layer flow underneath.',
      duration: 2,
      tip: null,
    },
    {
      order: 5,
      instruction: 'Roll again, incorporating the new layer. Repeat until all egg mixture is used.',
      duration: 4,
      tip: 'Each roll creates more layers, making it fluffy.',
    },
    {
      order: 6,
      instruction: 'Let rest for 1 minute, then slice into rounds. Serve with grated daikon if desired.',
      duration: 1,
      tip: 'Shape it while hot using a bamboo mat for a neater appearance.',
    },
  ],
  tags: ['breakfast', 'japanese', 'bento', 'eggs'],
  estimatedCost: 4,
};

export const SHAKSHUKA: Recipe = {
  id: 'recipe_shakshuka',
  name: 'Shakshuka',
  description: 'North African poached eggs in spiced tomato sauce with peppers and onions',
  imageUrl: null,
  prepTime: 10,
  cookTime: 25,
  servings: 4,
  difficulty: 'easy',
  cuisine: 'Mediterranean',
  ingredients: [
    { name: 'eggs', amount: 6, unit: 'large', optional: false },
    { name: 'canned crushed tomatoes', amount: 800, unit: 'g', optional: false },
    { name: 'red bell pepper', amount: 1, unit: 'large', optional: false },
    { name: 'onion', amount: 1, unit: 'medium', optional: false },
    { name: 'garlic cloves', amount: 4, unit: 'cloves', optional: false },
    { name: 'cumin', amount: 1, unit: 'tsp', optional: false },
    { name: 'paprika', amount: 1, unit: 'tsp', optional: false },
    { name: 'cayenne pepper', amount: 0.25, unit: 'tsp', optional: true },
    { name: 'olive oil', amount: 2, unit: 'tbsp', optional: false },
    { name: 'feta cheese', amount: 50, unit: 'g', optional: true },
    { name: 'fresh parsley', amount: 2, unit: 'tbsp', optional: true },
    { name: 'crusty bread', amount: 4, unit: 'slices', optional: false },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Heat olive oil in a large skillet over medium heat. Add diced onion and bell pepper, cook until softened.',
      duration: 7,
      tip: null,
    },
    {
      order: 2,
      instruction: 'Add minced garlic, cumin, paprika, and cayenne. Stir for 1 minute until fragrant.',
      duration: 1,
      tip: 'Toast the spices briefly to release their full flavor.',
    },
    {
      order: 3,
      instruction: 'Pour in crushed tomatoes, season with salt and pepper. Simmer for 10 minutes until slightly thickened.',
      duration: 10,
      tip: null,
    },
    {
      order: 4,
      instruction: 'Make 6 wells in the sauce and crack an egg into each well. Cover and cook until whites are set but yolks are still runny.',
      duration: 6,
      tip: 'For firmer yolks, cook 1-2 minutes longer.',
    },
    {
      order: 5,
      instruction: 'Crumble feta on top, garnish with fresh parsley, and serve immediately with crusty bread.',
      duration: 2,
      tip: 'Serve straight from the pan for the best experience.',
    },
  ],
  tags: ['breakfast', 'mediterranean', 'eggs', 'vegetarian', 'one-pan'],
  estimatedCost: 9,
};

// ============================================================================
// LUNCH RECIPES (4)
// ============================================================================

export const CHICKEN_CAESAR_WRAP: Recipe = {
  id: 'recipe_caesar_wrap',
  name: 'Grilled Chicken Caesar Wrap',
  description: 'Classic Caesar salad wrapped in a warm tortilla with grilled chicken',
  imageUrl: null,
  prepTime: 15,
  cookTime: 12,
  servings: 2,
  difficulty: 'easy',
  cuisine: 'American',
  ingredients: [
    { name: 'chicken breast', amount: 250, unit: 'g', optional: false },
    { name: 'large flour tortillas', amount: 2, unit: 'pieces', optional: false },
    { name: 'romaine lettuce', amount: 4, unit: 'cups', optional: false },
    { name: 'parmesan cheese', amount: 50, unit: 'g', optional: false },
    { name: 'Caesar dressing', amount: 4, unit: 'tbsp', optional: false },
    { name: 'olive oil', amount: 1, unit: 'tbsp', optional: false },
    { name: 'garlic powder', amount: 0.5, unit: 'tsp', optional: false },
    { name: 'black pepper', amount: 0.5, unit: 'tsp', optional: false },
    { name: 'croutons', amount: 0.5, unit: 'cup', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Season chicken breast with olive oil, garlic powder, salt, and pepper.',
      duration: 2,
      tip: 'Pound the chicken to even thickness for more even cooking.',
    },
    {
      order: 2,
      instruction: 'Grill or pan-sear chicken over medium-high heat for 5-6 minutes per side until cooked through. Let rest for 3 minutes.',
      duration: 12,
      tip: 'Internal temperature should reach 165F/74C.',
    },
    {
      order: 3,
      instruction: 'Slice chicken into strips. Chop romaine lettuce and toss with Caesar dressing and shaved parmesan.',
      duration: 3,
      tip: null,
    },
    {
      order: 4,
      instruction: 'Warm tortillas in a dry pan for 30 seconds each side.',
      duration: 2,
      tip: 'Warm tortillas are more pliable and wont crack when rolled.',
    },
    {
      order: 5,
      instruction: 'Layer dressed salad and chicken strips on each tortilla. Add crushed croutons. Fold in sides and roll tightly.',
      duration: 2,
      tip: 'Cut diagonally for a nicer presentation.',
    },
  ],
  tags: ['lunch', 'chicken', 'wrap', 'quick', 'american'],
  estimatedCost: 8,
};

export const PAD_THAI: Recipe = {
  id: 'recipe_pad_thai',
  name: 'Pad Thai',
  description: 'Classic Thai stir-fried rice noodles with shrimp, tofu, and tamarind sauce',
  imageUrl: null,
  prepTime: 20,
  cookTime: 15,
  servings: 4,
  difficulty: 'medium',
  cuisine: 'Thai',
  ingredients: [
    { name: 'rice noodles', amount: 250, unit: 'g', optional: false },
    { name: 'shrimp', amount: 200, unit: 'g', optional: false },
    { name: 'firm tofu', amount: 150, unit: 'g', optional: false },
    { name: 'eggs', amount: 2, unit: 'large', optional: false },
    { name: 'tamarind paste', amount: 3, unit: 'tbsp', optional: false },
    { name: 'fish sauce', amount: 3, unit: 'tbsp', optional: false },
    { name: 'palm sugar', amount: 2, unit: 'tbsp', optional: false },
    { name: 'vegetable oil', amount: 3, unit: 'tbsp', optional: false },
    { name: 'garlic cloves', amount: 3, unit: 'cloves', optional: false },
    { name: 'bean sprouts', amount: 150, unit: 'g', optional: false },
    { name: 'green onions', amount: 3, unit: 'stalks', optional: false },
    { name: 'roasted peanuts', amount: 50, unit: 'g', optional: false },
    { name: 'lime', amount: 1, unit: 'piece', optional: false },
    { name: 'dried shrimp', amount: 2, unit: 'tbsp', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Soak rice noodles in warm water for 30 minutes until pliable but not soft. Drain well.',
      duration: 5,
      tip: 'Do not over-soak or noodles will become mushy when cooked.',
    },
    {
      order: 2,
      instruction: 'Mix tamarind paste, fish sauce, and palm sugar in a small bowl to make the sauce.',
      duration: 2,
      tip: 'Adjust sweetness and saltiness to taste.',
    },
    {
      order: 3,
      instruction: 'Heat oil in a wok over high heat. Fry cubed tofu until golden, then add shrimp and cook until pink. Set aside.',
      duration: 5,
      tip: null,
    },
    {
      order: 4,
      instruction: 'Add more oil if needed. Fry minced garlic until fragrant, then push to the side. Crack eggs into the wok and scramble.',
      duration: 2,
      tip: null,
    },
    {
      order: 5,
      instruction: 'Add drained noodles and sauce to the wok. Toss continuously until noodles are coated and softened.',
      duration: 3,
      tip: 'Add a splash of water if noodles stick.',
    },
    {
      order: 6,
      instruction: 'Return tofu and shrimp to the wok. Add bean sprouts and green onions. Toss briefly to combine.',
      duration: 2,
      tip: 'Dont overcook the bean sprouts - they should stay crunchy.',
    },
    {
      order: 7,
      instruction: 'Serve topped with crushed peanuts, extra bean sprouts, and lime wedges.',
      duration: 1,
      tip: 'A squeeze of lime brightens all the flavors.',
    },
  ],
  tags: ['lunch', 'thai', 'noodles', 'shrimp', 'wok'],
  estimatedCost: 14,
};

export const GREEK_SALAD: Recipe = {
  id: 'recipe_greek_salad',
  name: 'Classic Greek Salad',
  description: 'Fresh Mediterranean salad with tomatoes, cucumbers, olives, and feta cheese',
  imageUrl: null,
  prepTime: 15,
  cookTime: 0,
  servings: 4,
  difficulty: 'easy',
  cuisine: 'Mediterranean',
  ingredients: [
    { name: 'ripe tomatoes', amount: 4, unit: 'medium', optional: false },
    { name: 'cucumber', amount: 1, unit: 'large', optional: false },
    { name: 'red onion', amount: 0.5, unit: 'medium', optional: false },
    { name: 'green bell pepper', amount: 1, unit: 'medium', optional: false },
    { name: 'kalamata olives', amount: 100, unit: 'g', optional: false },
    { name: 'feta cheese', amount: 200, unit: 'g', optional: false },
    { name: 'extra virgin olive oil', amount: 4, unit: 'tbsp', optional: false },
    { name: 'red wine vinegar', amount: 2, unit: 'tbsp', optional: false },
    { name: 'dried oregano', amount: 1, unit: 'tsp', optional: false },
    { name: 'salt', amount: 0.5, unit: 'tsp', optional: false },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Cut tomatoes into wedges. Slice cucumber into half-moons. Thinly slice red onion into rings.',
      duration: 5,
      tip: 'Use ripe, in-season tomatoes for the best flavor.',
    },
    {
      order: 2,
      instruction: 'Cut bell pepper into rings or strips. Combine all vegetables in a large bowl.',
      duration: 3,
      tip: null,
    },
    {
      order: 3,
      instruction: 'Add kalamata olives to the salad.',
      duration: 1,
      tip: 'Use whole olives with pits for more authentic flavor.',
    },
    {
      order: 4,
      instruction: 'Whisk olive oil, red wine vinegar, oregano, and salt to make the dressing.',
      duration: 2,
      tip: 'Use high-quality extra virgin olive oil - it makes a difference.',
    },
    {
      order: 5,
      instruction: 'Drizzle dressing over salad. Place a large block of feta on top. Sprinkle with extra oregano.',
      duration: 2,
      tip: 'Traditionally, the feta is served as a whole block, not crumbled.',
    },
  ],
  tags: ['lunch', 'salad', 'mediterranean', 'vegetarian', 'healthy', 'no-cook'],
  estimatedCost: 10,
};

export const CHICKEN_QUESADILLA: Recipe = {
  id: 'recipe_quesadilla',
  name: 'Chicken Quesadilla',
  description: 'Crispy tortillas filled with seasoned chicken, melted cheese, and peppers',
  imageUrl: null,
  prepTime: 10,
  cookTime: 15,
  servings: 2,
  difficulty: 'easy',
  cuisine: 'Mexican',
  ingredients: [
    { name: 'chicken breast', amount: 200, unit: 'g', optional: false },
    { name: 'large flour tortillas', amount: 4, unit: 'pieces', optional: false },
    { name: 'cheddar cheese', amount: 150, unit: 'g', optional: false },
    { name: 'monterey jack cheese', amount: 100, unit: 'g', optional: false },
    { name: 'bell pepper', amount: 1, unit: 'medium', optional: false },
    { name: 'onion', amount: 0.5, unit: 'medium', optional: false },
    { name: 'cumin', amount: 1, unit: 'tsp', optional: false },
    { name: 'chili powder', amount: 0.5, unit: 'tsp', optional: false },
    { name: 'vegetable oil', amount: 2, unit: 'tbsp', optional: false },
    { name: 'sour cream', amount: 4, unit: 'tbsp', optional: true },
    { name: 'salsa', amount: 4, unit: 'tbsp', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Season chicken with cumin, chili powder, salt, and pepper. Cook in a hot pan with 1 tbsp oil until done. Slice into strips.',
      duration: 8,
      tip: 'Pound chicken thin for faster, more even cooking.',
    },
    {
      order: 2,
      instruction: 'Saute sliced bell pepper and onion until slightly softened. Set aside with chicken.',
      duration: 3,
      tip: null,
    },
    {
      order: 3,
      instruction: 'Shred both cheeses and mix together.',
      duration: 2,
      tip: 'A mix of cheeses gives better flavor and melt.',
    },
    {
      order: 4,
      instruction: 'Lay a tortilla in a dry pan over medium heat. Add cheese, chicken, and vegetables on one half. Fold tortilla in half.',
      duration: 1,
      tip: null,
    },
    {
      order: 5,
      instruction: 'Cook until bottom is golden and crispy, about 2 minutes. Flip and cook the other side.',
      duration: 4,
      tip: 'Press down gently with a spatula for crispier quesadillas.',
    },
    {
      order: 6,
      instruction: 'Cut into triangles and serve with sour cream and salsa.',
      duration: 1,
      tip: 'Let rest for 1 minute before cutting so cheese sets slightly.',
    },
  ],
  tags: ['lunch', 'mexican', 'chicken', 'quick', 'cheese'],
  estimatedCost: 8,
};

// ============================================================================
// DINNER RECIPES (10)
// ============================================================================

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
  tags: ['curry', 'chicken', 'indian', 'comfort-food', 'date-night', 'dinner'],
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
  tags: ['pasta', 'italian', 'quick', 'comfort-food', 'date-night', 'dinner'],
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
  tags: ['vegetarian', 'healthy', 'quick', 'asian', 'weeknight', 'dinner'],
  estimatedCost: 10,
};

export const BEEF_TACOS: Recipe = {
  id: 'recipe_beef_tacos',
  name: 'Authentic Mexican Beef Tacos',
  description: 'Seasoned ground beef tacos with fresh toppings and homemade salsa',
  imageUrl: null,
  prepTime: 15,
  cookTime: 15,
  servings: 4,
  difficulty: 'easy',
  cuisine: 'Mexican',
  ingredients: [
    { name: 'ground beef', amount: 500, unit: 'g', optional: false },
    { name: 'corn tortillas', amount: 12, unit: 'pieces', optional: false },
    { name: 'onion', amount: 1, unit: 'medium', optional: false },
    { name: 'garlic cloves', amount: 3, unit: 'cloves', optional: false },
    { name: 'cumin', amount: 1, unit: 'tbsp', optional: false },
    { name: 'chili powder', amount: 1, unit: 'tbsp', optional: false },
    { name: 'paprika', amount: 1, unit: 'tsp', optional: false },
    { name: 'oregano', amount: 1, unit: 'tsp', optional: false },
    { name: 'tomato paste', amount: 2, unit: 'tbsp', optional: false },
    { name: 'lime', amount: 2, unit: 'pieces', optional: false },
    { name: 'fresh cilantro', amount: 0.5, unit: 'cup', optional: false },
    { name: 'white onion', amount: 0.5, unit: 'medium', optional: false },
    { name: 'queso fresco', amount: 100, unit: 'g', optional: true },
    { name: 'salsa verde', amount: 100, unit: 'ml', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Heat a large skillet over medium-high heat. Add ground beef and cook, breaking it up, until browned.',
      duration: 5,
      tip: 'Drain excess fat if desired, but some adds flavor.',
    },
    {
      order: 2,
      instruction: 'Add diced onion and minced garlic. Cook until onion is translucent.',
      duration: 3,
      tip: null,
    },
    {
      order: 3,
      instruction: 'Add cumin, chili powder, paprika, oregano, and tomato paste. Stir well and cook for 2 minutes.',
      duration: 2,
      tip: 'Add a splash of water if the mixture gets too dry.',
    },
    {
      order: 4,
      instruction: 'Season with salt and pepper. Keep warm on low heat.',
      duration: 1,
      tip: null,
    },
    {
      order: 5,
      instruction: 'Warm tortillas in a dry skillet or directly over a gas flame until slightly charred and pliable.',
      duration: 4,
      tip: 'Wrap warmed tortillas in a towel to keep them soft.',
    },
    {
      order: 6,
      instruction: 'Prepare toppings: dice white onion, chop cilantro, cut limes into wedges, crumble queso fresco.',
      duration: 3,
      tip: null,
    },
    {
      order: 7,
      instruction: 'Assemble tacos with beef, onion, cilantro, cheese, and a squeeze of lime. Serve with salsa verde.',
      duration: 2,
      tip: 'Double up on tortillas for extra structural support.',
    },
  ],
  tags: ['mexican', 'tacos', 'beef', 'weeknight', 'family', 'dinner'],
  estimatedCost: 12,
};

export const TERIYAKI_SALMON: Recipe = {
  id: 'recipe_teriyaki_salmon',
  name: 'Teriyaki Glazed Salmon',
  description: 'Pan-seared salmon with homemade teriyaki glaze and steamed vegetables',
  imageUrl: null,
  prepTime: 10,
  cookTime: 15,
  servings: 2,
  difficulty: 'medium',
  cuisine: 'Japanese',
  ingredients: [
    { name: 'salmon fillets', amount: 2, unit: 'pieces', optional: false },
    { name: 'soy sauce', amount: 4, unit: 'tbsp', optional: false },
    { name: 'mirin', amount: 3, unit: 'tbsp', optional: false },
    { name: 'sake', amount: 2, unit: 'tbsp', optional: false },
    { name: 'brown sugar', amount: 2, unit: 'tbsp', optional: false },
    { name: 'garlic cloves', amount: 2, unit: 'cloves', optional: false },
    { name: 'fresh ginger', amount: 1, unit: 'cm', optional: false },
    { name: 'vegetable oil', amount: 1, unit: 'tbsp', optional: false },
    { name: 'broccoli', amount: 200, unit: 'g', optional: false },
    { name: 'sesame seeds', amount: 1, unit: 'tbsp', optional: true },
    { name: 'green onions', amount: 2, unit: 'stalks', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Make teriyaki sauce: combine soy sauce, mirin, sake, and brown sugar in a small saucepan. Add minced garlic and ginger. Simmer until slightly thickened.',
      duration: 5,
      tip: 'The sauce will thicken more as it cools.',
    },
    {
      order: 2,
      instruction: 'Pat salmon fillets dry and season with salt and pepper.',
      duration: 1,
      tip: 'Dry salmon will sear better and develop a nice crust.',
    },
    {
      order: 3,
      instruction: 'Heat oil in a non-stick pan over medium-high heat. Place salmon skin-side up and sear for 3-4 minutes until golden.',
      duration: 4,
      tip: 'Dont move the salmon - let it develop a crust.',
    },
    {
      order: 4,
      instruction: 'Flip salmon and cook for another 3 minutes. Brush generously with teriyaki sauce.',
      duration: 3,
      tip: null,
    },
    {
      order: 5,
      instruction: 'While salmon cooks, steam broccoli until tender-crisp, about 4 minutes.',
      duration: 4,
      tip: null,
    },
    {
      order: 6,
      instruction: 'Plate salmon over rice with steamed broccoli. Drizzle with remaining sauce, sprinkle with sesame seeds and sliced green onions.',
      duration: 2,
      tip: 'Serve immediately while the glaze is still glossy.',
    },
  ],
  tags: ['japanese', 'salmon', 'healthy', 'seafood', 'dinner'],
  estimatedCost: 16,
};

export const BUTTER_CHICKEN: Recipe = {
  id: 'recipe_butter_chicken',
  name: 'Butter Chicken (Murgh Makhani)',
  description: 'Rich and creamy North Indian chicken curry with aromatic spices',
  imageUrl: null,
  prepTime: 20,
  cookTime: 35,
  servings: 4,
  difficulty: 'medium',
  cuisine: 'Indian',
  ingredients: [
    { name: 'chicken thighs', amount: 600, unit: 'g', optional: false },
    { name: 'plain yogurt', amount: 200, unit: 'g', optional: false },
    { name: 'butter', amount: 60, unit: 'g', optional: false },
    { name: 'heavy cream', amount: 250, unit: 'ml', optional: false },
    { name: 'tomato puree', amount: 400, unit: 'g', optional: false },
    { name: 'onion', amount: 1, unit: 'large', optional: false },
    { name: 'garlic cloves', amount: 6, unit: 'cloves', optional: false },
    { name: 'fresh ginger', amount: 3, unit: 'cm', optional: false },
    { name: 'garam masala', amount: 2, unit: 'tsp', optional: false },
    { name: 'kashmiri chili powder', amount: 1, unit: 'tbsp', optional: false },
    { name: 'cumin powder', amount: 1, unit: 'tsp', optional: false },
    { name: 'coriander powder', amount: 1, unit: 'tsp', optional: false },
    { name: 'fenugreek leaves', amount: 1, unit: 'tbsp', optional: true },
    { name: 'sugar', amount: 1, unit: 'tsp', optional: false },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Marinate chicken pieces in yogurt, half the garam masala, chili powder, and salt for at least 1 hour.',
      duration: 5,
      tip: 'Overnight marination yields the best results.',
    },
    {
      order: 2,
      instruction: 'Grill or broil marinated chicken until charred on edges but not fully cooked. Set aside.',
      duration: 8,
      tip: 'Charring adds the signature smoky flavor.',
    },
    {
      order: 3,
      instruction: 'Melt butter in a large pot. Saute diced onion until golden brown.',
      duration: 8,
      tip: 'Patience with the onions creates depth of flavor.',
    },
    {
      order: 4,
      instruction: 'Add minced garlic and ginger, cook for 1 minute. Add remaining spices and stir for 30 seconds.',
      duration: 2,
      tip: null,
    },
    {
      order: 5,
      instruction: 'Pour in tomato puree. Simmer for 10 minutes, stirring occasionally.',
      duration: 10,
      tip: null,
    },
    {
      order: 6,
      instruction: 'Blend the sauce until smooth (use immersion blender or transfer to blender).',
      duration: 2,
      tip: 'Be careful blending hot liquids.',
    },
    {
      order: 7,
      instruction: 'Return sauce to pot. Add cream, sugar, and chicken pieces. Simmer for 10 minutes until chicken is cooked through.',
      duration: 10,
      tip: null,
    },
    {
      order: 8,
      instruction: 'Finish with crushed fenugreek leaves and a swirl of cream. Serve with naan or basmati rice.',
      duration: 2,
      tip: 'Fenugreek is the secret ingredient that makes butter chicken authentic.',
    },
  ],
  tags: ['indian', 'curry', 'chicken', 'comfort-food', 'rich', 'dinner'],
  estimatedCost: 15,
};

export const LASAGNA: Recipe = {
  id: 'recipe_lasagna',
  name: 'Classic Beef Lasagna',
  description: 'Layers of pasta, rich meat sauce, and creamy bechamel baked to perfection',
  imageUrl: null,
  prepTime: 45,
  cookTime: 60,
  servings: 8,
  difficulty: 'hard',
  cuisine: 'Italian',
  ingredients: [
    { name: 'lasagna sheets', amount: 500, unit: 'g', optional: false },
    { name: 'ground beef', amount: 500, unit: 'g', optional: false },
    { name: 'Italian sausage', amount: 250, unit: 'g', optional: false },
    { name: 'crushed tomatoes', amount: 800, unit: 'g', optional: false },
    { name: 'tomato paste', amount: 3, unit: 'tbsp', optional: false },
    { name: 'onion', amount: 1, unit: 'large', optional: false },
    { name: 'garlic cloves', amount: 4, unit: 'cloves', optional: false },
    { name: 'butter', amount: 60, unit: 'g', optional: false },
    { name: 'all-purpose flour', amount: 60, unit: 'g', optional: false },
    { name: 'whole milk', amount: 750, unit: 'ml', optional: false },
    { name: 'mozzarella cheese', amount: 400, unit: 'g', optional: false },
    { name: 'parmesan cheese', amount: 100, unit: 'g', optional: false },
    { name: 'ricotta cheese', amount: 250, unit: 'g', optional: false },
    { name: 'Italian herbs', amount: 2, unit: 'tbsp', optional: false },
    { name: 'nutmeg', amount: 0.25, unit: 'tsp', optional: false },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Make meat sauce: Brown beef and sausage in a large pot. Drain excess fat. Add diced onion and garlic, cook until soft.',
      duration: 12,
      tip: 'Breaking the meat into small pieces creates better texture.',
    },
    {
      order: 2,
      instruction: 'Add crushed tomatoes, tomato paste, and Italian herbs. Simmer for 20 minutes, stirring occasionally.',
      duration: 20,
      tip: 'A longer simmer develops deeper flavor.',
    },
    {
      order: 3,
      instruction: 'Make bechamel: Melt butter in a saucepan. Whisk in flour and cook for 1 minute. Gradually add milk, whisking constantly.',
      duration: 5,
      tip: 'Add milk slowly to prevent lumps.',
    },
    {
      order: 4,
      instruction: 'Continue whisking until sauce thickens. Season with salt, pepper, and nutmeg. Remove from heat.',
      duration: 5,
      tip: 'The sauce should coat the back of a spoon.',
    },
    {
      order: 5,
      instruction: 'Mix ricotta with half the parmesan and season with salt and pepper.',
      duration: 2,
      tip: null,
    },
    {
      order: 6,
      instruction: 'Preheat oven to 375F/190C. Spread a thin layer of meat sauce in a 9x13 baking dish.',
      duration: 1,
      tip: 'This prevents the bottom layer from sticking.',
    },
    {
      order: 7,
      instruction: 'Layer: lasagna sheets, meat sauce, ricotta mixture, bechamel, mozzarella. Repeat 3 times, ending with bechamel and mozzarella.',
      duration: 10,
      tip: 'Press down gently on each layer to remove air pockets.',
    },
    {
      order: 8,
      instruction: 'Sprinkle remaining parmesan on top. Cover with foil and bake for 30 minutes. Remove foil and bake 15 more minutes until golden.',
      duration: 45,
      tip: 'Let rest for 15 minutes before cutting for cleaner slices.',
    },
  ],
  tags: ['italian', 'pasta', 'beef', 'comfort-food', 'baked', 'dinner'],
  estimatedCost: 25,
};

export const THAI_GREEN_CURRY: Recipe = {
  id: 'recipe_green_curry',
  name: 'Thai Green Curry with Chicken',
  description: 'Aromatic coconut curry with tender chicken, Thai eggplant, and fresh basil',
  imageUrl: null,
  prepTime: 15,
  cookTime: 25,
  servings: 4,
  difficulty: 'medium',
  cuisine: 'Thai',
  ingredients: [
    { name: 'chicken thighs', amount: 500, unit: 'g', optional: false },
    { name: 'green curry paste', amount: 4, unit: 'tbsp', optional: false },
    { name: 'coconut milk', amount: 800, unit: 'ml', optional: false },
    { name: 'Thai eggplant', amount: 200, unit: 'g', optional: false },
    { name: 'bamboo shoots', amount: 100, unit: 'g', optional: false },
    { name: 'fish sauce', amount: 3, unit: 'tbsp', optional: false },
    { name: 'palm sugar', amount: 1, unit: 'tbsp', optional: false },
    { name: 'kaffir lime leaves', amount: 4, unit: 'pieces', optional: false },
    { name: 'Thai basil', amount: 1, unit: 'cup', optional: false },
    { name: 'red chilies', amount: 2, unit: 'pieces', optional: true },
    { name: 'vegetable oil', amount: 2, unit: 'tbsp', optional: false },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Slice chicken thighs into bite-sized pieces. Quarter the Thai eggplants.',
      duration: 5,
      tip: 'Remove skin from chicken thighs if you prefer leaner curry.',
    },
    {
      order: 2,
      instruction: 'Heat oil in a wok or large pan over medium heat. Add curry paste and fry for 1-2 minutes until fragrant.',
      duration: 2,
      tip: 'Frying the paste first releases its full aroma.',
    },
    {
      order: 3,
      instruction: 'Add 1 cup of the thick coconut cream (from top of can). Stir until oil separates and curry paste is dissolved.',
      duration: 3,
      tip: 'This technique is called "cracking" the coconut cream.',
    },
    {
      order: 4,
      instruction: 'Add chicken and cook until nearly done, stirring occasionally.',
      duration: 5,
      tip: null,
    },
    {
      order: 5,
      instruction: 'Pour in remaining coconut milk. Add eggplant, bamboo shoots, and torn kaffir lime leaves. Simmer for 10 minutes.',
      duration: 10,
      tip: 'Tear the lime leaves to release more flavor.',
    },
    {
      order: 6,
      instruction: 'Season with fish sauce and palm sugar. Adjust to achieve balance of salty, sweet, and spicy.',
      duration: 2,
      tip: 'Taste as you go - every curry paste is different.',
    },
    {
      order: 7,
      instruction: 'Remove from heat, stir in Thai basil, and garnish with sliced red chilies. Serve with jasmine rice.',
      duration: 2,
      tip: 'Add basil at the end to keep it vibrant green.',
    },
  ],
  tags: ['thai', 'curry', 'chicken', 'coconut', 'spicy', 'dinner'],
  estimatedCost: 14,
};

export const BEEF_BOURGUIGNON: Recipe = {
  id: 'recipe_beef_bourguignon',
  name: 'Beef Bourguignon',
  description: 'Classic French braised beef stew with red wine, mushrooms, and pearl onions',
  imageUrl: null,
  prepTime: 30,
  cookTime: 180,
  servings: 6,
  difficulty: 'hard',
  cuisine: 'French',
  ingredients: [
    { name: 'beef chuck', amount: 1000, unit: 'g', optional: false },
    { name: 'bacon lardons', amount: 200, unit: 'g', optional: false },
    { name: 'red burgundy wine', amount: 750, unit: 'ml', optional: false },
    { name: 'beef stock', amount: 500, unit: 'ml', optional: false },
    { name: 'pearl onions', amount: 250, unit: 'g', optional: false },
    { name: 'cremini mushrooms', amount: 250, unit: 'g', optional: false },
    { name: 'carrots', amount: 3, unit: 'medium', optional: false },
    { name: 'celery stalks', amount: 2, unit: 'pieces', optional: false },
    { name: 'garlic cloves', amount: 4, unit: 'cloves', optional: false },
    { name: 'tomato paste', amount: 2, unit: 'tbsp', optional: false },
    { name: 'all-purpose flour', amount: 3, unit: 'tbsp', optional: false },
    { name: 'butter', amount: 45, unit: 'g', optional: false },
    { name: 'thyme sprigs', amount: 4, unit: 'pieces', optional: false },
    { name: 'bay leaves', amount: 2, unit: 'pieces', optional: false },
    { name: 'fresh parsley', amount: 0.25, unit: 'cup', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Cut beef into 2-inch cubes. Pat dry and season generously with salt and pepper.',
      duration: 5,
      tip: 'Dry beef will brown better.',
    },
    {
      order: 2,
      instruction: 'In a large Dutch oven, cook bacon until crispy. Remove and set aside, leaving fat in the pot.',
      duration: 8,
      tip: null,
    },
    {
      order: 3,
      instruction: 'Working in batches, brown beef cubes on all sides in the bacon fat. Set aside with bacon.',
      duration: 15,
      tip: 'Dont overcrowd - this is crucial for proper browning.',
    },
    {
      order: 4,
      instruction: 'Add diced carrots, celery, and minced garlic. Cook until slightly softened.',
      duration: 5,
      tip: null,
    },
    {
      order: 5,
      instruction: 'Sprinkle flour over vegetables and stir for 1 minute. Add tomato paste and cook another minute.',
      duration: 2,
      tip: 'The flour will help thicken the stew.',
    },
    {
      order: 6,
      instruction: 'Pour in wine and beef stock, scraping up browned bits. Return beef and bacon to pot. Add thyme and bay leaves.',
      duration: 3,
      tip: 'Use a good wine you would drink - it affects the flavor.',
    },
    {
      order: 7,
      instruction: 'Bring to a simmer, cover, and transfer to a 325F/160C oven. Braise for 2.5 hours until beef is tender.',
      duration: 150,
      tip: 'Check occasionally and add more stock if needed.',
    },
    {
      order: 8,
      instruction: 'Meanwhile, saute mushrooms in butter until golden. Brown pearl onions in the same pan.',
      duration: 10,
      tip: null,
    },
    {
      order: 9,
      instruction: 'Add mushrooms and onions to the stew for the last 30 minutes of cooking. Garnish with parsley and serve.',
      duration: 5,
      tip: 'Serve with mashed potatoes or crusty bread to soak up the sauce.',
    },
  ],
  tags: ['french', 'beef', 'stew', 'wine', 'comfort-food', 'dinner'],
  estimatedCost: 35,
};

export const KUNG_PAO_CHICKEN: Recipe = {
  id: 'recipe_kung_pao',
  name: 'Kung Pao Chicken',
  description: 'Spicy Sichuan stir-fry with chicken, peanuts, and dried chilies',
  imageUrl: null,
  prepTime: 20,
  cookTime: 10,
  servings: 4,
  difficulty: 'medium',
  cuisine: 'Chinese',
  ingredients: [
    { name: 'chicken breast', amount: 500, unit: 'g', optional: false },
    { name: 'roasted peanuts', amount: 100, unit: 'g', optional: false },
    { name: 'dried red chilies', amount: 12, unit: 'pieces', optional: false },
    { name: 'Sichuan peppercorns', amount: 1, unit: 'tbsp', optional: false },
    { name: 'garlic cloves', amount: 4, unit: 'cloves', optional: false },
    { name: 'fresh ginger', amount: 2, unit: 'cm', optional: false },
    { name: 'green onions', amount: 4, unit: 'stalks', optional: false },
    { name: 'soy sauce', amount: 3, unit: 'tbsp', optional: false },
    { name: 'Chinese black vinegar', amount: 2, unit: 'tbsp', optional: false },
    { name: 'shaoxing wine', amount: 2, unit: 'tbsp', optional: false },
    { name: 'sugar', amount: 1, unit: 'tbsp', optional: false },
    { name: 'cornstarch', amount: 2, unit: 'tbsp', optional: false },
    { name: 'sesame oil', amount: 1, unit: 'tbsp', optional: false },
    { name: 'vegetable oil', amount: 3, unit: 'tbsp', optional: false },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Cut chicken into 1-inch cubes. Marinate with 1 tbsp soy sauce, 1 tbsp shaoxing wine, and 1 tbsp cornstarch for 15 minutes.',
      duration: 3,
      tip: 'The cornstarch coating keeps the chicken tender.',
    },
    {
      order: 2,
      instruction: 'Make the sauce: Mix remaining soy sauce, black vinegar, wine, sugar, and 1 tbsp cornstarch with 2 tbsp water.',
      duration: 2,
      tip: null,
    },
    {
      order: 3,
      instruction: 'Cut green onions into 1-inch pieces, separating white and green parts. Mince garlic and ginger.',
      duration: 3,
      tip: null,
    },
    {
      order: 4,
      instruction: 'Heat wok over high heat until smoking. Add oil, then chicken. Stir-fry until golden and cooked through. Remove.',
      duration: 4,
      tip: 'Spread chicken in a single layer for better browning.',
    },
    {
      order: 5,
      instruction: 'Add more oil if needed. Add dried chilies and Sichuan peppercorns, fry for 30 seconds until fragrant and darkened.',
      duration: 1,
      tip: 'Dont burn the chilies or they become bitter.',
    },
    {
      order: 6,
      instruction: 'Add garlic, ginger, and white parts of green onions. Stir for 30 seconds.',
      duration: 1,
      tip: null,
    },
    {
      order: 7,
      instruction: 'Return chicken to wok. Pour in sauce and toss until thickened and glossy. Add peanuts and green onion tops.',
      duration: 2,
      tip: null,
    },
    {
      order: 8,
      instruction: 'Drizzle with sesame oil and serve immediately over steamed rice.',
      duration: 1,
      tip: 'Eat around the chilies unless you like extreme heat!',
    },
  ],
  tags: ['chinese', 'sichuan', 'spicy', 'chicken', 'stir-fry', 'dinner'],
  estimatedCost: 12,
};

// ============================================================================
// SNACK RECIPES (3)
// ============================================================================

export const HUMMUS: Recipe = {
  id: 'recipe_hummus',
  name: 'Classic Hummus',
  description: 'Smooth and creamy Middle Eastern chickpea dip with tahini and olive oil',
  imageUrl: null,
  prepTime: 10,
  cookTime: 0,
  servings: 6,
  difficulty: 'easy',
  cuisine: 'Mediterranean',
  ingredients: [
    { name: 'canned chickpeas', amount: 400, unit: 'g', optional: false },
    { name: 'tahini', amount: 4, unit: 'tbsp', optional: false },
    { name: 'lemon juice', amount: 3, unit: 'tbsp', optional: false },
    { name: 'garlic cloves', amount: 2, unit: 'cloves', optional: false },
    { name: 'extra virgin olive oil', amount: 3, unit: 'tbsp', optional: false },
    { name: 'cumin', amount: 0.5, unit: 'tsp', optional: false },
    { name: 'cold water', amount: 3, unit: 'tbsp', optional: false },
    { name: 'paprika', amount: 0.5, unit: 'tsp', optional: true },
    { name: 'pine nuts', amount: 2, unit: 'tbsp', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Drain and rinse chickpeas. Reserve the liquid (aquafaba) if desired for extra creaminess.',
      duration: 2,
      tip: 'For ultra-smooth hummus, remove the skins from each chickpea.',
    },
    {
      order: 2,
      instruction: 'Add tahini and lemon juice to food processor. Process for 1 minute until light and whipped.',
      duration: 1,
      tip: 'Processing tahini first creates a creamier base.',
    },
    {
      order: 3,
      instruction: 'Add garlic, cumin, and salt. Process to combine.',
      duration: 1,
      tip: null,
    },
    {
      order: 4,
      instruction: 'Add chickpeas and process for 1-2 minutes, scraping down sides as needed.',
      duration: 2,
      tip: null,
    },
    {
      order: 5,
      instruction: 'With processor running, drizzle in cold water until desired consistency is reached.',
      duration: 1,
      tip: 'Cold water helps achieve silky texture.',
    },
    {
      order: 6,
      instruction: 'Transfer to serving bowl. Create a well in center, drizzle with olive oil, and sprinkle with paprika and pine nuts.',
      duration: 2,
      tip: 'Serve with warm pita bread, vegetables, or as a spread.',
    },
  ],
  tags: ['snack', 'mediterranean', 'vegan', 'healthy', 'dip', 'no-cook'],
  estimatedCost: 5,
};

export const GUACAMOLE: Recipe = {
  id: 'recipe_guacamole',
  name: 'Fresh Guacamole',
  description: 'Chunky Mexican avocado dip with lime, cilantro, and fresh vegetables',
  imageUrl: null,
  prepTime: 15,
  cookTime: 0,
  servings: 4,
  difficulty: 'easy',
  cuisine: 'Mexican',
  ingredients: [
    { name: 'ripe avocados', amount: 3, unit: 'large', optional: false },
    { name: 'lime juice', amount: 2, unit: 'tbsp', optional: false },
    { name: 'red onion', amount: 0.25, unit: 'medium', optional: false },
    { name: 'fresh cilantro', amount: 0.25, unit: 'cup', optional: false },
    { name: 'jalapeno pepper', amount: 1, unit: 'small', optional: false },
    { name: 'roma tomato', amount: 1, unit: 'medium', optional: false },
    { name: 'garlic clove', amount: 1, unit: 'clove', optional: true },
    { name: 'salt', amount: 0.5, unit: 'tsp', optional: false },
    { name: 'cumin', amount: 0.25, unit: 'tsp', optional: true },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Cut avocados in half, remove pits, and scoop flesh into a bowl.',
      duration: 2,
      tip: 'Use ripe avocados that yield to gentle pressure.',
    },
    {
      order: 2,
      instruction: 'Add lime juice and salt. Mash with a fork to desired consistency - chunky or smooth.',
      duration: 2,
      tip: 'Lime juice prevents browning and adds brightness.',
    },
    {
      order: 3,
      instruction: 'Finely dice red onion, seed and mince jalapeno, dice tomato, and chop cilantro.',
      duration: 5,
      tip: 'Remove jalapeno seeds for less heat.',
    },
    {
      order: 4,
      instruction: 'Fold vegetables and cilantro into the mashed avocado. Add minced garlic and cumin if using.',
      duration: 2,
      tip: null,
    },
    {
      order: 5,
      instruction: 'Taste and adjust salt and lime juice as needed. Serve immediately with tortilla chips.',
      duration: 2,
      tip: 'Press plastic wrap directly onto surface to prevent browning if storing.',
    },
  ],
  tags: ['snack', 'mexican', 'vegan', 'healthy', 'dip', 'no-cook'],
  estimatedCost: 6,
};

export const BRUSCHETTA: Recipe = {
  id: 'recipe_bruschetta',
  name: 'Tomato Bruschetta',
  description: 'Toasted Italian bread topped with fresh tomatoes, basil, and garlic',
  imageUrl: null,
  prepTime: 15,
  cookTime: 5,
  servings: 4,
  difficulty: 'easy',
  cuisine: 'Italian',
  ingredients: [
    { name: 'baguette or ciabatta', amount: 1, unit: 'loaf', optional: false },
    { name: 'ripe tomatoes', amount: 4, unit: 'medium', optional: false },
    { name: 'fresh basil', amount: 0.5, unit: 'cup', optional: false },
    { name: 'garlic cloves', amount: 3, unit: 'cloves', optional: false },
    { name: 'extra virgin olive oil', amount: 4, unit: 'tbsp', optional: false },
    { name: 'balsamic vinegar', amount: 1, unit: 'tbsp', optional: true },
    { name: 'salt', amount: 0.5, unit: 'tsp', optional: false },
    { name: 'black pepper', amount: 0.25, unit: 'tsp', optional: false },
  ],
  steps: [
    {
      order: 1,
      instruction: 'Dice tomatoes and place in a bowl. Add 1 minced garlic clove, half the olive oil, salt, and pepper. Let marinate for 10 minutes.',
      duration: 12,
      tip: 'Use the ripest, most flavorful tomatoes you can find.',
    },
    {
      order: 2,
      instruction: 'Slice bread into 1/2-inch thick slices. Brush with remaining olive oil.',
      duration: 2,
      tip: null,
    },
    {
      order: 3,
      instruction: 'Toast bread under broiler or on a grill until golden and crispy, about 2 minutes per side.',
      duration: 4,
      tip: 'Watch carefully - they can burn quickly.',
    },
    {
      order: 4,
      instruction: 'Rub warm toast with the remaining halved garlic cloves.',
      duration: 1,
      tip: 'The rough bread acts like a grater for the garlic.',
    },
    {
      order: 5,
      instruction: 'Chiffonade the basil and add most of it to the tomato mixture. Spoon generously onto toast.',
      duration: 3,
      tip: null,
    },
    {
      order: 6,
      instruction: 'Drizzle with balsamic vinegar if using, garnish with remaining basil, and serve immediately.',
      duration: 1,
      tip: 'Serve right away so the bread stays crispy.',
    },
  ],
  tags: ['snack', 'italian', 'appetizer', 'vegetarian', 'quick'],
  estimatedCost: 6,
};

// ============================================================================
// SAMPLE INVENTORY AND HELPER FUNCTIONS
// ============================================================================

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
 * All available sample recipes (20 total)
 *
 * Breakdown:
 * - Breakfast (3): Avocado Toast, Tamagoyaki, Shakshuka
 * - Lunch (4): Caesar Wrap, Pad Thai, Greek Salad, Quesadilla
 * - Dinner (10): Tikka Masala, Carbonara, Stir-Fry, Tacos, Teriyaki Salmon,
 *               Butter Chicken, Lasagna, Green Curry, Beef Bourguignon, Kung Pao
 * - Snacks (3): Hummus, Guacamole, Bruschetta
 *
 * Cuisines: Italian (3), Mexican (3), Chinese (2), Japanese (2), Indian (2),
 *           Thai (2), Mediterranean (3), American (2), French (1)
 *
 * Difficulty: Easy (7), Medium (8), Hard (5)
 *
 * Prep Times: Quick <20min (5), Medium 20-45min (10), Long 45min+ (5)
 */
export const SAMPLE_RECIPES: Recipe[] = [
  // Breakfast
  AVOCADO_TOAST,
  JAPANESE_TAMAGOYAKI,
  SHAKSHUKA,
  // Lunch
  CHICKEN_CAESAR_WRAP,
  PAD_THAI,
  GREEK_SALAD,
  CHICKEN_QUESADILLA,
  // Dinner
  CHICKEN_TIKKA_MASALA,
  PASTA_CARBONARA,
  STIR_FRY_VEGETABLES,
  BEEF_TACOS,
  TERIYAKI_SALMON,
  BUTTER_CHICKEN,
  LASAGNA,
  THAI_GREEN_CURRY,
  BEEF_BOURGUIGNON,
  KUNG_PAO_CHICKEN,
  // Snacks
  HUMMUS,
  GUACAMOLE,
  BRUSCHETTA,
];
