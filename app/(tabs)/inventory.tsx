import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const colors = {
  hearthOrange: '#E85D04',
  charcoal: '#2D3436',
  cream: '#FDF6E3',
  sageGreen: '#52796F',
  softRed: '#D62828',
};

// Mock inventory data
const inventory = {
  useSoon: [
    { id: '1', name: 'Chicken breast', emoji: '🍗', daysLeft: 2 },
    { id: '2', name: 'Greek yogurt', emoji: '🥛', daysLeft: 3 },
    { id: '3', name: 'Spinach', emoji: '🥬', daysLeft: 4 },
  ],
  fridge: [
    { id: '4', name: 'Eggs (8)', emoji: '🥚', daysLeft: 12 },
    { id: '5', name: 'Cheddar', emoji: '🧀', daysLeft: 21 },
    { id: '6', name: 'Carrots', emoji: '🥕', daysLeft: 14 },
    { id: '7', name: 'Bell peppers (2)', emoji: '🫑', daysLeft: 7 },
  ],
  pantry: [
    { id: '8', name: 'Pasta', emoji: '🍝', daysLeft: null },
    { id: '9', name: 'Rice', emoji: '🍚', daysLeft: null },
    { id: '10', name: 'Tomato sauce', emoji: '🥫', daysLeft: null },
  ],
  freezer: [
    { id: '11', name: 'Ground beef', emoji: '🥩', daysLeft: 60 },
    { id: '12', name: 'Bread', emoji: '🍞', daysLeft: 30 },
  ],
};

function InventoryItem({ item }: { item: typeof inventory.useSoon[0] }) {
  const isUrgent = item.daysLeft !== null && item.daysLeft <= 3;
  const isWarning = item.daysLeft !== null && item.daysLeft <= 7 && item.daysLeft > 3;

  return (
    <View style={styles.itemRow}>
      <Text style={styles.itemEmoji}>{item.emoji}</Text>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={[
        styles.itemDays,
        isUrgent && styles.itemDaysUrgent,
        isWarning && styles.itemDaysWarning,
      ]}>
        {item.daysLeft !== null ? `${item.daysLeft} d` : '—'}
      </Text>
    </View>
  );
}

export default function InventoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Inventory</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Use Soon Section */}
        <View style={styles.urgentSection}>
          <Text style={styles.urgentTitle}>⚠️ USE SOON</Text>
          {inventory.useSoon.map(item => (
            <InventoryItem key={item.id} item={item} />
          ))}
        </View>

        {/* Fridge Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>FRIDGE</Text>
            <TouchableOpacity>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          {inventory.fridge.map(item => (
            <InventoryItem key={item.id} item={item} />
          ))}
        </View>

        {/* Pantry Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PANTRY</Text>
            <TouchableOpacity>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          {inventory.pantry.map(item => (
            <InventoryItem key={item.id} item={item} />
          ))}
        </View>

        {/* Freezer Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>FREEZER</Text>
            <TouchableOpacity>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          </View>
          {inventory.freezer.map(item => (
            <InventoryItem key={item.id} item={item} />
          ))}
        </View>

        {/* Scan Receipt Button */}
        <TouchableOpacity style={styles.scanButton}>
          <Text style={styles.scanButtonText}>📷 Scan Receipt</Text>
        </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  addButton: {
    backgroundColor: colors.hearthOrange,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  urgentSection: {
    backgroundColor: 'rgba(214, 40, 40, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  urgentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.softRed,
    marginBottom: 12,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  editLink: {
    fontSize: 14,
    color: colors.hearthOrange,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: colors.charcoal,
  },
  itemDays: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemDaysUrgent: {
    color: colors.softRed,
    fontWeight: 'bold',
  },
  itemDaysWarning: {
    color: colors.hearthOrange,
  },
  scanButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: colors.hearthOrange,
    borderStyle: 'dashed',
  },
  scanButtonText: {
    fontSize: 16,
    color: colors.hearthOrange,
    fontWeight: '600',
  },
});
