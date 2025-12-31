import { Text, TextStyle, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { colors, typography } from '../lib/theme';

type TypographyVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'button';

interface TypographyProps {
  variant?: TypographyVariant;
  color?: string;
  style?: TextStyle;
  children: ReactNode;
}

export function Typography({
  variant = 'body',
  color,
  style,
  children,
}: TypographyProps) {
  return (
    <Text style={[variantStyles[variant], color ? { color } : null, style]}>
      {children}
    </Text>
  );
}

const variantStyles = StyleSheet.create({
  display: {
    fontSize: typography.display,
    fontWeight: typography.bold,
    color: colors.charcoal,
  },
  h1: {
    fontSize: typography.xxxl,
    fontWeight: typography.bold,
    color: colors.charcoal,
  },
  h2: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.charcoal,
  },
  h3: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.charcoal,
  },
  h4: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.charcoal,
  },
  body: {
    fontSize: typography.base,
    fontWeight: typography.normal,
    color: colors.charcoal,
  },
  bodySmall: {
    fontSize: typography.sm,
    fontWeight: typography.normal,
    color: colors.gray600,
  },
  caption: {
    fontSize: typography.xs,
    fontWeight: typography.normal,
    color: colors.gray500,
  },
  label: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.gray600,
  },
  button: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.white,
  },
});
