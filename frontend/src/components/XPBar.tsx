import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  level: number;
  xpIntoLevel: number;
  xpToNext: number;
};

export default function XPBar({ level, xpIntoLevel, xpToNext }: Props) {
  const pct = Math.min(1, xpIntoLevel / xpToNext);
  return (
    <View style={styles.wrap}>
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>Nv {level}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={styles.xpText}>
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
});
