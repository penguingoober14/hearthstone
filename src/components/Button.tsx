import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors, borderRadius, typography } from '../lib/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const buttonStyle = [
    styles.base,
    sizeStyles[size],
    variantStyles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    textSizeStyles[size],
    textVariantStyles[variant],
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : colors.hearthOrange}
          size="small"
        />
      ) : (
        <Text style={textStyle}>
          {icon ? `${icon} ` : ''}{title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
  },
  text: {
    fontWeight: typography.bold,
  },
  disabled: {
    opacity: 0.5,
  },
  textDisabled: {
    opacity: 0.7,
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  md: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  lg: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
});

const textSizeStyles = StyleSheet.create({
  sm: {
    fontSize: typography.sm,
  },
  md: {
    fontSize: typography.base,
  },
  lg: {
    fontSize: typography.lg,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.hearthOrange,
  },
  secondary: {
    backgroundColor: colors.sageGreen,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.hearthOrange,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});

const textVariantStyles = StyleSheet.create({
  primary: {
    color: '#FFFFFF',
  },
  secondary: {
    color: '#FFFFFF',
  },
  outline: {
    color: colors.hearthOrange,
  },
  ghost: {
    color: colors.hearthOrange,
  },
});
