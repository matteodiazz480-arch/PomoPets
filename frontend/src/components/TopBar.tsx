import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import IconBubble from './IconBubble';
import CoinIcon from './CoinIcon';
import { colors } from '../theme/colors';

type Props = {
  coins: number;
  streak: number;
  onAddCoins?: () => void;
  desktop?: boolean;
};

export default function TopBar({ coins, streak, onAddCoins, desktop = false }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        desktop && styles.desktopWrap,
        { paddingTop: insets.top + 8 },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.coinGroup}>
        <View style={styles.pill}>
          <CoinIcon size={24} />
          <Text style={styles.value} numberOfLines={1}>
            {coins}
          </Text>
        </View>
        {onAddCoins && (
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => {
              playSound('tap');
              onAddCoins();
            }}
          >
            <View style={styles.addButtonHighlight} pointerEvents="none" />
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.pill, styles.streakPill]}>
        <IconBubble icon="🔥" size={24} background={colors.card} borderColor={colors.streak} />
        <Text style={[styles.value, styles.streakValue]} numberOfLines={1}>
          {streak}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  desktopWrap: {
    maxWidth: 1160,
  },
  coinGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    maxWidth: '70%',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    backgroundColor: colors.card,
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.65,
    shadowRadius: 8,
    elevation: 2,
  },
  streakPill: {
    backgroundColor: colors.streakBg,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.coin,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.coinDark,
    borderBottomWidth: 4,
    borderBottomColor: colors.coinDeep,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '46%',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: -1,
  },
  value: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flexShrink: 1,
  },
  streakValue: {
    color: colors.streak,
  },
});
