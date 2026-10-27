import { Ionicons } from '@expo/vector-icons';
import React, { ComponentProps, useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import { statBarStyles } from '../style';

type Props = {
  icon?: string;
  iconName?: ComponentProps<typeof Ionicons>['name'];
  value: number;
  fillColor: string;
  label?: string;
  trackWidth?: number;
};

export default function StatBar({ icon, iconName, value, fillColor, label, trackWidth = 54 }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const anim = useRef(new Animated.Value(pct)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: pct,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, anim]);

  const fillWidth = anim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, trackWidth],
    extrapolate: 'clamp',
  });

  const renderIcon = (size: number) => {
    if (iconName) {
      return <Ionicons name={iconName} size={size} color={fillColor} />;
    }
    return <Text style={{ fontSize: size }}>{icon}</Text>;
  };

  if (label) {
    return (
      <View style={statBarStyles.labeled}>
        <View style={statBarStyles.labeledHeader}>
          <View style={statBarStyles.labeledIconWrap}>{renderIcon(15)}</View>
          <Text style={statBarStyles.label}>{label}</Text>
          <Text style={[statBarStyles.percent, { color: fillColor }]}>{pct}%</Text>
        </View>
        <View style={[statBarStyles.track, { width: trackWidth }]}>
          <Animated.View style={[statBarStyles.fill, { width: fillWidth, backgroundColor: fillColor }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={statBarStyles.compactPill}>
      <View style={statBarStyles.compactIconWrap}>{renderIcon(13)}</View>
      <View style={[statBarStyles.track, { width: trackWidth }]}>
        <Animated.View style={[statBarStyles.fill, { width: fillWidth, backgroundColor: fillColor }]} />
      </View>
      <Text style={[statBarStyles.percent, { color: fillColor }]}>{pct}%</Text>
    </View>
  );
}
