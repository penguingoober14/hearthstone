import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useInventoryStore } from '../../src/stores';
import { useExpiry } from '../../src/hooks';
import type { InventoryItem, FoodCategory } from '../../src/types';
import { colors, spacing, borderRadius, shadows } from '../../src/lib/theme';
import { containers, cards, layout, accents, dividers } from '../../src/lib/globalStyles';
import { Typography, BadgePill } from '../../src/components';

const LOCATIONS: Array<InventoryItem['location']> = ['fridge', 'freezer', 'pantry'];
const CATEGORIES: FoodCategory[] = [
  'protein',
  'dairy',
  'produce',
  'grains',
  'canned',
  'condiments',
  'frozen',
  'snacks',
  'beverages',
  'other',
];

const EMOJI_MAP: Record<FoodCategory, string> = {
  protein: '🍗',
  dairy: '🥛',
  produce: '🥬',
  grains: '🍚',
  canned: '🥫',
  condiments: '🧂',
  frozen: '🧊',
  snacks: '🍪',
  beverages: '🥤',
  other: '📦',
};

interface InventoryItemRowProps {
  item: InventoryItem;
  daysLeft: number | null;
  isEditMode: boolean;
  onDelete: (id: string) => void;
}

function InventoryItemRow({ item, daysLeft, isEditMode, onDelete }: InventoryItemRowProps) {
  const isUrgent = daysLeft !== null && daysLeft <= 3;
  const isWarning = daysLeft !== null && daysLeft <= 7 && daysLeft > 3;

  const getLeftBorderColor = () => {
    if (isUrgent) return colors.softRed;
    if (isWarning) return colors.hearthOrange;
    return colors.gray200;
  };

  return (
    <View style={[styles.itemRow, { borderLeftColor: getLeftBorderColor() }]}>
      <Text style={styles.itemEmoji}>{item.emoji}</Text>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.quantity > 1 && (
          <Text style={styles.itemQuantity}>
            {item.quantity} {item.unit}
          </Text>
        )}
      </View>
      <Text
        style={[
          styles.itemDays,
          isUrgent && styles.itemDaysUrgent,
          isWarning && styles.itemDaysWarning,
        ]}
      >
        {daysLeft !== null ? `${daysLeft} d` : '—'}
      </Text>
      {isEditMode && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id)}
        >
          <Text style={styles.deleteButtonText}>X</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'addedDate'>) => void;
  defaultLocation?: InventoryItem['location'];
}

