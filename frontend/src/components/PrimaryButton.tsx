import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  GestureResponderEvent,
  Text,
  TouchableOpacity,
} from 'react-native';
import { playSound, type SoundName } from '../audio/sounds';
import { colors, primaryButtonStyles } from '../style';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  label: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  iconName?: IconName;
  sound?: SoundName | 'none';
  size?: 'default' | 'large';
};

const ICON_COLOR = { primary: colors.white, secondary: colors.textPrimary, ghost: colors.textSecondary };

export default function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  iconName,
  sound = 'tap',
  size = 'default',
}: Props) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const pressScale = useRef(new Animated.Value(1)).current;

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

  const handlePressIn = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    if (reducedMotion) return;
    Animated.spring(pressScale, {
      toValue: 0.94,
      friction: 8,
      tension: 260,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (reducedMotion) {
      pressScale.setValue(1);
      return;
    }
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 4,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (sound !== 'none') playSound(sound);
      onPress(e);
    },
    [onPress, sound]
  );

  const iconEl = iconName ? (
    <Ionicons
      name={iconName}
      size={variant === 'ghost' ? (size === 'large' ? 18 : 15) : size === 'large' ? 21 : 18}
      color={ICON_COLOR[variant]}
      style={primaryButtonStyles.icon}
    />
  ) : null;

  if (variant === 'ghost') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
        style={disabled && primaryButtonStyles.disabled}
      >
        <Animated.View
          style={[
            primaryButtonStyles.ghost,
            size === 'large' && primaryButtonStyles.largeGhost,
            { transform: [{ scale: pressScale }] },
          ]}
        >
          {iconEl}
          <Text style={[primaryButtonStyles.ghostLabel, size === 'large' && primaryButtonStyles.largeGhostLabel]}>
            {label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.85}
        style={disabled && primaryButtonStyles.disabled}
      >
        <Animated.View
          style={[
            primaryButtonStyles.secondary,
            size === 'large' && primaryButtonStyles.largeSecondary,
            { transform: [{ scale: pressScale }] },
          ]}
        >
          {iconEl}
          <Text style={[primaryButtonStyles.secondaryLabel, size === 'large' && primaryButtonStyles.largeSecondaryLabel]}>
            {label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.85}
      style={disabled && primaryButtonStyles.disabled}
    >
      <Animated.View
        style={[
          primaryButtonStyles.primary,
          size === 'large' && primaryButtonStyles.largePrimary,
          { transform: [{ scale: pressScale }] },
        ]}
      >
        <Animated.View style={primaryButtonStyles.primaryHighlight} pointerEvents="none" />
        {iconEl}
        <Text style={[primaryButtonStyles.primaryLabel, size === 'large' && primaryButtonStyles.largeLabel]}>
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}
