import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import PrimaryButton from './PrimaryButton';
import CoinIcon from './CoinIcon';
import ConfettiEffect from './ConfettiEffect';

type Props = {
  visible: boolean;
  xp: number;
  coins: number;
  onClose: () => void;
};

export default function RewardModal({ visible, xp, coins, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {/* Optimized lag-free Confetti explosion on timer completion */}
        <ConfettiEffect active={visible} />

        <View style={styles.card}>
          <View style={styles.trophyIconWrap}>
            <Ionicons name="trophy" size={42} color={colors.coin} />
          </View>
          <Text style={styles.title}>¡Sesión completada!</Text>
          <Text style={styles.subtitle}>Tu mascota está orgullosa de ti</Text>
          <View style={styles.rewardsRow}>
            <View style={styles.rewardPill}>
              <Ionicons name="sparkles" size={14} color="#F59E0B" style={{ marginRight: 5 }} />
              <Text style={styles.rewardText}>+{xp} XP</Text>
            </View>
            <View style={[styles.rewardPill, styles.coinPill]}>
              <CoinIcon size={18} style={styles.rewardIcon} />
              <Text style={styles.rewardText}>+{coins}</Text>
            </View>
          </View>
          <PrimaryButton label="Continuar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: 30,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderBottomWidth: 6,
    borderBottomColor: colors.primaryDeep,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 8,
  },
  trophyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  coinPill: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  rewardIcon: {
    marginRight: 6,
  },
  rewardText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.textPrimary,
  },
});
