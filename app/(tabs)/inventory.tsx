import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
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
import { Typography, BadgePill, useToast } from '../../src/components';

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
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.name}`}
        >
          <Text style={styles.deleteButtonText}>✕</Text>
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
  const { showToast } = useToast();

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
      showToast(`${item.name} added to ${item.location}`);
    },
    [addItem, showToast]
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

  // Build sections for SectionList
  type SectionData = {
    key: string;
    title: string;
    data: InventoryItem[];
    isUrgent?: boolean;
    showEdit?: boolean;
  };

  const sections = useMemo<SectionData[]>(() => {
    const result: SectionData[] = [];

    if (useSoonItems.length > 0) {
      result.push({
        key: 'useSoon',
        title: '! USE SOON',
        data: useSoonItems,
        isUrgent: true,
        showEdit: false,
      });
    }

    result.push(
      { key: 'fridge', title: 'FRIDGE', data: fridgeItems, showEdit: true },
      { key: 'pantry', title: 'PANTRY', data: pantryItems, showEdit: true },
      { key: 'freezer', title: 'FREEZER', data: freezerItems, showEdit: true }
    );

    return result;
  }, [useSoonItems, fridgeItems, pantryItems, freezerItems]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: SectionData }) => {
      const isEditing = editModeSection === section.key;

      return (
        <View style={[
          styles.sectionHeaderContainer,
          section.isUrgent && styles.urgentSection
        ]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, section.isUrgent && styles.urgentTitle]}>
              {section.title}
            </Text>
            {section.showEdit !== false && (
              <TouchableOpacity
                style={[styles.editButton, isEditing && styles.editButtonActive]}
                onPress={() => toggleEditMode(section.key)}
                accessibilityRole="button"
                accessibilityLabel={isEditing ? 'Done editing' : 'Edit items'}
              >
                <Text style={[styles.editButtonText, isEditing && styles.editButtonTextActive]}>
                  {isEditing ? '✓ Done' : '✎ Edit'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          {section.data.length === 0 && (
            <Text style={styles.emptyText}>No items</Text>
          )}
        </View>
      );
    },
    [editModeSection, toggleEditMode]
  );

  const renderItem = useCallback(
    ({ item, section }: { item: InventoryItem; section: SectionData }) => {
      const isEditing = editModeSection === section.key && section.showEdit !== false;
      return (
        <View style={section.isUrgent ? styles.urgentItemContainer : styles.itemContainer}>
          <InventoryItemRow
            item={item}
            daysLeft={getDaysUntilExpiry(item)}
            isEditMode={isEditing}
            onDelete={handleDeleteItem}
          />
        </View>
      );
    },
    [editModeSection, getDaysUntilExpiry, handleDeleteItem]
  );

  const ListFooter = useCallback(() => (
    <View>
      <TouchableOpacity style={styles.scanButton} onPress={handleScanReceipt}>
        <Text style={styles.scanButtonText}>📷 Scan Receipt</Text>
      </TouchableOpacity>

      {items.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>🥗</Text>
          <Text style={styles.emptyStateTitle}>Your inventory is empty</Text>
          <Text style={styles.emptyStateText}>
            Add items to start tracking your food and reduce waste!
          </Text>
        </View>
      )}
    </View>
  ), [items.length, handleScanReceipt]);

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

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />

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
  },
  urgentItemContainer: {
    backgroundColor: colors.softRedLight,
    paddingHorizontal: spacing.lg,
  },
  sectionHeaderContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  itemContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.sm,
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
  editButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  editButtonActive: {
    backgroundColor: colors.sageGreen,
    borderColor: colors.sageGreen,
  },
  editButtonText: {
    fontSize: 14,
    color: colors.gray600,
    fontWeight: '500',
  },
  editButtonTextActive: {
    color: colors.white,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 16,
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
