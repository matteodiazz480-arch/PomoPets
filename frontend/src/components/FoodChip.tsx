import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated, Easing, Text, TouchableWithoutFeedback, View } from 'react-native';
import { foodChipStyles } from '../style';

type Props = {
  icon: string;
  count: number;
  onFeed: () => void;
};

export default function FoodChip({ icon, count, onFeed }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const busy = useRef(false);

  const handlePress = () => {
    if (busy.current) return;
    busy.current = true;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {}
    onFeed();
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.86, duration: 80, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1.12, friction: 4, tension: 180, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }),
    ]).start(() => {
      busy.current = false;
    });
  };

  return (
    <TouchableWithoutFeedback
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Alimentar con ${icon}. Cantidad: ${count}`}
    >
      <Animated.View style={[foodChipStyles.chip, { transform: [{ scale }] }]}>
        <Text style={foodChipStyles.icon}>{icon}</Text>
        <View style={foodChipStyles.badge}>
          <Text style={foodChipStyles.badgeText}>{count}</Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}
