import { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing } from '../lib/theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
  haptic?: boolean;
}

const BOX_SIZES = {
  sm: 20,
  md: 24,
  lg: 32,
} as const;

const CHECKMARK_SIZES = {
  sm: 12,
  md: 14,
  lg: 20,
} as const;

const LABEL_SIZES = {
  sm: typography.sm,
  md: typography.base,
  lg: typography.lg,
} as const;

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  color = colors.hearthOrange,
  style,
  haptic = true,
}: CheckboxProps) {
  const checkmarkScaleAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const containerScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(checkmarkScaleAnim, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [checked, checkmarkScaleAnim]);

  const triggerHaptic = () => {
    if (haptic) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        // Haptics not supported on this platform
      }
    }
  };

  const handlePressIn = () => {
    Animated.spring(containerScaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(containerScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePress = () => {
    if (!disabled) {
      triggerHaptic();
      onChange(!checked);
    }
  };

  const boxSize = BOX_SIZES[size];
  const checkmarkSize = CHECKMARK_SIZES[size];
  const labelSize = LABEL_SIZES[size];

  return (
    <Animated.View style={{ transform: [{ scale: containerScaleAnim }] }}>
      <TouchableOpacity
        style={[styles.container, disabled && styles.disabled, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.box,
            {
              width: boxSize,
              height: boxSize,
              backgroundColor: checked ? color : 'transparent',
              borderColor: checked ? color : colors.gray200,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.checkmarkContainer,
              {
                transform: [{ scale: checkmarkScaleAnim }],
              },
            ]}
          >
            <Text
              style={[
                styles.checkmark,
                { fontSize: checkmarkSize },
              ]}
            >
              ✓
            </Text>
          </Animated.View>
        </View>
        {label && (
          <Text
            style={[
              styles.label,
              { fontSize: labelSize },
              disabled && styles.labelDisabled,
            ]}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  box: {
    borderWidth: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: typography.bold,
  },
  label: {
    marginLeft: spacing.sm,
    color: colors.charcoal,
  },
  labelDisabled: {
    color: colors.gray400,
  },
});
