import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { confettiEffectStyles } from '../style';

interface Props {
  active: boolean;
  onFinish?: () => void;
  count?: number;
}

const CONFETTI_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#FF9F7A',
  '#A78BFA',
  '#34D399',
  '#38BDF8',
  '#F472B6',
];

interface Particle {
  id: number;
  startX: number;
  color: string;
  size: { w: number; h: number };
  isRound: boolean;
  swayDistance: number;
  rotationSpeed: string;
  fallDelay: number;
}

export default function ConfettiEffect({ active, onFinish, count = 36 }: Props) {
  const { width, height } = useWindowDimensions();
  const [particles, setParticles] = useState<Particle[]>([]);
  const animProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) {
      setParticles([]);
      animProgress.setValue(0);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: count }).map((_, i) => ({
      id: i,
      startX: Math.random() * width,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: {
        w: Math.floor(Math.random() * 4) + 7,
        h: Math.floor(Math.random() * 6) + 8,
      },
      isRound: Math.random() > 0.65,
      swayDistance: (Math.random() - 0.5) * 80,
      rotationSpeed: `${(Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360)}deg`,
      fallDelay: Math.random() * 200,
    }));

    setParticles(newParticles);
    animProgress.setValue(0);

    Animated.timing(animProgress, {
      toValue: 1,
      duration: 2500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onFinish?.();
      }
    });
  }, [active, count, width, height]);

  if (!active || particles.length === 0) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {particles.map((p) => {
        const translateY = animProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [-30, height + 40],
        });

        const translateX = animProgress.interpolate({
          inputRange: [0, 0.4, 0.8, 1],
          outputRange: [
            p.startX,
            p.startX + p.swayDistance,
            p.startX - p.swayDistance * 0.5,
            p.startX + p.swayDistance * 0.8,
          ],
        });

        const rotate = animProgress.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', p.rotationSpeed],
        });

        const opacity = animProgress.interpolate({
          inputRange: [0, 0.1, 0.8, 1],
          outputRange: [0, 1, 0.9, 0],
        });

        return (
          <Animated.View
            key={p.id}
            style={[
              confettiEffectStyles.particle,
              {
                width: p.size.w,
                height: p.size.h,
                backgroundColor: p.color,
                borderRadius: p.isRound ? p.size.w / 2 : 2,
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}
