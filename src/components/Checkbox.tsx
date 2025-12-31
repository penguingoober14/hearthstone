import { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import { colors, typography, spacing } from '../lib/theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
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
}: CheckboxProps) {
  const scaleAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [checked, scaleAnim]);

  const handlePress = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const boxSize = BOX_SIZES[size];
  const checkmarkSize = CHECKMARK_SIZES[size];
  const labelSize = LABEL_SIZES[size];

  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled, style]}
      onPress={handlePress}
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
              transform: [{ scale: scaleAnim }],
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
