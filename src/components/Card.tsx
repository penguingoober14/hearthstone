import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing, shadows, glows, glassmorphism } from '../lib/theme';

/**
 * Card variant types
 * - 'default': Standard white card with subtle shadow
 * - 'highlight': Orange background card for emphasis
 * - 'urgent': Light red with border for alerts
 * - 'muted': Subtle sage green, no shadow
 * - 'glass': Glassmorphism effect with semi-transparent background
 *   Note: For full effect, wrap content with expo-blur's BlurView
 * - 'gradient': Placeholder for gradient backgrounds
 *   Usage: Use with expo-linear-gradient's LinearGradient as a child or wrapper
 *   Example:
 *     <Card variant="gradient" style={{ overflow: 'hidden' }}>
 *       <LinearGradient colors={gradients.primaryGradient} style={StyleSheet.absoluteFill} />
 *       <View style={{ zIndex: 1 }}>{children}</View>
 *     </Card>
 * - 'glow': Applies glowOrange shadow effect for highlighted elements
 */
export type CardVariant = 'default' | 'highlight' | 'urgent' | 'muted' | 'glass' | 'gradient' | 'glow';

/**
 * Accent position for decorative border accent
 * - 'top': 3px accent border on top
 * - 'left': 3px accent border on left
 * - 'none': No accent border
 */
export type AccentPosition = 'top' | 'left' | 'none';

/**
 * Elevation levels for shadow depth
 * - 'none': No shadow
 * - 'sm': Subtle shadow
 * - 'md': Medium shadow (default)
 * - 'lg': Prominent shadow
 * - 'xl': Heavy shadow for floating elements
 */
export type ElevationLevel = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Visual variant of the card */
  variant?: CardVariant;
  /** Additional styles to apply */
  style?: ViewStyle;
  /** Position of the accent border */
  accentPosition?: AccentPosition;
  /** Color of the accent border (default: hearthOrange) */
  accentColor?: string;
  /** Shadow elevation level */
  elevation?: ElevationLevel;
}

export function Card({
  children,
  variant = 'default',
  style,
  accentPosition = 'none',
  accentColor = colors.hearthOrange,
  elevation,
}: CardProps) {
  // Build accent styles based on position
  const accentStyles: ViewStyle = {};
  if (accentPosition === 'top') {
    accentStyles.borderTopWidth = 3;
    accentStyles.borderTopColor = accentColor;
  } else if (accentPosition === 'left') {
    accentStyles.borderLeftWidth = 3;
    accentStyles.borderLeftColor = accentColor;
  }

  // Get elevation shadow styles
  const elevationStyles = elevation ? elevationMap[elevation] : undefined;

  return (
    <View
      style={[
        styles.card,
        variantStyles[variant],
        accentStyles,
        elevationStyles,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
});

const variantStyles = StyleSheet.create({
  default: {},
  highlight: {
    backgroundColor: colors.hearthOrange,
  },
  urgent: {
    backgroundColor: colors.softRedLight,
    borderWidth: 1,
    borderColor: colors.softRed,
  },
  muted: {
    backgroundColor: colors.sageGreenLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  glass: {
    ...glassmorphism.glassLight,
  },
  gradient: {
    // Gradient variant: use transparent background
    // Apply gradient using expo-linear-gradient's LinearGradient component
    backgroundColor: 'transparent',
  },
  glow: {
    ...glows.glowOrange,
  },
});

// Elevation shadow mapping
const elevationMap: Record<ElevationLevel, ViewStyle> = {
  none: {
    shadowOpacity: 0,
    elevation: 0,
  },
  sm: shadows.sm,
  md: shadows.md,
  lg: shadows.lg,
  xl: shadows.xl,
};
