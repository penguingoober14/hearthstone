import { useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMealPlanStore, usePrepStore } from '../../src/stores';
import { colors, spacing, borderRadius, shadows } from '../../src/lib/theme';
import { BadgePill, Checkbox } from '../../src/components';

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
  const { getPlansForWeek, plans } = useMealPlanStore();
  const { tasks, toggleTask, generateTasksFromPlans, getTotalRemainingTime } = usePrepStore();

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

  // Auto-generate prep tasks when plans change
  useEffect(() => {
    if (plans.length > 0) {
      generateTasksFromPlans(plans);
    }
  }, [plans, generateTasksFromPlans]);

  const handleToggleTask = useCallback((taskId: string) => {
    toggleTask(taskId);
  }, [toggleTask]);

  const totalPrepTime = getTotalRemainingTime();

  const handleStartGuidedPrep = useCallback(() => {
    const uncompletedTasks = tasks.filter((task) => !task.completed);

    if (uncompletedTasks.length === 0) {
      Alert.alert('All Done!', 'You have completed all prep tasks for this week.');
      return;
    }

    const taskList = uncompletedTasks.map((task) => `- ${task.emoji} ${task.task}`).join('\n');
    Alert.alert(
      'Starting Guided Prep',
      `Starting prep for:\n\n${taskList}\n\nTotal time: ~${totalPrepTime} minutes`
    );
  }, [tasks, totalPrepTime]);

  const hasWeekPlan = weekPlan.length > 0;
  const hasTasks = tasks.length > 0;

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
              <View key={index} style={[styles.dayRow, day.meal && styles.dayRowWithMeal]}>
                <BadgePill label={day.day} variant="muted" size="sm" />
                <Text style={styles.dayMeal}>{day.meal}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No meals planned for this week</Text>
              <Text style={styles.emptyStateSubtext}>
                Head to the Tonight tab to get meal recommendations
              </Text>
            </View>
          )}
        </View>

        {/* Prep Tasks */}
        <View style={styles.tasksCard}>
          <View style={styles.tasksHeader}>
            <Text style={styles.cardTitle}>Prep Tasks</Text>
            <BadgePill
              label={`~${totalPrepTime} min remaining`}
              variant="primary"
              icon="🕐"
            />
          </View>

          {hasTasks ? (
            tasks.map((task) => (
              <View key={task.id} style={styles.taskRow}>
                <Checkbox
                  checked={task.completed}
                  onChange={() => handleToggleTask(task.id)}
                />
                <View style={styles.taskContent}>
                  <View style={styles.taskHeader}>
                    <Text
                      style={[styles.taskName, task.completed && styles.taskNameCompleted]}
                    >
                      {task.emoji} {task.task}
                    </Text>
                    <BadgePill
                      label={`${task.time}min`}
                      variant="warning"
                      size="sm"
                      icon="🕐"
                      style={task.completed ? styles.badgeCompleted : undefined}
                    />
                  </View>
                  <View style={styles.usedInContainer}>
                    <Text style={[styles.usedInLabel, task.completed && styles.taskUsedInCompleted]}>
                      Used in:
                    </Text>
                    <View style={styles.usedInBadges}>
                      {task.usedIn.map((day, idx) => (
                        <BadgePill
                          key={idx}
                          label={day}
                          variant="muted"
                          size="sm"
                          style={task.completed ? styles.badgeCompleted : undefined}
                        />
                      ))}
                    </View>
                  </View>
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
          <Text style={styles.startButtonText}>▶️ Start Guided Prep</Text>
        </TouchableOpacity>

        {/* Motivation */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationText}>
            💡 "Doing this saves 2.5 hours during your weeknights"
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
    padding: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray500,
    marginBottom: 20,
  },
  weekCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.lg,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    gap: spacing.md,
  },
  dayRowWithMeal: {
    backgroundColor: colors.gray50,
    marginHorizontal: -spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  dayMeal: {
    flex: 1,
    fontSize: 14,
    color: colors.charcoal,
  },
  tasksCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  taskRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    gap: spacing.md,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.charcoal,
    flex: 1,
    marginRight: spacing.sm,
  },
  taskNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.gray400,
  },
  usedInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  usedInLabel: {
    fontSize: 13,
    color: colors.sageGreen,
  },
  usedInBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  taskUsedInCompleted: {
    textDecorationLine: 'line-through',
    color: colors.gray300,
  },
  badgeCompleted: {
    opacity: 0.5,
  },
  startButton: {
    backgroundColor: colors.hearthOrange,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  startButtonDisabled: {
    backgroundColor: colors.gray300,
  },
  startButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  motivationCard: {
    backgroundColor: colors.sageGreenLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: 40,
    borderLeftWidth: 4,
    borderLeftColor: colors.sageGreen,
    ...shadows.sm,
  },
  motivationText: {
    fontSize: 14,
    color: colors.sageGreen,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray500,
    marginBottom: spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.gray400,
  },
});
