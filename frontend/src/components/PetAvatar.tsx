import { useIsFocused } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';

type Props = {
  eyesOpen: any;
  eyesClosed: any;
  size?: number;
  /** Bump this number (e.g. +1) whenever the pet is fed to trigger the reaction animation. */
  feedSignal?: number;
};

const BREATH_DURATION = 1600;
const BREATH_AMPLITUDE = 1.035;
const FIRST_BLINK_DELAY_MS = 7000;
const BLINK_INTERVAL_MIN_MS = 5000;
const BLINK_INTERVAL_VARIANCE_MS = 3000;
const BLINK_DURATION_MS = 120;

// All animations below only ever touch transform/opacity so they can run fully on
// the native thread (useNativeDriver: true) — no JS-thread work per frame, no
// layout thrashing, cheap enough to run continuously without jank.
//
// The pet stays put — no idle sway/rotation/hop. Only two things move it: the
// breathing scale pulse (always on) and the feed reaction bump (triggered).
export default function PetAvatar({ eyesOpen, eyesClosed, size = 260, feedSignal = 0 }: Props) {
  const [blinking, setBlinking] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const imageSize = size * 0.88;
  const breath = useRef(new Animated.Value(0)).current;
  const feedBump = useRef(new Animated.Value(0)).current;
  const sparkle = useRef(new Animated.Value(0)).current;
  const isFirstFeedSignal = useRef(true);
  // React Navigation keeps every tab you've visited mounted (frozen, not
  // unmounted) — without this, a pet on a tab you're not even looking at
  // would keep breathing/blinking forever in the background.
  const isFocused = useIsFocused();

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

  // Gentle scale-only breathing loop.
  useEffect(() => {
    if (!isFocused || reducedMotion) {
      breath.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, {
          toValue: 1,
          duration: BREATH_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breath, {
          toValue: 0,
          duration: BREATH_DURATION,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [breath, isFocused, reducedMotion]);

  // Happy little bounce + a floating heart whenever the pet gets fed.
  useEffect(() => {
    if (isFirstFeedSignal.current) {
      isFirstFeedSignal.current = false;
      return;
    }
    if (reducedMotion) {
      feedBump.setValue(0);
      sparkle.setValue(0);
      return;
    }
    feedBump.setValue(0);
    sparkle.setValue(0);
    Animated.sequence([
      Animated.timing(feedBump, { toValue: 1, duration: 150, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(feedBump, { toValue: 0, friction: 3.2, tension: 90, useNativeDriver: true }),
    ]).start();
    Animated.timing(sparkle, {
      toValue: 1,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedSignal, reducedMotion]);

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

  const breathScale = breath.interpolate({ inputRange: [0, 1], outputRange: [1, BREATH_AMPLITUDE] });
  const bumpScale = feedBump.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const sparkleTranslateY = sparkle.interpolate({ inputRange: [0, 1], outputRange: [0, -48] });
  const sparkleOpacity = sparkle.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View style={{ transform: [{ scale: Animated.multiply(breathScale, bumpScale) }] }}>
        <Image source={eyesOpen} style={{ width: imageSize, height: imageSize }} resizeMode="contain" />
        <Image
          source={eyesClosed}
          style={[
            styles.closedEyes,
            {
              width: imageSize,
              height: imageSize,
              top: 0,
              left: 0,
              opacity: blinking ? 1 : 0,
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.sparkle,
          { opacity: sparkleOpacity, transform: [{ translateY: sparkleTranslateY }] },
        ]}
      >
        <Text style={styles.sparkleText}>💛</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedEyes: {
    position: 'absolute',
  },
  sparkle: {
    position: 'absolute',
    top: '16%',
    alignSelf: 'center',
  },
  sparkleText: {
    fontSize: 26,
  },
});
