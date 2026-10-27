import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { colors, rewardModalStyles } from '../style';
import BlurredModal from './BlurredModal';
import CoinIcon from './CoinIcon';
import ConfettiEffect from './ConfettiEffect';
import PrimaryButton from './PrimaryButton';

type Props = {
  visible: boolean;
  xp: number;
  coins: number;
  onClose: () => void;
};

export default function RewardModal({ visible, xp, coins, onClose }: Props) {
  return (
    <BlurredModal
      visible={visible}
      onClose={onClose}
      align="center"
      overlayChildren={<ConfettiEffect active={visible} />}
    >
      <View style={rewardModalStyles.card}>
        <View style={rewardModalStyles.trophyIconWrap}>
          <Ionicons name="trophy" size={38} color={colors.coin} />
        </View>
        <Text style={rewardModalStyles.title}>¡Sesión completada!</Text>
        <Text style={rewardModalStyles.subtitle}>Tu mascota está orgullosa de ti</Text>
        <View style={rewardModalStyles.rewardsRow}>
          <View style={rewardModalStyles.rewardPill}>
            <Ionicons name="sparkles" size={14} color="#F59E0B" style={{ marginRight: 5 }} />
            <Text style={rewardModalStyles.rewardText}>+{xp} XP</Text>
          </View>
          <View style={[rewardModalStyles.rewardPill, rewardModalStyles.coinPill]}>
            <CoinIcon size={18} style={rewardModalStyles.rewardIcon} />
            <Text style={rewardModalStyles.rewardText}>+{coins}</Text>
          </View>
        </View>
        <PrimaryButton label="Continuar" onPress={onClose} />
      </View>
    </BlurredModal>
  );
}
