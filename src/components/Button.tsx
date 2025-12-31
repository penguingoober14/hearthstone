import { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View, ActivityIndicator } from 'react-native';
import { colors, borderRadius, typography, shadows, glows } from '../lib/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  glow?: boolean;
  fullWidth?: boolean;
  leftIcon?: string;
  rightIcon?: string;
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
  glow = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  // Determine if this variant uses white text (for ActivityIndicator color)
  const hasWhiteText = ['primary', 'secondary', 'gradient', 'danger', 'success'].includes(variant);

  const buttonStyle = [
    styles.base,
    sizeStyles[size],
    variantStyles[variant],
    // Default shadow (sm), enhanced when pressed (md)
    isPressed ? shadows.md : shadows.sm,
    // Apply glow effect when enabled and variant is primary
    glow && variant === 'primary' && glows.glowOrange,
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    textSizeStyles[size],
    textVariantStyles[variant],
    disabled && styles.textDisabled,
  ];

  const handlePress = () => {
    // TODO: Add haptic feedback here
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onPress();
  };

  const handlePressIn = () => {
    setIsPressed(true);
  };

  const handlePressOut = () => {
    setIsPressed(false);
  };

  // Build the text content with optional icons
  const renderContent = () => {
    // Handle legacy icon prop (shown before title)
    const effectiveLeftIcon = leftIcon || icon;

    return (
      <View style={styles.contentContainer}>
        {effectiveLeftIcon && <Text style={textStyle}>{effectiveLeftIcon} </Text>}
        <Text style={textStyle}>{title}</Text>
        {rightIcon && <Text style={textStyle}> {rightIcon}</Text>}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={hasWhiteText ? '#FFFFFF' : colors.hearthOrange}
          size="small"
        />
      ) : (
        renderContent()
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
  fullWidth: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  // TODO: Replace with LinearGradient from expo-linear-gradient
  // Example: <LinearGradient colors={gradients.primaryGradient} style={...}>
  gradient: {
    backgroundColor: colors.hearthOrange,
  },
  danger: {
    backgroundColor: colors.softRed,
  },
  success: {
    backgroundColor: colors.success,
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
  gradient: {
    color: '#FFFFFF',
  },
  danger: {
    color: '#FFFFFF',
  },
  success: {
    color: '#FFFFFF',
  },
});
