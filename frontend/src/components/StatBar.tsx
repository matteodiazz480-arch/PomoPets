import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  icon: string;
  value: number;
  fillColor: string;
  /** Optional label shown above the bar — omit for the compact icon+bar+% pill look. */
  label?: string;
  /** Fixed pixel width for the track. Percent-of-flex widths only resolve against a
   *  parent with a *definite* size, so a hard-coded number sidesteps that ambiguity
   *  entirely — the fill can never silently collapse. */
  trackWidth?: number;
};

const TRACK_HEIGHT = 8;

export default function StatBar({ icon, value, fillColor, label, trackWidth = 54 }: Props) {
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

  if (label) {
    return (
      <View style={styles.labeled}>
        <View style={styles.labeledHeader}>
          <View style={styles.labeledIconWrap}>
            <Text style={styles.labeledIcon}>{icon}</Text>
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
    <View style={styles.pill}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={[styles.track, { width: trackWidth }]}>
        <Animated.View style={[styles.fill, { width: fillWidth, backgroundColor: fillColor }]} />
      </View>
      <Text style={styles.percent}>{pct}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  icon: {
    fontSize: 13,
    marginRight: 6,
  },
  labeled: {
    width: '100%',
  },
  labeledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labeledIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  labeledIcon: {
    fontSize: 14,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  track: {
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: TRACK_HEIGHT / 2,
  },
  percent: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
    marginLeft: 6,
    minWidth: 30,
  },
});
