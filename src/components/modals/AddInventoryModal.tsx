import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, borderRadius, typography, spacing } from '../../lib/theme';
import { Button } from '../Button';
import type { InventoryItem, FoodCategory } from '../../types';

interface AddInventoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'addedDate'>) => void;
}

type LocationType = 'fridge' | 'freezer' | 'pantry';

const LOCATIONS: { key: LocationType; label: string; emoji: string }[] = [
  { key: 'fridge', label: 'Fridge', emoji: '🧊' },
  { key: 'freezer', label: 'Freezer', emoji: '❄️' },
  { key: 'pantry', label: 'Pantry', emoji: '🏠' },
];

const CATEGORIES: { key: FoodCategory; label: string }[] = [
  { key: 'protein', label: 'Protein' },
  { key: 'dairy', label: 'Dairy' },
  { key: 'produce', label: 'Produce' },
  { key: 'grains', label: 'Grains' },
  { key: 'canned', label: 'Canned' },
  { key: 'condiments', label: 'Condiments' },
  { key: 'frozen', label: 'Frozen' },
  { key: 'snacks', label: 'Snacks' },
  { key: 'beverages', label: 'Beverages' },
  { key: 'other', label: 'Other' },
];

export function AddInventoryModal({ visible, onClose, onSave }: AddInventoryModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [location, setLocation] = useState<LocationType>('fridge');
  const [category, setCategory] = useState<FoodCategory>('other');
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const resetForm = () => {
    setName('');
    setEmoji('');
    setLocation('fridge');
    setCategory('other');
    setQuantity(1);
    setExpiryDate('');
    setShowCategoryPicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const parsedExpiry = expiryDate.trim() ? new Date(expiryDate) : null;

    onSave({
      name: name.trim(),
      emoji: emoji.trim() || '📦',
      quantity,
      unit: 'count',
      location,
      expiryDate: parsedExpiry && !isNaN(parsedExpiry.getTime()) ? parsedExpiry : null,
      category,
    });

    resetForm();
    onClose();
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  const selectedCategoryLabel = CATEGORIES.find((c) => c.key === category)?.label || 'Other';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Add Item</Text>

            {/* Name Input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter item name"
                placeholderTextColor={colors.gray400}
              />
            </View>

            {/* Emoji Input */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Emoji</Text>
              <TextInput
                style={styles.textInput}
                value={emoji}
                onChangeText={setEmoji}
                placeholder="Type an emoji (e.g. 🍎)"
                placeholderTextColor={colors.gray400}
              />
            </View>

            {/* Location Selection */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Location</Text>
              <View style={styles.locationRow}>
                {LOCATIONS.map((loc) => (
                  <TouchableOpacity
                    key={loc.key}
                    style={[
                      styles.locationButton,
                      location === loc.key && styles.locationButtonActive,
                    ]}
                    onPress={() => setLocation(loc.key)}
                  >
                    <Text style={styles.locationEmoji}>{loc.emoji}</Text>
                    <Text
                      style={[
                        styles.locationText,
                        location === loc.key && styles.locationTextActive,
                      ]}
                    >
                      {loc.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Picker */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              >
                <Text style={styles.pickerButtonText}>{selectedCategoryLabel}</Text>
                <Text style={styles.pickerArrow}>{showCategoryPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showCategoryPicker && (
                <View style={styles.categoryList}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryItem,
                        category === cat.key && styles.categoryItemActive,
                      ]}
                      onPress={() => {
                        setCategory(cat.key);
                        setShowCategoryPicker(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryItemText,
                          category === cat.key && styles.categoryItemTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Quantity */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Quantity</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity}>
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityValue}>{quantity}</Text>
                <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Expiry Date */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Expiry Date (optional)</Text>
              <TextInput
                style={styles.textInput}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.gray400}
                keyboardType="numbers-and-punctuation"
              />
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <Button
                title="Cancel"
                onPress={handleClose}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title="Save"
                onPress={handleSave}
                variant="primary"
                disabled={!name.trim()}
                style={styles.saveButton}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxHeight: '90%',
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.charcoal,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.gray600,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.base,
    color: colors.charcoal,
    backgroundColor: colors.gray50,
  },
  locationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  locationButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    backgroundColor: colors.gray50,
  },
  locationButtonActive: {
    borderColor: colors.hearthOrange,
    backgroundColor: colors.hearthOrangeLight,
  },
  locationEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  locationText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.gray600,
  },
  locationTextActive: {
    color: colors.hearthOrange,
    fontWeight: typography.bold,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    backgroundColor: colors.gray50,
  },
  pickerButtonText: {
    fontSize: typography.base,
    color: colors.charcoal,
  },
  pickerArrow: {
    fontSize: typography.sm,
    color: colors.gray400,
  },
  categoryList: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    maxHeight: 200,
  },
  categoryItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  categoryItemActive: {
    backgroundColor: colors.hearthOrangeLight,
  },
  categoryItemText: {
    fontSize: typography.base,
    color: colors.charcoal,
  },
  categoryItemTextActive: {
    color: colors.hearthOrange,
    fontWeight: typography.semibold,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonText: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.charcoal,
  },
  quantityValue: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.charcoal,
    minWidth: 50,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
