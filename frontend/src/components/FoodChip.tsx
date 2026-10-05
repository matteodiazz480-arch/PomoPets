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
    onFeed();
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.86, duration: 90, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
    ]).start(() => {
      busy.current = false;
    });
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
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
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  icon: {
    fontSize: 19,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.white,
  },
});
