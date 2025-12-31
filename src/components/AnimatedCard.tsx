import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Card, CardProps } from './Card';

export interface AnimatedCardProps extends Omit<CardProps, 'style'> {
  /** Callback when card is pressed */
  onPress?: () => void;
  /** Scale factor when pressed (default: 0.98) */
  pressScale?: number;
  /** Whether to animate on mount with fade in and slide up (default: false) */
  animateOnMount?: boolean;
  /** Delay before mount animation starts in ms (useful for staggered animations) */
  mountDelay?: number;
  /** Additional styles to apply (supports array syntax) */
  style?: StyleProp<ViewStyle>;
}

export function AnimatedCard({
  children,
  onPress,
  pressScale = 0.98,
  animateOnMount = false,
  mountDelay = 0,
  style,
  elevation,
  ...cardProps
}: AnimatedCardProps) {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shadowAnim = useRef(new Animated.Value(1)).current;
  const mountOpacity = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const mountTranslateY = useRef(new Animated.Value(animateOnMount ? 20 : 0)).current;

  // Mount animation
  useEffect(() => {
    if (animateOnMount) {
      const timeout = setTimeout(() => {
        Animated.parallel([
          Animated.timing(mountOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(mountTranslateY, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      }, mountDelay);

      return () => clearTimeout(timeout);
    }
  }, [animateOnMount, mountDelay, mountOpacity, mountTranslateY]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: pressScale,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 0.6,
        duration: 100,
        useNativeDriver: false, // Shadow properties don't support native driver
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(shadowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Get shadow opacity based on elevation
  const baseShadowOpacity = getBaseShadowOpacity(elevation);

  const animatedShadowStyle: Animated.AnimatedProps<ViewStyle> = {
    shadowOpacity: shadowAnim.interpolate({
      inputRange: [0.6, 1],
      outputRange: [baseShadowOpacity * 0.6, baseShadowOpacity],
    }),
  };

  const animatedTransformStyle = {
    transform: [
      { scale: scaleAnim },
      { translateY: mountTranslateY },
    ],
    opacity: mountOpacity,
  };

  // Flatten style array to single ViewStyle object
  const flattenedStyle = StyleSheet.flatten(style) as ViewStyle | undefined;

  const cardContent = (
    <Card style={flattenedStyle} elevation={elevation} {...cardProps}>
      {children}
    </Card>
  );

  if (!onPress) {
    // Non-pressable version - just mount animation
    return (
      <Animated.View style={[animatedTransformStyle, animatedShadowStyle]}>
        {cardContent}
      </Animated.View>
    );
  }

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[animatedTransformStyle, animatedShadowStyle]}>
        {cardContent}
      </Animated.View>
    </Pressable>
  );
}

// Helper to get base shadow opacity based on elevation
function getBaseShadowOpacity(elevation?: string): number {
  switch (elevation) {
    case 'none':
      return 0;
    case 'sm':
      return 0.05;
    case 'lg':
      return 0.15;
    case 'xl':
      return 0.2;
    case 'md':
    default:
      return 0.1;
  }
}