function AddItemModal({ visible, onClose, onSave, defaultLocation = 'fridge' }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState<InventoryItem['location']>(defaultLocation);
  const [category, setCategory] = useState<FoodCategory>('other');
  const [quantity, setQuantity] = useState('1');
  const [expiryDays, setExpiryDays] = useState('');

  const resetForm = () => {
    setName('');
    setLocation(defaultLocation);
    setCategory('other');
    setQuantity('1');
    setExpiryDays('');
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const expiryDate = expiryDays
      ? new Date(Date.now() + parseInt(expiryDays, 10) * 24 * 60 * 60 * 1000)
      : null;

    onSave({
      name: name.trim(),
      emoji: EMOJI_MAP[category],
      quantity: parseInt(quantity, 10) || 1,
      unit: 'count',
      location,
      expiryDate,
      category,
    });

    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Item</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter item name"
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.inputLabel}>Location</Text>
          <View style={styles.pickerRow}>
            {LOCATIONS.map((loc) => (
              <Pressable
                key={loc}
                style={[
                  styles.pickerOption,
                  location === loc && styles.pickerOptionSelected,
                ]}
                onPress={() => setLocation(loc)}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    location === loc && styles.pickerOptionTextSelected,
                  ]}
                >
                  {loc.charAt(0).toUpperCase() + loc.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.categoryOption,
                  category === cat && styles.categoryOptionSelected,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={styles.categoryEmoji}>{EMOJI_MAP[cat]}</Text>
                <Text
                  style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.inputLabel}>Quantity</Text>
          <TextInput
            style={styles.textInput}
            placeholder="1"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
          />

          <Text style={styles.inputLabel}>Days until expiry (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Leave empty if no expiry"
            value={expiryDays}
            onChangeText={setExpiryDays}
            keyboardType="number-pad"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function InventoryScreen() {
  const { items, addItem, removeItem, getExpiringSoon, getByLocation } = useInventoryStore();
  const { getDaysUntilExpiry } = useExpiry();

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [editModeSection, setEditModeSection] = useState<string | null>(null);
  const [addToLocation, setAddToLocation] = useState<InventoryItem['location']>('fridge');

  // Get categorized items
  const useSoonItems = getExpiringSoon(7);
  const fridgeItems = getByLocation('fridge');
  const freezerItems = getByLocation('freezer');
  const pantryItems = getByLocation('pantry');

  const handleAddItem = useCallback(
    (item: Omit<InventoryItem, 'id' | 'addedDate'>) => {
      addItem(item);
    },
    [addItem]
  );

  const handleDeleteItem = useCallback(
    (id: string) => {
      Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeItem(id),
        },
      ]);
    },
    [removeItem]
  );

  const toggleEditMode = (section: string) => {
    setEditModeSection(editModeSection === section ? null : section);
  };

  const openAddModal = (location: InventoryItem['location'] = 'fridge') => {
    setAddToLocation(location);
    setIsAddModalVisible(true);
  };

  const handleScanReceipt = () => {
    Alert.alert('Coming Soon', 'Receipt scanning will be available in a future update!');
  };

  const renderSection = (
    title: string,
    sectionKey: string,
    items: InventoryItem[],
    showEdit: boolean = true
  ) => {
    const isEditing = editModeSection === sectionKey;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {showEdit && (
            <TouchableOpacity onPress={() => toggleEditMode(sectionKey)}>
              <Text style={styles.editLink}>{isEditing ? 'Done' : 'Edit'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {items.length === 0 ? (
          <Text style={styles.emptyText}>No items</Text>
        ) : (
          items.map((item) => (
            <InventoryItemRow
              key={item.id}
              item={item}
              daysLeft={getDaysUntilExpiry(item)}
              isEditMode={isEditing}
              onDelete={handleDeleteItem}
            />
          ))
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Inventory</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => openAddModal('fridge')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Use Soon Section */}
        {useSoonItems.length > 0 && (
          <View style={styles.urgentSection}>
            <Text style={styles.urgentTitle}>! USE SOON</Text>
            {useSoonItems.map((item) => (
              <InventoryItemRow
                key={item.id}
                item={item}
                daysLeft={getDaysUntilExpiry(item)}
                isEditMode={false}
                onDelete={handleDeleteItem}
              />
            ))}
          </View>
        )}

        {/* Fridge Section */}
        {renderSection('FRIDGE', 'fridge', fridgeItems)}

        {/* Pantry Section */}
        {renderSection('PANTRY', 'pantry', pantryItems)}

        {/* Freezer Section */}
        {renderSection('FREEZER', 'freezer', freezerItems)}

        {/* Scan Receipt Button */}
        <TouchableOpacity style={styles.scanButton} onPress={handleScanReceipt}>
          <Text style={styles.scanButtonText}>📷 Scan Receipt</Text>
        </TouchableOpacity>

        {/* Empty State */}
        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🥗</Text>
            <Text style={styles.emptyStateTitle}>Your inventory is empty</Text>
            <Text style={styles.emptyStateText}>
              Add items to start tracking your food and reduce waste!
            </Text>
          </View>
        )}
      </ScrollView>

      <AddItemModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSave={handleAddItem}
        defaultLocation={addToLocation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  addButton: {
    backgroundColor: colors.hearthOrange,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  urgentSection: {
    backgroundColor: colors.softRedLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: colors.softRed,
    ...shadows.sm,
  },
  urgentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.softRed,
    marginBottom: spacing.md,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
    backgroundColor: colors.gray50,
    borderLeftWidth: 3,
    marginVertical: 2,
    borderRadius: borderRadius.sm,
  },
  itemEmoji: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: colors.charcoal,
  },
  itemQuantity: {
    fontSize: 12,
    color: colors.gray500,
  },
  itemDays: {
    fontSize: 14,
    color: colors.gray500,
    marginRight: spacing.sm,
  },
  itemDaysUrgent: {
    color: colors.softRed,
    fontWeight: 'bold',
  },
  itemDaysWarning: {
    color: colors.hearthOrange,
  },
  deleteButton: {
    backgroundColor: colors.softRed,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    color: colors.gray400,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  scanButton: {
    backgroundColor: colors.hearthOrangeLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 2,
    borderColor: colors.hearthOrange,
  },
  scanButtonText: {
    fontSize: 16,
    color: colors.hearthOrange,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
  },
  emptyStateEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.charcoal,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xxl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.charcoal,
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.hearthOrange,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.charcoal,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  textInput: {
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: colors.hearthOrange,
    borderColor: colors.hearthOrange,
  },
  pickerOptionText: {
    fontSize: 14,
    color: colors.charcoal,
  },
  pickerOptionTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  categoryScroll: {
    marginBottom: spacing.sm,
  },
  categoryOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  categoryOptionSelected: {
    backgroundColor: colors.sageGreen,
    borderColor: colors.sageGreen,
  },
  categoryEmoji: {
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  categoryText: {
    fontSize: 12,
    color: colors.charcoal,
    textTransform: 'capitalize',
  },
  categoryTextSelected: {
    color: colors.white,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.hearthOrange,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
