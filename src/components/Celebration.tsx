import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { colors } from '../lib/theme';

interface CelebrationProps {
  visible: boolean;
  message?: string;
}

const EMOJIS = ['🎉', '🎊', '✨', '🌟', '⭐', '💫', '🔥', '👏'];
const { width, height } = Dimensions.get('window');

function CelebrationEmoji({ delay, startX }: { delay: number; startX: number }) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(startX)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: height * 0.4,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: startX + (Math.random() - 0.5) * 100,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => animation.stop();
  }, [delay, startX, translateY, translateX, opacity, rotate]);

  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', `${360 * (Math.random() > 0.5 ? 1 : -1)}deg`],
  });

  return (
    <Animated.Text
      style={[
        styles.emoji,
        {
          opacity,
          transform: [
            { translateX },
            { translateY },
            { rotate: rotateInterpolate },
          ],
        },
      ]}
    >
      {EMOJIS[Math.floor(Math.random() * EMOJIS.length)]}
    </Animated.Text>
  );
}

export function Celebration({ visible, message = 'Well done!' }: CelebrationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);

  if (!visible) return null;

  const emojiPositions = Array.from({ length: 12 }, (_, i) => ({
    delay: i * 100,
    startX: (width / 12) * i,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {emojiPositions.map((pos, index) => (
        <CelebrationEmoji key={index} delay={pos.delay} startX={pos.startX} />
      ))}
      <Animated.View
        style={[
          styles.messageContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.messageEmoji}>🎉</Text>
        <Text style={styles.messageText}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  emoji: {
    position: 'absolute',
    fontSize: 32,
    top: 0,
  },
  messageContainer: {
    backgroundColor: colors.hearthOrange,
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  messageEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
});
