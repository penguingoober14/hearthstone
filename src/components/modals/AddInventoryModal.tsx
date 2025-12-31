import React, { useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, borderRadius, spacing, shadows } from '../../lib/theme';
import { Button } from '../Button';
import { Typography } from '../Typography';
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

const CATEGORIES: { key: FoodCategory; label: string; emoji: string }[] = [
  { key: 'protein', label: 'Protein', emoji: '🥩' },
  { key: 'dairy', label: 'Dairy', emoji: '🧀' },
  { key: 'produce', label: 'Produce', emoji: '🥬' },
  { key: 'grains', label: 'Grains', emoji: '🌾' },
  { key: 'canned', label: 'Canned', emoji: '🥫' },
  { key: 'condiments', label: 'Condiments', emoji: '🧂' },
  { key: 'frozen', label: 'Frozen', emoji: '🧊' },
  { key: 'snacks', label: 'Snacks', emoji: '🍿' },
  { key: 'beverages', label: 'Beverages', emoji: '🥤' },
  { key: 'other', label: 'Other', emoji: '📦' },
];

export function AddInventoryModal({ visible, onClose, onSave }: AddInventoryModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [location, setLocation] = useState<LocationType>('fridge');
  const [category, setCategory] = useState<FoodCategory>('other');
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState('');

  const resetForm = () => {
    setName('');
    setEmoji('');
    setLocation('fridge');
    setCategory('other');
    setQuantity(1);
    setExpiryDate('');
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Modal Header */}
          <View style={styles.header}>
            <Typography variant="h2" style={styles.title}>Add Item</Typography>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {/* Name Input */}
            <View style={styles.fieldContainer}>
              <Typography variant="label" style={styles.label}>Name *</Typography>
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
              <Typography variant="label" style={styles.label}>Emoji</Typography>
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
              <Typography variant="label" style={styles.label}>Location</Typography>
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
                    <Typography variant="h2" style={styles.locationEmoji}>{loc.emoji}</Typography>
                    <Typography
                      variant="bodySmall"
                      style={[
                        styles.locationText,
                        location === loc.key && styles.locationTextActive,
                      ]}
                    >
                      {loc.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Picker - 2 Column Grid */}
            <View style={styles.fieldContainer}>
              <Typography variant="label" style={styles.label}>Category</Typography>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryItem,
                      category === cat.key && styles.categoryItemActive,
                    ]}
                    onPress={() => setCategory(cat.key)}
                  >
                    <Typography variant="h3" style={styles.categoryEmoji}>{cat.emoji}</Typography>
                    <Typography
                      variant="bodySmall"
                      style={[
                        styles.categoryText,
                        category === cat.key && styles.categoryTextActive,
                      ]}
                    >
                      {cat.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Quantity */}
            <View style={styles.fieldContainer}>
              <Typography variant="label" style={styles.label}>Quantity</Typography>
              <View style={styles.quantityRow}>
                <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity}>
                  <Typography variant="h2" color={colors.charcoal}>-</Typography>
                </TouchableOpacity>
                <Typography variant="h2" style={styles.quantityValue}>{quantity}</Typography>
                <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
                  <Typography variant="h2" color={colors.charcoal}>+</Typography>
                </TouchableOpacity>
              </View>
            </View>

            {/* Expiry Date */}
            <View style={styles.fieldContainer}>
              <Typography variant="label" style={styles.label}>Expiry Date (optional)</Typography>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
    ...shadows.lg,
  },
  header: {
    backgroundColor: colors.hearthOrangeLight,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  title: {
    textAlign: 'center',
    color: colors.hearthOrange,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: spacing.xl,
  },
  fieldContainer: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
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
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    backgroundColor: colors.gray50,
    minHeight: 80,
  },
  locationButtonActive: {
    borderColor: colors.hearthOrange,
    backgroundColor: colors.hearthOrangeLight,
    ...shadows.sm,
  },
  locationEmoji: {
    marginBottom: spacing.xs,
  },
  locationText: {
    color: colors.gray600,
    fontWeight: '500',
  },
  locationTextActive: {
    color: colors.hearthOrange,
    fontWeight: '700',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    backgroundColor: colors.gray50,
    gap: spacing.sm,
  },
  categoryItemActive: {
    borderColor: colors.hearthOrange,
    backgroundColor: colors.hearthOrangeLight,
    ...shadows.sm,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryText: {
    color: colors.gray600,
    flex: 1,
  },
  categoryTextActive: {
    color: colors.hearthOrange,
    fontWeight: '600',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  quantityButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  quantityValue: {
    minWidth: 60,
    textAlign: 'center',
    color: colors.charcoal,
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
