import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { playSound } from '../audio/sounds';
import { useGame } from '../context/GameContext';
import { coinStoreModalStyles, colors } from '../style';
import BlurredModal from './BlurredModal';
import CoinIcon from './CoinIcon';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function CoinStoreModal({ visible, onClose }: Props) {
  const { state, rewardCoins } = useGame();
  const [claimedDailyBonus, setClaimedDailyBonus] = useState(false);

  const handleClaimDaily = () => {
    if (claimedDailyBonus) return;
    setClaimedDailyBonus(true);
    rewardCoins(100);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    playSound('success');
  };

  return (
    <BlurredModal visible={visible} onClose={onClose} align="center">
      <View style={coinStoreModalStyles.sheet}>
        <TouchableOpacity
          style={coinStoreModalStyles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.85}
          onPress={onClose}
        >
          <View style={coinStoreModalStyles.closeButtonInner}>
            <Ionicons name="close" size={17} color={colors.textPrimary} />
          </View>
        </TouchableOpacity>

        <Text style={coinStoreModalStyles.title}>Monedas y Recompensas</Text>
        <View style={coinStoreModalStyles.balanceHeader}>
          <Text style={coinStoreModalStyles.balanceLabel}>Tu Saldo Actual:</Text>
          <View style={coinStoreModalStyles.balancePill}>
            <CoinIcon size={18} />
            <Text style={coinStoreModalStyles.balanceValue}>{state.coins}</Text>
          </View>
        </View>

        <View style={coinStoreModalStyles.list}>
          <View style={[coinStoreModalStyles.rewardCard, coinStoreModalStyles.rewardCardDisabled]}>
            <View style={coinStoreModalStyles.cardHeaderRow}>
              <View style={[coinStoreModalStyles.cardIconBox, { backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="videocam-outline" size={20} color="#94A3B8" />
              </View>
              <View style={coinStoreModalStyles.cardInfo}>
                <Text style={coinStoreModalStyles.cardTitle}>Ver Video Recompensado</Text>
                <Text style={coinStoreModalStyles.cardDesc}>
                  No disponible temporalmente mientras se valida la integración de anuncios.
                </Text>
              </View>
            </View>
            <View style={[coinStoreModalStyles.claimButton, coinStoreModalStyles.claimButtonDisabled]}>
              <Ionicons name="lock-closed" size={14} color="#64748B" />
              <Text style={[coinStoreModalStyles.claimButtonText, coinStoreModalStyles.claimButtonTextDisabled]}>
                Próximamente
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[coinStoreModalStyles.rewardCard, claimedDailyBonus && coinStoreModalStyles.rewardCardDisabled]}
            activeOpacity={0.88}
            onPress={handleClaimDaily}
          >
            <View style={coinStoreModalStyles.cardHeaderRow}>
              <View style={[coinStoreModalStyles.cardIconBox, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="gift-outline" size={20} color="#7C3AED" />
              </View>
              <View style={coinStoreModalStyles.cardInfo}>
                <Text style={coinStoreModalStyles.cardTitle}>Regalo Diario de Bienvenida</Text>
                <Text style={coinStoreModalStyles.cardDesc}>
                  {claimedDailyBonus ? '¡Reclamado por hoy! Vuelve mañana.' : 'Bono diario gratuito para mimar a Cornolín.'}
                </Text>
              </View>
            </View>
            <View style={[coinStoreModalStyles.claimButton, claimedDailyBonus && coinStoreModalStyles.claimButtonDisabled]}>
              <CoinIcon size={16} />
              <Text style={[coinStoreModalStyles.claimButtonText, claimedDailyBonus && coinStoreModalStyles.claimButtonTextDisabled]}>
                {claimedDailyBonus ? '✓ Ya Reclamado' : '+100 Monedas Gratis'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={coinStoreModalStyles.infoBanner}>
            <Ionicons name="timer-outline" size={20} color="#0284C7" />
            <View style={coinStoreModalStyles.infoBannerTextWrap}>
              <Text style={coinStoreModalStyles.infoBannerTitle}>¡La mejor forma es estudiar!</Text>
              <Text style={coinStoreModalStyles.infoBannerDesc}>
                Cada sesión completada en el temporizador Pomodoro te otorga monedas y experiencia.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </BlurredModal>
  );
}
