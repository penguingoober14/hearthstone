import { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  Animated,
  Text,
  LayoutChangeEvent,
} from 'react-native';
import { colors, typography, spacing, animation } from '../lib/theme';

/**
 * Size presets for the progress bar height
 */
const SIZE_HEIGHTS = {
  sm: 4,
  md: 8,
  lg: 12,
} as const;

type ProgressBarSize = keyof typeof SIZE_HEIGHTS;
type LabelPosition = 'right' | 'top' | 'inside';

interface ProgressBarProps {
  /** Progress value from 0-100 */
  progress: number;
  /** Fill color of the progress bar */
  color?: string;
  /** Background color of the track */
  backgroundColor?: string;
  /** Custom height (overrides size preset) */
  height?: number;
  /** Size preset: 'sm' (4px), 'md' (8px), 'lg' (12px) */
  size?: ProgressBarSize;
  /** Enable/disable animation (default: true) */
  animated?: boolean;
  /** Show percentage label */
  showLabel?: boolean;
  /** Position of the percentage label */
  labelPosition?: LabelPosition;
  /** Label text color */
  labelColor?: string;
  /**
   * Enable striped pattern (visual indicator for active/loading state)
   *
   * Implementation note: For a true striped effect, you would need to:
   * 1. Create a diagonal striped pattern using SVG or a repeating linear gradient image
   * 2. Use an animated translateX to create a "barber pole" moving effect
   * 3. Example with expo-linear-gradient + animated transform:
   *    - Create multiple thin LinearGradient slices at 45deg angle
   *    - Animate the container's translateX in a loop
   * 4. Alternative: Use a pre-made striped PNG pattern as ImageBackground
   */
  striped?: boolean;
  /** Container style override */
  style?: ViewStyle;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
}

/**
 * Animated progress bar component with multiple display options
 *
 * ## Gradient Support (expo-linear-gradient)
 *
 * To use a gradient fill instead of solid color, you can replace the
 * fill View with LinearGradient:
 *
 * ```tsx
 * import { LinearGradient } from 'expo-linear-gradient';
 * import { gradients } from '../lib/theme';
 *
 * // Replace the Animated.View fill with:
 * <Animated.View style={[styles.fill, { width: animatedWidth, height: barHeight }]}>
 *   <LinearGradient
 *     colors={gradients.primaryGradient}
 *     start={{ x: 0, y: 0 }}
 *     end={{ x: 1, y: 0 }}
 *     style={{ flex: 1, borderRadius: barHeight / 2 }}
 *   />
 * </Animated.View>
 * ```
 *
 * Make sure to install expo-linear-gradient:
 * `npx expo install expo-linear-gradient`
 */
export function ProgressBar({
  progress,
  color = colors.hearthOrange,
  backgroundColor = colors.gray200,
  height,
  size = 'md',
  animated = true,
  showLabel = false,
  labelPosition = 'right',
  labelColor = colors.gray600,
  striped = false,
  style,
  accessibilityLabel = 'Progress',
}: ProgressBarProps) {
  // Determine bar height from size preset or custom height
  const barHeight = height ?? SIZE_HEIGHTS[size];

  // Clamp progress to valid range
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Track container width for pixel-based animation
  const containerWidth = useRef(0);

  // Animated value for the fill width (as pixels)
  const animatedProgress = useRef(new Animated.Value(0)).current;

  // Track if this is the initial mount
  const isFirstRender = useRef(true);

  // Animate progress changes
  useEffect(() => {
    const targetWidth = (clampedProgress / 100) * containerWidth.current;

    if (animated && !isFirstRender.current && containerWidth.current > 0) {
      Animated.timing(animatedProgress, {
        toValue: targetWidth,
        duration: animation.normal,
        useNativeDriver: false, // width animation requires JS driver
      }).start();
    } else {
      // Set immediately on first render or when animation is disabled
      animatedProgress.setValue(targetWidth);
    }

    isFirstRender.current = false;
  }, [clampedProgress, animated, animatedProgress]);

  // Handle container layout to get actual width for animation
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    containerWidth.current = width;
    // Update animated value to match new container width
    const targetWidth = (clampedProgress / 100) * width;
    animatedProgress.setValue(targetWidth);
  };

  // Render the percentage label
  const renderLabel = () => {
    if (!showLabel) return null;

    const labelText = `${Math.round(clampedProgress)}%`;

    // For 'inside' position, only show if bar is large enough
    if (labelPosition === 'inside') {
      return (
        <Text
          style={[
            styles.labelInside,
            {
              color: colors.white,
              fontSize: barHeight >= 12 ? typography.xs : typography.xs - 2,
              lineHeight: barHeight,
            },
          ]}
          numberOfLines={1}
        >
          {labelText}
        </Text>
      );
    }

    return (
      <Text
        style={[
          styles.labelExternal,
          { color: labelColor, fontSize: typography.sm },
        ]}
      >
        {labelText}
      </Text>
    );
  };

  // Main progress bar content
  const progressBarContent = (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          height: barHeight,
          borderRadius: barHeight / 2,
        },
      ]}
      onLayout={handleLayout}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: animatedProgress,
            height: barHeight,
            borderRadius: barHeight / 2,
          },
          // Striped indicator style (adds subtle opacity variation)
          striped && styles.stripedIndicator,
        ]}
      >
        {/* Inside label positioned within the fill */}
        {showLabel && labelPosition === 'inside' && renderLabel()}
      </Animated.View>
    </View>
  );

  // Accessibility props for screen readers
  const accessibilityProps = {
    accessible: true,
    accessibilityRole: 'progressbar' as const,
    accessibilityLabel: `${accessibilityLabel}: ${Math.round(clampedProgress)} percent`,
    accessibilityValue: {
      min: 0,
      max: 100,
      now: Math.round(clampedProgress),
    },
  };

  // Wrap with label container if needed
  if (showLabel && labelPosition === 'top') {
    return (
      <View style={[styles.wrapper, style]} {...accessibilityProps}>
        <View style={styles.topLabelContainer}>
          {renderLabel()}
        </View>
        {progressBarContent}
      </View>
    );
  }

  if (showLabel && labelPosition === 'right') {
    return (
      <View style={[styles.wrapper, styles.rowWrapper, style]} {...accessibilityProps}>
        <View style={styles.flexGrow}>{progressBarContent}</View>
        {renderLabel()}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]} {...accessibilityProps}>
      {progressBarContent}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // Wrapper for label positioning
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexGrow: {
    flex: 1,
  },
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    justifyContent: 'center',
  },
  labelExternal: {
    marginLeft: spacing.sm,
    fontWeight: typography.medium,
  },
  labelInside: {
    paddingHorizontal: spacing.xs,
    fontWeight: typography.bold,
    textAlign: 'right',
  },
  topLabelContainer: {
    marginBottom: spacing.xs,
    alignItems: 'flex-end',
  },
  /**
   * Striped indicator style
   *
   * For a true animated striped pattern, consider:
   * 1. Using an SVG pattern with diagonal lines
   * 2. Creating an animated "barber pole" effect with translateX
   * 3. Using a tiled background image
   *
   * This basic implementation adds a subtle visual difference.
   * For production striped bars, expo-linear-gradient with
   * multiple color stops can create a static striped pattern.
   */
  stripedIndicator: {
    // Subtle opacity to indicate striped mode is active
    // Replace with actual striped implementation as needed
    opacity: 0.9,
  },
});
