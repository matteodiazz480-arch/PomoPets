import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import { GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { playSound, type SoundName } from '../audio/sounds';
import { colors } from '../theme/colors';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  iconName?: IconName;
  sound?: SoundName | 'none';
};

const ICON_COLOR = { primary: colors.white, secondary: colors.textPrimary, ghost: colors.textSecondary };

export default function PrimaryButton({ label, onPress, variant = 'primary', disabled, iconName, sound = 'tap' }: Props) {
  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (sound !== 'none') playSound(sound);
      onPress(e);
    },
    [onPress, sound]
  );

  const iconEl = iconName ? (
    <Ionicons name={iconName} size={variant === 'ghost' ? 15 : 18} color={ICON_COLOR[variant]} style={styles.icon} />
  ) : null;

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={[styles.ghost, disabled && styles.disabled]}
        activeOpacity={0.7}
      >
        {iconEl}
        <Text style={styles.ghostLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={[styles.secondary, disabled && styles.disabled]}
        activeOpacity={0.8}
      >
        {iconEl}
        <Text style={styles.secondaryLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }

  // Solid "sticker" button: flat fill, a bold ink-style outline, and a chunky
  // darker bottom edge that reads as a pressed-in 3D bevel — a hand-illustrated,
  // toy-like feel instead of a glossy gradient.
  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled} activeOpacity={0.8} style={disabled && styles.disabled}>
      <View style={styles.primary}>
        <View style={styles.primaryHighlight} pointerEvents="none" />
        {iconEl}
        <Text style={styles.primaryLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginRight: 8,
  },
  primary: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2.5,
    borderColor: colors.primaryDark,
    borderBottomWidth: 6,
    borderBottomColor: colors.primaryDeep,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderTopLeftRadius: 21,
    borderTopRightRadius: 21,
  },
  primaryLabel: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
  },
  secondary: {
    flexDirection: 'row',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  secondaryLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  ghost: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.45,
  },
});
