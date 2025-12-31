// Hearthstone Global Styles - Shared Layout & Component Styles

import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows } from './theme';

export const containers = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: spacing.lg,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: colors.cream,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const layout = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  gap8: {
    gap: spacing.sm,
  },
  gap12: {
    gap: spacing.md,
  },
  gap16: {
    gap: spacing.lg,
  },
  gap20: {
    gap: spacing.xl,
  },
  gap24: {
    gap: spacing.xxl,
  },
});

export const cards = StyleSheet.create({
  cardBase: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  cardHighlight: {
    backgroundColor: colors.hearthOrange,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.lg,
  },
  cardMuted: {
    backgroundColor: colors.sageGreenLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  cardUrgent: {
    backgroundColor: colors.softRedLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.softRed,
  },
});

export const dividers = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.md,
  },
  dividerThick: {
    height: 2,
    backgroundColor: colors.gray200,
    marginVertical: spacing.md,
  },
});

export const accents = StyleSheet.create({
  accentBorderLeft: {
    borderLeftWidth: 3,
    borderLeftColor: colors.hearthOrange,
  },
  accentBorderTop: {
    borderTopWidth: 3,
    borderTopColor: colors.hearthOrange,
  },
});
