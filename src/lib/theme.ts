// Hearthstone Design System - Colors & Theme

export const colors = {
  // Primary palette
  hearthOrange: '#E85D04',
  charcoal: '#2D3436',
  cream: '#FDF6E3',
  sageGreen: '#52796F',
  softRed: '#D62828',

  // Extended palette
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Transparent variants
  hearthOrangeLight: 'rgba(232, 93, 4, 0.1)',
  sageGreenLight: 'rgba(82, 121, 111, 0.1)',
  softRedLight: 'rgba(214, 40, 40, 0.1)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,

  // Font weights
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,

  // Line heights (prefixed to avoid conflict with fontWeight normal)
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: '#E85D04', // hearthOrange
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

// Gradient color arrays for LinearGradient components
export const gradients = {
  primaryGradient: ['#E85D04', '#DC2626'] as const,
  successGradient: ['#10B981', '#059669'] as const,
  streakGradient: ['#F59E0B', '#E85D04'] as const,
  darkGradient: ['#1F2937', '#111827'] as const,
} as const;

// Glow shadow presets for highlighted elements
export const glows = {
  glowOrange: {
    shadowColor: '#E85D04', // hearthOrange
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  glowSuccess: {
    shadowColor: '#10B981', // success
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  glowWarning: {
    shadowColor: '#F59E0B', // warning
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

// Glassmorphism effect presets
// Note: For blur effect, use expo-blur's BlurView component
export const glassmorphism = {
  glassLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    // Apply blur using: <BlurView intensity={20} tint="light" />
  },
  glassDark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    // Apply blur using: <BlurView intensity={20} tint="dark" />
  },
} as const;

// Animation timing constants (in milliseconds)
export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  // Easing functions - use with Animated API or Reanimated
  easing: {
    // Placeholder: import { Easing } from 'react-native-reanimated'
    // or use Animated.Easing from 'react-native'
  },
} as const;
