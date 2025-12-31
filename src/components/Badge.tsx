import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../lib/theme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  style?: ViewStyle;
}

export function BadgePill({
  label,
  variant = 'default',
  size = 'md',
  icon,
  style,
}: BadgeProps) {
  const badgeStyle = [
    styles.base,
    sizeStyles[size],
    variantStyles[variant],
    style,
  ];

  const textStyle = [
    styles.text,
    textSizeStyles[size],
    textVariantStyles[variant],
  ];

  return (
    <View style={badgeStyle}>
      <Text style={textStyle}>
        {icon ? `${icon} ` : ''}{label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  text: {
    fontWeight: '500',
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  md: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  lg: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
});

const textSizeStyles = StyleSheet.create({
  sm: {
    fontSize: 12,
  },
  md: {
    fontSize: 14,
  },
  lg: {
    fontSize: 16,
  },
});

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: colors.gray100,
  },
  primary: {
    backgroundColor: colors.hearthOrange,
  },
  success: {
    backgroundColor: colors.success,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  danger: {
    backgroundColor: colors.softRed,
  },
  muted: {
    backgroundColor: colors.gray200,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.hearthOrange,
  },
});

const textVariantStyles = StyleSheet.create({
  default: {
    color: colors.charcoal,
  },
  primary: {
    color: '#FFFFFF',
  },
  success: {
    color: '#FFFFFF',
  },
  warning: {
    color: '#FFFFFF',
  },
  danger: {
    color: '#FFFFFF',
  },
  muted: {
    color: colors.gray600,
  },
  outline: {
    color: colors.hearthOrange,
  },
});
