import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { colors } from '../theme/colors';

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
      <Animated.View style={[styles.chip, { transform: [{ scale }] }]}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: '#E6D5BF',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 2,
  },
  icon: {
    fontSize: 26,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 9,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  badgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: '#ffffff',
  },
});
