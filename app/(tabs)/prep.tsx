import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMealPlanStore } from '../../src/stores';

const colors = {
  hearthOrange: '#E85D04',
  charcoal: '#2D3436',
  cream: '#FDF6E3',
  sageGreen: '#52796F',
};

const PREP_TASKS_KEY = 'hearthstone-prep-tasks';

interface PrepTask {
  id: string;
  task: string;
  time: number;
  usedIn: string;
  completed: boolean;
}

// Default tasks when no meals are planned (for demo purposes)
const defaultPrepTasks: PrepTask[] = [
  { id: '1', task: 'Dice onions (3)', time: 8, usedIn: 'Mon, Tue, Wed', completed: false },
  { id: '2', task: 'Cook rice batch', time: 20, usedIn: 'Mon, Thu', completed: false },
  { id: '3', task: 'Wash & chop veg', time: 12, usedIn: 'Mon, Wed', completed: false },
  { id: '4', task: 'Marinate chicken', time: 5, usedIn: 'Mon', completed: false },
];

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; // adjust to Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDayAbbreviation(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

export default function PrepScreen() {
  const [tasks, setTasks] = useState<PrepTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { getPlansForWeek } = useMealPlanStore();

  const startOfWeek = useMemo(() => getStartOfWeek(new Date()), []);
  const weekPlans = useMemo(() => getPlansForWeek(startOfWeek), [startOfWeek, getPlansForWeek]);

  // Transform meal plans into week display format
  const weekPlan = useMemo(() => {
    if (weekPlans.length === 0) return [];

    // Group by day and get dinner plans (or first meal of the day)
    const plansByDay: { [key: string]: string } = {};

    weekPlans.forEach((plan) => {
      const planDate = new Date(plan.date);
      const dayAbbr = getDayAbbreviation(planDate);

      // Prioritize dinner, but show other meals if no dinner
      if (plan.mealType === 'dinner' || !plansByDay[dayAbbr]) {
        plansByDay[dayAbbr] = plan.recipe?.name || plan.notes || 'Planned meal';
      }
    });

    // Convert to array sorted by day
    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayOrder
      .filter(day => plansByDay[day])
      .map(day => ({ day, meal: plansByDay[day] }));
  }, [weekPlans]);

  // Load tasks from AsyncStorage on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const stored = await AsyncStorage.getItem(PREP_TASKS_KEY);
        if (stored) {
          setTasks(JSON.parse(stored));
        } else {
          // Use default tasks if none stored
          setTasks(defaultPrepTasks);
        }
      } catch (error) {
        console.error('Failed to load prep tasks:', error);
        setTasks(defaultPrepTasks);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Save tasks to AsyncStorage whenever they change
  useEffect(() => {
    if (!isLoading && tasks.length > 0) {
      AsyncStorage.setItem(PREP_TASKS_KEY, JSON.stringify(tasks)).catch((error) =>
        console.error('Failed to save prep tasks:', error)
      );
    }
  }, [tasks, isLoading]);

  const toggleTask = useCallback((taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const totalPrepTime = useMemo(() => {
    return tasks.filter((task) => !task.completed).reduce((sum, task) => sum + task.time, 0);
  }, [tasks]);

  const handleStartGuidedPrep = useCallback(() => {
    const uncompletedTasks = tasks.filter((task) => !task.completed);

    if (uncompletedTasks.length === 0) {
      Alert.alert('All Done!', 'You have completed all prep tasks for this week.');
      return;
    }

    const taskList = uncompletedTasks.map((task) => `- ${task.task}`).join('\n');
    Alert.alert(
      'Starting Guided Prep',
      `Starting prep for:\n\n${taskList}\n\nTotal time: ~${totalPrepTime} minutes`
    );
  }, [tasks, totalPrepTime]);

  const hasWeekPlan = weekPlan.length > 0;
  const hasTasks = tasks.length > 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Sunday Prep</Text>
        <Text style={styles.subtitle}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Sunday Prep</Text>
        <Text style={styles.subtitle}>Set yourself up for the week</Text>

        {/* Week Plan */}
        <View style={styles.weekCard}>
          <Text style={styles.cardTitle}>This Week's Plan</Text>
          {hasWeekPlan ? (
            weekPlan.map((day, index) => (
              <View key={index} style={styles.dayRow}>
                <Text style={styles.dayLabel}>{day.day}:</Text>
                <Text style={styles.dayMeal}>{day.meal}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No meals planned for this week</Text>
              <Text style={styles.emptyStateSubtext}>
                Head to the Plan tab to add meals
              </Text>
            </View>
          )}
        </View>

        {/* Prep Tasks */}
        <View style={styles.tasksCard}>
          <Text style={styles.cardTitle}>
            Prep Tasks (~{totalPrepTime} min remaining)
          </Text>

          {hasTasks ? (
            tasks.map((task) => (
              <View key={task.id} style={styles.taskRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => toggleTask(task.id)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: task.completed }}
                >
                  <Text style={[styles.checkboxText, task.completed && styles.checkboxCompleted]}>
                    {task.completed ? '✓' : '☐'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.taskContent}>
                  <View style={styles.taskHeader}>
                    <Text
                      style={[styles.taskName, task.completed && styles.taskNameCompleted]}
                    >
                      {task.task}
                    </Text>
                    <Text
                      style={[styles.taskTime, task.completed && styles.taskTimeCompleted]}
                    >
                      {task.time}min
                    </Text>
                  </View>
                  <Text
                    style={[styles.taskUsedIn, task.completed && styles.taskUsedInCompleted]}
                  >
                    → Used {task.usedIn}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No prep tasks yet</Text>
            </View>
          )}
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            tasks.every((t) => t.completed) && styles.startButtonDisabled,
          ]}
          onPress={handleStartGuidedPrep}
          disabled={tasks.length === 0}
        >
          <Text style={styles.startButtonText}>Start Guided Prep</Text>
        </TouchableOpacity>

        {/* Motivation */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            "Doing this saves 2.5 hours during your weeknights"
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  weekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayLabel: {
    width: 50,
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal,
  },
  dayMeal: {
    flex: 1,
    fontSize: 14,
    color: colors.charcoal,
  },
  tasksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  taskRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checkbox: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxText: {
    fontSize: 24,
    color: colors.charcoal,
  },
  checkboxCompleted: {
    color: colors.sageGreen,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.charcoal,
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  taskTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  taskTimeCompleted: {
    textDecorationLine: 'line-through',
    color: '#D1D5DB',
  },
  taskUsedIn: {
    fontSize: 13,
    color: colors.sageGreen,
  },
  taskUsedInCompleted: {
    textDecorationLine: 'line-through',
    color: '#D1D5DB',
  },
  startButton: {
    backgroundColor: colors.hearthOrange,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  startButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  motivationCard: {
    backgroundColor: 'rgba(82, 121, 111, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  motivationText: {
    fontSize: 14,
    color: colors.sageGreen,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
