import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import PrimaryButton from './PrimaryButton';
import CoinIcon from './CoinIcon';

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
        <View style={styles.card}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>¡Sesión completada!</Text>
          <Text style={styles.subtitle}>Tu mascota está orgullosa de ti</Text>
          <View style={styles.rewardsRow}>
            <View style={styles.rewardPill}>
              <Text style={styles.rewardIcon}>✨</Text>
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
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 18,
    fontWeight: '500',
  },
  rewardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEBFF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: colors.accentPurple,
    borderBottomWidth: 4,
  },
  coinPill: {
    backgroundColor: '#FFF3D6',
    borderColor: colors.coinDark,
  },
  rewardIcon: {
    marginRight: 6,
  },
  rewardText: {
    fontWeight: '700',
    color: colors.textPrimary,
    fontSize: 15,
  },
});
