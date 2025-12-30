import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors, borderRadius, typography, spacing } from '../../lib/theme';
import { Button } from '../Button';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, notes?: string) => void;
  mealName: string;
}

export function RatingModal({ visible, onClose, onSubmit, mealName }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setRating(0);
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (rating === 0) return;

    onSubmit(rating, notes.trim() || undefined);
    resetForm();
    onClose();
  };

  const handleTakePhoto = () => {
    Alert.alert('Coming Soon', 'Photo capture will be available in a future update!');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Rate Your Meal</Text>
          <Text style={styles.mealName}>{mealName}</Text>

          {/* Star Rating */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Text style={[styles.star, star <= rating && styles.starFilled]}>
                  {star <= rating ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 0 && 'Tap a star to rate'}
            {rating === 1 && 'Not great'}
            {rating === 2 && 'Could be better'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very good'}
            {rating === 5 && 'Amazing!'}
          </Text>

          {/* Notes Input */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={styles.textInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any thoughts about this meal?"
              placeholderTextColor={colors.gray400}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Take Photo Button */}
          <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
            <Text style={styles.photoIcon}>📷</Text>
            <Text style={styles.photoText}>Take Photo</Text>
          </TouchableOpacity>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Button
              title="Cancel"
              onPress={handleClose}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="Submit"
              onPress={handleSubmit}
              variant="primary"
              disabled={rating === 0}
              style={styles.submitButton}
            />
          </View>
        </View>
      </View>
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
    maxWidth: 400,
  },
  title: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.charcoal,
    textAlign: 'center',
  },
  mealName: {
    fontSize: typography.lg,
    fontWeight: typography.medium,
    color: colors.hearthOrange,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
  },
  star: {
    fontSize: 40,
    color: colors.gray300,
  },
  starFilled: {
    color: colors.warning,
  },
  ratingLabel: {
    fontSize: typography.sm,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: spacing.xl,
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
    minHeight: 80,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  photoIcon: {
    fontSize: 24,
  },
  photoText: {
    fontSize: typography.base,
    color: colors.gray500,
    fontWeight: typography.medium,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
