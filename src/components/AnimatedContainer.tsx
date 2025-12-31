import React, { useEffect, useRef, ReactNode } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';

type AnimationType = 'fadeIn' | 'slideUp' | 'fadeSlideUp';

interface AnimatedContainerProps {
  children: ReactNode;
  animation?: AnimationType;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedContainer({
  children,
  animation = 'fadeSlideUp',
  delay = 0,
  duration = 300,
  style,
}: AnimatedContainerProps) {
  const opacity = useRef(new Animated.Value(animation === 'slideUp' ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(animation === 'fadeIn' ? 0 : 20)).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];

    // FadeIn animation
    if (animation === 'fadeIn' || animation === 'fadeSlideUp') {
      animations.push(
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        })
      );
    }

    // SlideUp animation
    if (animation === 'slideUp' || animation === 'fadeSlideUp') {
      animations.push(
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay,
          useNativeDriver: true,
        })
      );
    }

    // Run animations in parallel
    Animated.parallel(animations).start();
  }, [animation, delay, duration, opacity, translateY]);

  const animatedStyle: Animated.WithAnimatedObject<ViewStyle> = {
    opacity,
    transform: [{ translateY }],
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}
