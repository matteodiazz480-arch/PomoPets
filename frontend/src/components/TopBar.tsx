import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import { topBarStyles } from '../style';
import CoinIcon from './CoinIcon';

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
        topBarStyles.wrap,
        desktop && topBarStyles.desktopWrap,
        { paddingTop: insets.top + 8 },
      ]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={[topBarStyles.profilePill, desktop && topBarStyles.desktopProfilePill]}
        activeOpacity={0.88}
        onPress={handleProfilePress}
        accessibilityRole="button"
        accessibilityLabel="Abrir perfil de jugador"
      >
        <View style={topBarStyles.avatarWrap}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={topBarStyles.avatarImg} />
          ) : (
            <View style={topBarStyles.avatarPlaceholder}>
              <Ionicons name="person" size={desktop ? 20 : 16} color="#64748B" />
            </View>
          )}
          <View style={topBarStyles.cameraDot}>
            <Ionicons name="camera" size={9} color="#FFFFFF" />
          </View>
        </View>

        <View style={topBarStyles.profileTextWrap}>
          <Text style={[topBarStyles.playerName, desktop && topBarStyles.desktopPlayerName]} numberOfLines={1}>
            {playerName || 'Tu Nombre ✏️'}
          </Text>
          <View style={topBarStyles.levelBadge}>
            <Text style={topBarStyles.levelBadgeText}>Nv. {level}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={topBarStyles.rightGroup}>
        <TouchableOpacity
          style={[topBarStyles.pill, topBarStyles.coinPill, desktop && topBarStyles.desktopPill]}
          activeOpacity={onOpenCoins ? 0.85 : 1}
          onPress={() => {
            if (onOpenCoins) {
              playSound('tap');
              onOpenCoins();
            }
          }}
        >
          <CoinIcon size={desktop ? 24 : 19} />
          <Text style={[topBarStyles.coinValue, desktop && topBarStyles.desktopCoinValue]} numberOfLines={1}>
            {coins}
          </Text>
        </TouchableOpacity>

        <View style={[topBarStyles.pill, topBarStyles.streakPill, desktop && topBarStyles.desktopPill]}>
          <Text style={topBarStyles.streakEmoji}>🔥</Text>
          <Text style={[topBarStyles.streakValue, desktop && topBarStyles.desktopStreakValue]} numberOfLines={1}>
            {streak}
          </Text>
        </View>
      </View>
    </View>
  );
}
