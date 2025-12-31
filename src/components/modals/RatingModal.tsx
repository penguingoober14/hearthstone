import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { colors, borderRadius, spacing, shadows, glows, animation } from '../../lib/theme';
import { Button } from '../Button';
import { Typography } from '../Typography';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, notes?: string) => void;
  mealName: string;
}

function AnimatedStar({
  filled,
  onPress,
}: {
  filled: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.2,
      useNativeDriver: true,
      friction: 3,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 3,
      tension: 100,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={styles.starButton}
    >
      <Animated.View
        style={[
          styles.starWrapper,
          filled && styles.starGlow,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Animated.Text style={[styles.star, filled && styles.starFilled]}>
          {filled ? '\u2605' : '\u2606'}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function RatingModal({ visible, onClose, onSubmit, mealName }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

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

  const getRatingLabel = () => {
    switch (rating) {
      case 0:
        return 'Tap a star to rate';
      case 1:
        return 'Not great';
      case 2:
        return 'Could be better';
      case 3:
        return 'Good';
      case 4:
        return 'Very good';
      case 5:
        return 'Amazing!';
      default:
        return '';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Typography variant="h2" style={styles.title}>
            Rate Your Meal
          </Typography>

          {/* Meal Name with Background Highlight */}
          <View style={styles.mealNameContainer}>
            <Typography variant="h3" color={colors.hearthOrange} style={styles.mealName}>
              {mealName}
            </Typography>
          </View>

          {/* Star Rating */}
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <AnimatedStar
                key={star}
                filled={star <= rating}
                onPress={() => setRating(star)}
              />
            ))}
          </View>
          <Typography variant="caption" style={styles.ratingLabel}>
            {getRatingLabel()}
          </Typography>

          {/* Notes Input */}
          <View style={styles.fieldContainer}>
            <Typography variant="label" style={styles.label}>
              Notes (optional)
            </Typography>
            <TextInput
              style={[
                styles.textInput,
                isInputFocused && styles.textInputFocused,
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any thoughts about this meal?"
              placeholderTextColor={colors.gray400}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
            />
          </View>

          {/* Take Photo Button */}
          <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
            <Typography variant="h3" style={styles.photoIcon}>
              {'\uD83D\uDCF7'}
            </Typography>
            <Typography variant="body" color={colors.gray600} style={styles.photoText}>
              Take Photo
            </Typography>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 400,
    ...shadows.xl,
  },
  title: {
    textAlign: 'center',
  },
  mealNameContainer: {
    backgroundColor: colors.hearthOrangeLight,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    alignSelf: 'center',
  },
  mealName: {
    textAlign: 'center',
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
  starWrapper: {
    borderRadius: borderRadius.full,
  },
  star: {
    fontSize: 52,
    color: colors.gray300,
  },
  starFilled: {
    color: colors.warning,
  },
  starGlow: {
    ...glows.glowWarning,
  },
  ratingLabel: {
    textAlign: 'center',
    marginBottom: spacing.xl,
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
    minHeight: 80,
    ...shadows.sm,
  },
  textInputFocused: {
    borderColor: colors.hearthOrange,
    borderWidth: 2,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderStyle: 'dashed',
    marginBottom: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.gray50,
    ...shadows.sm,
  },
  photoIcon: {
    fontSize: 32,
  },
  photoText: {
    fontWeight: '600',
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
