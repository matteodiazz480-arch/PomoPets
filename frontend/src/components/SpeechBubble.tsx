import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  text: string;
  large?: boolean;
};

export default function SpeechBubble({ text, large = false }: Props) {
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, friction: 6, tension: 90, useNativeDriver: true }).start();
  }, [text, pop]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const opacity = pop;

  return (
    <Animated.View style={[styles.wrap, large && styles.largeWrap, { opacity, transform: [{ scale }] }]}>
      <View style={[styles.bubble, large && styles.largeBubble]}>
        <Text style={[styles.text, large && styles.largeText]}>{text}</Text>
      </View>
      <View style={styles.tailShadow} />
      <View style={styles.tail} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    maxWidth: 260,
  },
  bubble: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  largeWrap: {
    maxWidth: 360,
  },
  largeBubble: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  largeText: {
    fontSize: 16,
  },
  tailShadow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.border,
    marginTop: -2,
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.card,
    marginTop: -11,
  },
});
