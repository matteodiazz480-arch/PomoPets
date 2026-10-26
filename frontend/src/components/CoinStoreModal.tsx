import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { loadRewardedAd, showRewardedAd } from '../ads/admob';
import { playSound } from '../audio/sounds';
import { useGame } from '../context/GameContext';
import { colors } from '../theme/colors';
import CoinIcon from './CoinIcon';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function CoinStoreModal({ visible, onClose }: Props) {
  const { state, rewardCoins } = useGame();
  const [watchingAd, setWatchingAd] = useState(false);
  const [adSecondsLeft, setAdSecondsLeft] = useState(5);
  const [adFinished, setAdFinished] = useState(false);
  const [claimedDailyBonus, setClaimedDailyBonus] = useState(false);
  const [, setAdReady] = useState(false);

  const adProgressAnim = useRef(new Animated.Value(0)).current;
  const rewardScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    const unsubscribe = loadRewardedAd(setAdReady);
    return unsubscribe;
  }, [visible]);

  // Handle fallback rewarded video countdown (used in Web preview / Expo Go)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (watchingAd && adSecondsLeft > 0) {
      timer = setInterval(() => {
        setAdSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            completeReward();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [watchingAd, adSecondsLeft]);

  const startWatchingAd = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    playSound('tap');

    // Intenta mostrar el anuncio nativo de Google AdMob (ID: ca-app-pub-7765029109255049/2910421056)
    const shownNative = await showRewardedAd(() => {
      completeReward();
      setWatchingAd(true);
    });

    if (shownNative) {
      return;
    }

    // Fallback para vista previa Web / entorno de desarrollo sin binario nativo
    setWatchingAd(true);
    setAdSecondsLeft(5);
    setAdFinished(false);

    adProgressAnim.setValue(0);
    Animated.timing(adProgressAnim, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  };

  const completeReward = () => {
    setAdFinished(true);
    rewardCoins(50);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    playSound('success');

    rewardScaleAnim.setValue(0);
    Animated.spring(rewardScaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const handleClaimDaily = () => {
    if (claimedDailyBonus) return;
    setClaimedDailyBonus(true);
    rewardCoins(100);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    playSound('success');
  };

  const resetAdState = () => {
    setWatchingAd(false);
    setAdFinished(false);
    setAdSecondsLeft(5);
  };

  const handleClose = () => {
    resetAdState();
    onClose();
  };

  const adProgressWidth = adProgressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdropTouch} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <TouchableOpacity
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.85}
            onPress={handleClose}
          >
            <View style={styles.closeButtonInner}>
              <Ionicons name="close" size={18} color={colors.textPrimary} />
            </View>
          </TouchableOpacity>

          {watchingAd ? (
            <View style={styles.adPlayerContainer}>
              {!adFinished ? (
                <>
                  <View style={styles.videoMockScreen}>
                    <Ionicons name="sparkles" size={40} color="#60A5FA" style={{ marginBottom: 8 }} />
                    <Text style={styles.videoTitle}>PomoPets Focus</Text>
                    <View style={styles.countdownPill}>
                      <Ionicons name="time-outline" size={14} color="#FFFFFF" />
                      <Text style={styles.countdownText}>Recompensa en {adSecondsLeft}s</Text>
                    </View>
                  </View>

                  <View style={styles.adProgressBarTrack}>
                    <Animated.View style={[styles.adProgressBarFill, { width: adProgressWidth }]} />
                  </View>

                  <Text style={styles.adFooterNote}>
                    Los videos son siempre opcionales y nunca interrumpirán tu estudio.
                  </Text>
                </>
              ) : (
                <Animated.View style={[styles.rewardClaimedCard, { transform: [{ scale: rewardScaleAnim }] }]}>
                  <Ionicons name="trophy" size={52} color={colors.coin} style={{ marginBottom: 8 }} />
                  <Text style={styles.rewardClaimedTitle}>¡Recompensa Obtenida!</Text>
                  <View style={styles.rewardPill}>
                    <CoinIcon size={24} />
                    <Text style={styles.rewardPillText}>+50 Monedas</Text>
                  </View>
                  <Text style={styles.rewardClaimedDesc}>
                    Se han acreditado 50 monedas a tu alcancía. ¡Ya puedes usarlas en la tienda!
                  </Text>
                  <TouchableOpacity
                    style={styles.actionBtnPrimary}
                    activeOpacity={0.85}
                    onPress={resetAdState}
                  >
                    <Text style={styles.actionBtnText}>Aceptar</Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          ) : (
            <>
              <Text style={styles.title}>Monedas y Recompensas</Text>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Tu Saldo Actual:</Text>
                <View style={styles.balancePill}>
                  <CoinIcon size={20} />
                  <Text style={styles.balanceValue}>{state.coins}</Text>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
                {/* 1. Rewarded Ad Option */}
                <TouchableOpacity
                  style={[styles.rewardCard, styles.rewardCardHighlight]}
                  activeOpacity={0.88}
                  onPress={startWatchingAd}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardIconBox}>
                      <Ionicons name="videocam-outline" size={24} color="#D97706" />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>Ver Video Recompensado</Text>
                      <Text style={styles.cardDesc}>
                        Mira un anuncio de vídeo bonificado y recibe monedas al instante.
                      </Text>
                    </View>
                  </View>
                  <View style={styles.claimButton}>
                    <CoinIcon size={18} />
                    <Text style={styles.claimButtonText}>+50 Monedas Gratis</Text>
                  </View>
                </TouchableOpacity>

                {/* 2. Daily Gift */}
                <TouchableOpacity
                  style={[styles.rewardCard, claimedDailyBonus && styles.rewardCardDisabled]}
                  activeOpacity={0.88}
                  onPress={handleClaimDaily}
                >
                  <View style={styles.cardHeaderRow}>
                    <View style={[styles.cardIconBox, { backgroundColor: '#EDE9FE' }]}>
                      <Ionicons name="gift-outline" size={24} color="#7C3AED" />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardTitle}>Regalo Diario de Bienvenida</Text>
                      <Text style={styles.cardDesc}>
                        {claimedDailyBonus ? '¡Reclamado por hoy! Vuelve mañana.' : 'Bono diario gratuito para mimar a Cornolín.'}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.claimButton, claimedDailyBonus && styles.claimButtonDisabled]}>
                    <CoinIcon size={18} />
                    <Text style={[styles.claimButtonText, claimedDailyBonus && styles.claimButtonTextDisabled]}>
                      {claimedDailyBonus ? '✓ Ya Reclamado' : '+100 Monedas Gratis'}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 3. Focus / Pomodoro explanation */}
                <View style={styles.infoBanner}>
                  <Ionicons name="timer-outline" size={24} color="#0284C7" />
                  <View style={styles.infoBannerTextWrap}>
                    <Text style={styles.infoBannerTitle}>¡La mejor forma es estudiar!</Text>
                    <Text style={styles.infoBannerDesc}>
                      Cada sesión completada en el temporizador Pomodoro te otorga monedas y experiencia automáticamente.
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: colors.appBg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 28,
    maxHeight: '86%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 18,
    zIndex: 20,
  },
  closeButtonInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    marginBottom: 16,
  },
  balanceLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 5,
  },
  balanceValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  list: {
    gap: 12,
    paddingBottom: 8,
  },
  rewardCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 2,
  },
  rewardCardHighlight: {
    borderColor: colors.coin,
    backgroundColor: '#FFFDF5',
  },
  rewardCardDisabled: {
    opacity: 0.6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.textPrimary,
  },
  cardDesc: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 10,
    gap: 8,
  },
  claimButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  claimButtonText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  claimButtonTextDisabled: {
    color: '#64748B',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    gap: 10,
    alignItems: 'center',
  },
  infoBannerTextWrap: {
    flex: 1,
  },
  infoBannerTitle: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#0369A1',
  },
  infoBannerDesc: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: '#0284C7',
    lineHeight: 15,
    marginTop: 2,
  },
  adPlayerContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  adBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 14,
  },
  adBadgeText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: '#4F46E5',
  },
  videoMockScreen: {
    width: '100%',
    aspectRatio: 1.6,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
    position: 'relative',
  },
  videoTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  videoSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },
  countdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginTop: 12,
  },
  countdownText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  adProgressBarTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  adProgressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  adFooterNote: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rewardClaimedCard: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rewardClaimedTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: colors.textPrimary,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  rewardPillText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: '#92400E',
  },
  rewardClaimedDesc: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 16,
  },
  actionBtnText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
