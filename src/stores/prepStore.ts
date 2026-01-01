import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createDateAwareStorage } from '../lib/storage';
import { generateId } from '../lib/uuid';
import type { MealPlan, Recipe } from '../types';

export interface PrepTask {
  id: string;
  task: string;
  emoji: string;
  time: number; // minutes
  usedIn: string[]; // day abbreviations like ['Mon', 'Wed']
  completed: boolean;
  ingredientName?: string; // optional link to ingredient
  prepType: 'chop' | 'cook' | 'marinate' | 'wash' | 'measure' | 'other';
}

interface PrepState {
  tasks: PrepTask[];
  lastGeneratedAt: string | null;

  // Actions
  setTasks: (tasks: PrepTask[]) => void;
  toggleTask: (taskId: string) => void;
  generateTasksFromPlans: (plans: MealPlan[]) => void;
  clearTasks: () => void;
  getTotalRemainingTime: () => number;
  getCompletedCount: () => number;
}

// Prep patterns to detect from ingredients
const PREP_PATTERNS: {
  pattern: RegExp;
  task: string;
  emoji: string;
  time: number;
  type: PrepTask['prepType'];
}[] = [
  { pattern: /onion/i, task: 'Dice onions', emoji: '🧅', time: 5, type: 'chop' },
  { pattern: /garlic/i, task: 'Mince garlic', emoji: '🧄', time: 3, type: 'chop' },
  { pattern: /carrot/i, task: 'Slice carrots', emoji: '🥕', time: 5, type: 'chop' },
  { pattern: /bell pepper|pepper/i, task: 'Dice peppers', emoji: '🫑', time: 5, type: 'chop' },
  { pattern: /tomato/i, task: 'Chop tomatoes', emoji: '🍅', time: 4, type: 'chop' },
  { pattern: /chicken/i, task: 'Prep chicken', emoji: '🍗', time: 10, type: 'other' },
  { pattern: /beef|steak/i, task: 'Prep beef', emoji: '🥩', time: 10, type: 'other' },
  { pattern: /rice/i, task: 'Rinse rice', emoji: '🍚', time: 3, type: 'wash' },
  { pattern: /potato/i, task: 'Peel & chop potatoes', emoji: '🥔', time: 8, type: 'chop' },
  { pattern: /lettuce|salad|greens/i, task: 'Wash salad greens', emoji: '🥬', time: 4, type: 'wash' },
  { pattern: /mushroom/i, task: 'Slice mushrooms', emoji: '🍄', time: 4, type: 'chop' },
  { pattern: /ginger/i, task: 'Grate ginger', emoji: '🫚', time: 2, type: 'chop' },
  { pattern: /broccoli/i, task: 'Cut broccoli florets', emoji: '🥦', time: 5, type: 'chop' },
  { pattern: /zucchini|courgette/i, task: 'Slice zucchini', emoji: '🥒', time: 4, type: 'chop' },
  { pattern: /spinach/i, task: 'Wash spinach', emoji: '🥬', time: 3, type: 'wash' },
  { pattern: /bean|legume/i, task: 'Rinse beans', emoji: '🫘', time: 2, type: 'wash' },
  { pattern: /lemon|lime/i, task: 'Juice citrus', emoji: '🍋', time: 3, type: 'other' },
  { pattern: /herb|cilantro|parsley|basil/i, task: 'Chop fresh herbs', emoji: '🌿', time: 3, type: 'chop' },
  { pattern: /egg/i, task: 'Prep eggs', emoji: '🥚', time: 2, type: 'other' },
  { pattern: /tofu/i, task: 'Press & cube tofu', emoji: '🧈', time: 15, type: 'other' },
];

// Get day abbreviation
function getDayAbbr(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

// Extract prep tasks from a recipe
function extractPrepTasksFromRecipe(recipe: Recipe, dayAbbr: string): Map<string, { days: Set<string>; task: PrepTask }> {
  const tasks = new Map<string, { days: Set<string>; task: PrepTask }>();

  recipe.ingredients.forEach((ingredient) => {
    for (const pattern of PREP_PATTERNS) {
      if (pattern.pattern.test(ingredient.name)) {
        const key = pattern.task;
        if (tasks.has(key)) {
          tasks.get(key)!.days.add(dayAbbr);
        } else {
          tasks.set(key, {
            days: new Set([dayAbbr]),
            task: {
              id: generateId('prep'),
              task: pattern.task,
              emoji: pattern.emoji,
              time: pattern.time,
              usedIn: [],
              completed: false,
              ingredientName: ingredient.name,
              prepType: pattern.type,
            },
          });
        }
        break; // Only match first pattern per ingredient
      }
    }
  });

  return tasks;
}

export const usePrepStore = create<PrepState>()(
  persist(
    (set, get) => ({
      tasks: [],
      lastGeneratedAt: null,

      setTasks: (tasks) => {
        set({ tasks });
      },

      toggleTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        }));
      },

      generateTasksFromPlans: (plans) => {
        // Filter to upcoming incomplete plans only
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const upcomingPlans = plans.filter((plan) => {
          const planDate = new Date(plan.date);
          planDate.setHours(0, 0, 0, 0);
          return planDate >= now && !plan.completed && plan.recipe;
        });

        if (upcomingPlans.length === 0) {
          // Keep existing tasks if no new plans
          return;
        }

        // Aggregate tasks across all planned recipes
        const aggregatedTasks = new Map<string, { days: Set<string>; task: PrepTask }>();

        upcomingPlans.forEach((plan) => {
          if (!plan.recipe) return;

          const dayAbbr = getDayAbbr(new Date(plan.date));
          const recipeTasks = extractPrepTasksFromRecipe(plan.recipe, dayAbbr);

          recipeTasks.forEach((value, key) => {
            if (aggregatedTasks.has(key)) {
              // Merge days
              value.days.forEach((day) => aggregatedTasks.get(key)!.days.add(day));
            } else {
              aggregatedTasks.set(key, value);
            }
          });
        });

        // Convert to array and set usedIn from days Set
        const tasks: PrepTask[] = Array.from(aggregatedTasks.values()).map(({ days, task }) => ({
          ...task,
          id: generateId('prep'), // New ID for fresh tasks
          usedIn: Array.from(days).sort((a, b) => {
            const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            return order.indexOf(a) - order.indexOf(b);
          }),
        }));

        // Sort by prep type, then by time
        tasks.sort((a, b) => {
          const typeOrder: Record<PrepTask['prepType'], number> = {
            wash: 0,
            chop: 1,
            marinate: 2,
            measure: 3,
            cook: 4,
            other: 5,
          };
          if (typeOrder[a.prepType] !== typeOrder[b.prepType]) {
            return typeOrder[a.prepType] - typeOrder[b.prepType];
          }
          return b.time - a.time; // Longer tasks first
        });

        set({
          tasks,
          lastGeneratedAt: new Date().toISOString(),
        });
      },

      clearTasks: () => {
        set({ tasks: [], lastGeneratedAt: null });
      },

      getTotalRemainingTime: () => {
        return get()
          .tasks.filter((t) => !t.completed)
          .reduce((sum, t) => sum + t.time, 0);
      },

      getCompletedCount: () => {
        return get().tasks.filter((t) => t.completed).length;
      },
    }),
    {
      name: 'hearthstone-prep',
      storage: createDateAwareStorage(),
    }
  )
);
