import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, ComponentProps } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  icon?: string;
  iconName?: ComponentProps<typeof Ionicons>['name'];
  value: number;
  fillColor: string;
  /** Optional label shown above the bar — omit for the compact icon+bar+% pill look. */
  label?: string;
  trackWidth?: number;
};

const TRACK_HEIGHT = 8;

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
      <View style={styles.labeled}>
        <View style={styles.labeledHeader}>
          <View style={styles.labeledIconWrap}>
            {renderIcon(15)}
          </View>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.percent, { color: fillColor }]}>{pct}%</Text>
        </View>
        <View style={[styles.track, { width: trackWidth }]}>
          <Animated.View style={[styles.fill, { width: fillWidth, backgroundColor: fillColor }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.compactPill}>
      <View style={styles.compactIconWrap}>{renderIcon(13)}</View>
      <View style={[styles.track, { width: trackWidth }]}>
        <Animated.View style={[styles.fill, { width: fillWidth, backgroundColor: fillColor }]} />
      </View>
      <Text style={[styles.percent, { color: fillColor }]}>{pct}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  labeled: {
    width: '100%',
  },
  labeledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  labeledIconWrap: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  label: {
    flex: 1,
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.textPrimary,
  },
  percent: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
  },
  track: {
    height: TRACK_HEIGHT,
    backgroundColor: '#EBE3D7',
    borderRadius: TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: TRACK_HEIGHT / 2,
  },
  compactPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 7,
  },
  compactIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
