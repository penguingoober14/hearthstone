import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../lib/theme';

interface DetailModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  emoji?: string;
  children: React.ReactNode;
  primaryAction?: {
    label: string;
    onPress: () => void;
  };
}

export function DetailModal({
  visible,
  onClose,
  title,
  emoji,
  children,
  primaryAction,
}: DetailModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            {emoji && <Text style={styles.emoji}>{emoji}</Text>}
            <Text style={styles.title}>{title}</Text>
          </View>

          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>

          <View style={styles.footer}>
            {primaryAction && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={primaryAction.onPress}
              >
                <Text style={styles.primaryButtonText}>{primaryAction.label}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.closeButton, !primaryAction && styles.closeButtonFull]}
              onPress={onClose}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
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
  content: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    ...shadows.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  emoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.charcoal,
    flex: 1,
  },
  body: {
    padding: spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    gap: spacing.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.hearthOrange,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    flex: 1,
    backgroundColor: colors.gray100,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  closeButtonFull: {
    flex: 1,
  },
  closeButtonText: {
    color: colors.charcoal,
    fontSize: 16,
    fontWeight: '500',
  },
});
