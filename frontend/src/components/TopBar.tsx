import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import { colors } from '../theme/colors';

type Props = {
  playerName: string;
  photoUrl: string | null;
  level: number;
  onOpenProfile: () => void;
  desktop?: boolean;
};

export default function TopBar({
  playerName,
  photoUrl,
  level,
  onOpenProfile,
  desktop = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
      document.addEventListener('fullscreenchange', onFsChange);
      return () => document.removeEventListener('fullscreenchange', onFsChange);
    }
  }, []);

  const toggleFullscreen = () => {
    playSound('tap');
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } catch {}
    }
  };

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
      {/* Profile Button - allows uploading and managing profile photo & name */}
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
            {playerName || 'Mi Perfil'}
          </Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Nv. {level}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.rightGroup}>
        {Platform.OS === 'web' && (
          <TouchableOpacity
            style={[styles.fsButton, desktop && styles.desktopFsButton]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            onPress={toggleFullscreen}
          >
            <Ionicons
              name={isFullscreen ? 'contract-outline' : 'expand-outline'}
              size={desktop ? 20 : 16}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        )}
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
    gap: 10,
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 15,
    height: 15,
    borderRadius: 8,
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
    fontSize: 14,
    color: colors.textPrimary,
    maxWidth: 130,
  },
  desktopPlayerName: {
    fontSize: 15,
    maxWidth: 200,
  },
  levelBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
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
  fsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  desktopFsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});
