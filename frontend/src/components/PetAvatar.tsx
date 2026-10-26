import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, View } from 'react-native';
import { useGame } from '../context/GameContext';
import AccessoryOverlay from './AccessoryOverlay';
import type { AccessoryCategory, AccessoryId } from '../data/accessories';

type Props = {
  eyesOpen: any;
  eyesClosed: any;
  size?: number;
  /** Bump this number (e.g. +1) whenever the pet is fed to trigger the reaction animation. */
  feedSignal?: number;
  equipped?: Partial<Record<AccessoryCategory, AccessoryId>>;
};

const BREATH_DURATION = 1700;
const BREATH_AMPLITUDE = 1.055;
const FIRST_BLINK_DELAY_MS = 7000;
const BLINK_INTERVAL_MIN_MS = 5000;
const BLINK_INTERVAL_VARIANCE_MS = 3000;
const BLINK_DURATION_MS = 120;

export default function PetAvatar({
  eyesOpen,
  eyesClosed,
  size = 260,
  feedSignal = 0,
  equipped,
}: Props) {
  const [blinking, setBlinking] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const imageWidth = size * (677 / 369);
  const breath = useRef(new Animated.Value(0)).current;
  const feedBump = useRef(new Animated.Value(0)).current;
  const sparkle = useRef(new Animated.Value(0)).current;
  const isFirstFeedSignal = useRef(true);
  const isFocused = useIsFocused();

  const game = useGame();
  const activeEquipped = equipped ?? game?.state?.equippedAccessories ?? {};

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReducedMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReducedMotion);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!isFocused) {
      breath.setValue(0);
      return;
    }
    let isCancelled = false;

    const runBreathCycle = () => {
      if (isCancelled) return;
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: BREATH_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: BREATH_DURATION,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished && !isCancelled) {
          runBreathCycle();
        }
      });
    };

    runBreathCycle();

    return () => {
      isCancelled = true;
      breath.stopAnimation();
    };
  }, [breath, isFocused]);

  useEffect(() => {
    if (isFirstFeedSignal.current) {
      isFirstFeedSignal.current = false;
      return;
    }
    feedBump.setValue(0);
    sparkle.setValue(0);
    Animated.sequence([
      Animated.timing(feedBump, { toValue: 1, duration: 160, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(feedBump, { toValue: 0, friction: 3.5, tension: 120, useNativeDriver: true }),
    ]).start();
    Animated.timing(sparkle, {
      toValue: 1,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [feedSignal]);

  useEffect(() => {
    if (!isFocused) return;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    let isFirstBlink = true;

    const scheduleBlink = () => {
      const delay = isFirstBlink
        ? FIRST_BLINK_DELAY_MS + Math.random() * 3000
        : BLINK_INTERVAL_MIN_MS + Math.random() * BLINK_INTERVAL_VARIANCE_MS;
      isFirstBlink = false;
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        setBlinking(true);
        timeoutId = setTimeout(() => {
          if (cancelled) return;
          setBlinking(false);
          scheduleBlink();
        }, BLINK_DURATION_MS);
      }, delay);
    };

    scheduleBlink();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isFocused]);

  const breathScale = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [1, reducedMotion ? 1.02 : BREATH_AMPLITUDE],
  });
  const breathTranslateY = breath.interpolate({
    inputRange: [0, 1],
    outputRange: [0, reducedMotion ? -1 : -3.5],
  });
  const bumpScale = feedBump.interpolate({ inputRange: [0, 1], outputRange: [1, 1.14] });
  const sparkleTranslateY = sparkle.interpolate({ inputRange: [0, 1], outputRange: [0, -48] });
  const sparkleOpacity = sparkle.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.petImageFrame,
          { width: size, height: size },
          { transform: [{ scale: bumpScale }] },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ scale: breathScale }, { translateY: breathTranslateY }] },
          ]}
        >
          <Image
            source={eyesOpen}
            style={[
              styles.petSprite,
              { width: imageWidth, height: size, left: (size - imageWidth) / 2 },
            ]}
            resizeMode="contain"
          />
          <Image
            source={eyesClosed}
            style={[
              styles.closedEyes,
              {
                width: imageWidth,
                height: size,
                top: 0,
                left: (size - imageWidth) / 2,
                opacity: blinking ? 1 : 0,
              },
            ]}
            resizeMode="contain"
          />

          {/* Equipped Hats, Glasses, Bowties, Scarves */}
          <AccessoryOverlay equipped={activeEquipped} size={size} />
        </Animated.View>
      </Animated.View>

      {/* Feed Heart Floating Reaction */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.sparkle,
          { opacity: sparkleOpacity, transform: [{ translateY: sparkleTranslateY }] },
        ]}
      >
        <Ionicons name="heart" size={32} color="#FF7AB0" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImageFrame: {
    position: 'absolute',
    overflow: 'visible',
  },
  petSprite: {
    position: 'absolute',
    top: 0,
  },
  closedEyes: {
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
    top: '16%',
    alignSelf: 'center',
  },
});
