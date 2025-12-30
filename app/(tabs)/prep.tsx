import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
  hearthOrange: '#E85D04',
  charcoal: '#2D3436',
  cream: '#FDF6E3',
  sageGreen: '#52796F',
};

// Mock prep data
const weekPlan = [
  { day: 'Mon', meal: 'Stir Fry' },
  { day: 'Tue', meal: 'Tacos' },
  { day: 'Wed', meal: 'Pasta Primavera' },
  { day: 'Thu', meal: 'Salmon Bowl' },
  { day: 'Fri', meal: 'Pizza Night 🍕' },
];

const prepTasks = [
  { id: '1', task: 'Dice onions (3)', time: 8, usedIn: 'Mon, Tue, Wed', completed: false },
  { id: '2', task: 'Cook rice batch', time: 20, usedIn: 'Mon, Thu', completed: false },
  { id: '3', task: 'Wash & chop veg', time: 12, usedIn: 'Mon, Wed', completed: false },
  { id: '4', task: 'Marinate chicken', time: 5, usedIn: 'Mon', completed: false },
];

const totalPrepTime = prepTasks.reduce((sum, task) => sum + task.time, 0);

export default function PrepScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Sunday Prep</Text>
        <Text style={styles.subtitle}>Set yourself up for the week</Text>

        {/* Week Plan */}
        <View style={styles.weekCard}>
          <Text style={styles.cardTitle}>This Week's Plan</Text>
          {weekPlan.map((day, index) => (
            <View key={index} style={styles.dayRow}>
              <Text style={styles.dayLabel}>{day.day}:</Text>
              <Text style={styles.dayMeal}>{day.meal}</Text>
            </View>
          ))}
        </View>

        {/* Prep Tasks */}
        <View style={styles.tasksCard}>
          <Text style={styles.cardTitle}>Prep Tasks (~{totalPrepTime} min total)</Text>

          {prepTasks.map(task => (
            <View key={task.id} style={styles.taskRow}>
              <TouchableOpacity style={styles.checkbox}>
                <Text style={styles.checkboxText}>☐</Text>
              </TouchableOpacity>
              <View style={styles.taskContent}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskName}>{task.task}</Text>
                  <Text style={styles.taskTime}>{task.time}min</Text>
                </View>
                <Text style={styles.taskUsedIn}>→ Used {task.usedIn}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Start Button */}
        <TouchableOpacity style={styles.startButton}>
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
  taskTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  taskUsedIn: {
    fontSize: 13,
    color: colors.sageGreen,
  },
  startButton: {
    backgroundColor: colors.hearthOrange,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
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
});
