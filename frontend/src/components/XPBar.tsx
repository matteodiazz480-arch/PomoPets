import React from 'react';
import { Text, View } from 'react-native';
import { xpBarStyles } from '../style';

type Props = {
  level: number;
  xpIntoLevel: number;
  xpToNext: number;
  large?: boolean;
};

export default function XPBar({ level, xpIntoLevel, xpToNext, large = false }: Props) {
  const pct = Math.min(1, xpIntoLevel / xpToNext);
  return (
    <View style={[xpBarStyles.wrap, large && xpBarStyles.largeWrap]}>
      <View style={[xpBarStyles.levelBadge, large && xpBarStyles.largeBadge]}>
        <Text style={[xpBarStyles.levelText, large && xpBarStyles.largeLevelText]}>Nv {level}</Text>
      </View>
      <View style={[xpBarStyles.track, large && xpBarStyles.largeTrack]}>
        <View style={[xpBarStyles.fill, { width: `${pct * 100}%` }]} />
      </View>
      <Text style={[xpBarStyles.xpText, large && xpBarStyles.largeXpText]}>
        {xpIntoLevel}/{xpToNext} XP
      </Text>
    </View>
  );
}
