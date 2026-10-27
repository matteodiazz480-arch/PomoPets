import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import CoinIcon from './CoinIcon';
import { colors } from '../theme/colors';

type Props = {
  coins: number;
  streak: number;
  playerName: string;
  photoUrl: string | null;
  level: number;
  onOpenProfile: () => void;
  onOpenCoins?: () => void;
  desktop?: boolean;
};

export default function TopBar({
  coins,
  streak,
  playerName,
  photoUrl,
  level,
  onOpenProfile,
  onOpenCoins,
  desktop = false,
}: Props) {
  const insets = useSafeAreaInsets();

  const handleProfilePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    playSound('tap');
    onOpenProfile();
  };

  return (
    <View
      style={[
        styles.wrap,
        desktop && styles.desktopWrap,
        { paddingTop: insets.top + 8 },
      ]}
      pointerEvents="box-none"
    >
      {/* 1. Profile Avatar & Name (Tap to upload photo and edit name) */}
      <TouchableOpacity
        style={[styles.profilePill, desktop && styles.desktopProfilePill]}
        activeOpacity={0.88}
        onPress={handleProfilePress}
        accessibilityRole="button"
        accessibilityLabel="Abrir perfil de jugador"
      >
        <View style={styles.avatarWrap}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={desktop ? 20 : 16} color="#64748B" />
            </View>
          )}
          <View style={styles.cameraDot}>
            <Ionicons name="camera" size={9} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.profileTextWrap}>
          <Text style={[styles.playerName, desktop && styles.desktopPlayerName]} numberOfLines={1}>
            {playerName || 'Tu Nombre ✏️'}
          </Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Nv. {level}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* 2. Coins & Streak Counters */}
      <View style={styles.rightGroup}>
        {/* Coins counter */}
        <TouchableOpacity
          style={[styles.pill, styles.coinPill, desktop && styles.desktopPill]}
          activeOpacity={onOpenCoins ? 0.85 : 1}
          onPress={() => {
            if (onOpenCoins) {
              playSound('tap');
              onOpenCoins();
            }
          }}
        >
          <CoinIcon size={desktop ? 24 : 19} />
          <Text style={[styles.coinValue, desktop && styles.desktopCoinValue]} numberOfLines={1}>
            {coins}
          </Text>
        </TouchableOpacity>

        {/* Streak counter */}
        <View style={[styles.pill, styles.streakPill, desktop && styles.desktopPill]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={[styles.streakValue, desktop && styles.desktopStreakValue]} numberOfLines={1}>
            {streak}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  desktopWrap: {
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 3,
  },
  desktopProfilePill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 28,
  },
  avatarWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    position: 'relative',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileTextWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.textPrimary,
    maxWidth: 110,
  },
  desktopPlayerName: {
    fontSize: 15,
    maxWidth: 180,
  },
  levelBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: '#92400E',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  desktopPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
  },
  coinPill: {
    backgroundColor: '#FFFDF5',
    borderColor: '#FDE68A',
  },
  coinValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  desktopCoinValue: {
    fontSize: 16,
  },
  streakPill: {
    backgroundColor: colors.streakBg,
    borderColor: colors.border,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.textPrimary,
  },
  desktopStreakValue: {
    fontSize: 15,
  },
});
