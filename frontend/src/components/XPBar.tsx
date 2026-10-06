import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  level: number;
  xpIntoLevel: number;
  xpToNext: number;
  large?: boolean;
};

export default function XPBar({ level, xpIntoLevel, xpToNext, large = false }: Props) {
  const pct = Math.min(1, xpIntoLevel / xpToNext);
  return (
    <View style={[styles.wrap, large && styles.largeWrap]}>
      <View style={[styles.levelBadge, large && styles.largeBadge]}>
        <Text style={[styles.levelText, large && styles.largeLevelText]}>Nv {level}</Text>
      </View>
      <View style={[styles.track, large && styles.largeTrack]}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={[styles.xpText, large && styles.largeXpText]}>
        {xpIntoLevel}/{xpToNext} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    backgroundColor: colors.accentPurple,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: colors.success,
  },
  xpText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    minWidth: 62,
    textAlign: 'right',
  },
  largeWrap: {
    gap: 12,
  },
  largeBadge: {
    borderRadius: 15,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  largeLevelText: {
    fontSize: 15,
  },
  largeTrack: {
    height: 14,
  },
  largeXpText: {
    fontSize: 14,
    minWidth: 78,
  },
});
