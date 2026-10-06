import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { MissionDef } from '../data/missions';
import { colors } from '../theme/colors';
import PrimaryButton from './PrimaryButton';
import CoinIcon from './CoinIcon';

type Props = {
  mission: MissionDef;
  progress: number;
  claimed: boolean;
  onClaim: () => void;
  large?: boolean;
};

export default function MissionCard({ mission, progress, claimed, onClaim, large = false }: Props) {
  const clamped = Math.min(progress, mission.target);
  const ready = clamped >= mission.target && !claimed;
  const pct = Math.min(1, clamped / mission.target);

  return (
    <View style={[styles.card, large && styles.largeCard, claimed && styles.cardClaimed]}>
      <View style={[styles.iconWrap, large && styles.largeIconWrap, claimed && styles.iconWrapClaimed]}>
        <Ionicons
          name={claimed ? 'checkmark-circle' : mission.icon}
          size={large ? 27 : 22}
          color={claimed ? colors.success : colors.primaryDark}
        />
      </View>

      <View style={[styles.info, large && styles.largeInfo]}>
        <Text style={[styles.title, large && styles.largeTitle]}>{mission.title}</Text>
        <Text style={[styles.desc, large && styles.largeDesc]}>{mission.description}</Text>

        <View style={[styles.track, large && styles.largeTrack]}>
          <View style={[styles.fill, { width: `${pct * 100}%` }, claimed && styles.fillClaimed]} />
        </View>
        <Text style={[styles.progressText, large && styles.largeProgressText]}>
          {clamped}/{mission.target}
        </Text>
      </View>

      <View style={[styles.action, large && styles.largeAction]}>
        <View style={styles.rewardRow}>
          <Text style={[styles.rewardText, large && styles.largeRewardText]}>+{mission.xp} XP</Text>
          <View style={styles.rewardCoins}>
            <CoinIcon size={large ? 17 : 14} />
            <Text style={[styles.rewardCoinsText, large && styles.largeRewardText]}>{mission.coins}</Text>
          </View>
        </View>
        {claimed ? (
          <Text style={[styles.claimedLabel, large && styles.largeClaimedLabel]}>Reclamada</Text>
        ) : (
          <View style={[styles.claimButtonWrap, large && styles.largeClaimButtonWrap]}>
            <PrimaryButton
              label="Reclamar"
              variant={ready ? 'primary' : 'secondary'}
              disabled={!ready}
              sound="quest"
              onPress={onClaim}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: '#E6D5BF',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 3,
  },
  largeCard: {
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
  },
  cardClaimed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#FFEFE8',
    borderWidth: 2,
    borderColor: '#FFD4C3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  largeIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    marginRight: 16,
  },
  iconWrapClaimed: {
    backgroundColor: '#E4F8EA',
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  largeInfo: {
    marginRight: 16,
  },
  title: {
    fontWeight: '700',
    fontSize: 14,
    color: colors.textPrimary,
  },
  largeTitle: {
    fontSize: 16,
  },
  desc: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
    marginBottom: 8,
  },
  largeDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
    marginBottom: 10,
  },
  track: {
    height: 7,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  largeTrack: {
    height: 9,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  fillClaimed: {
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '700',
    marginTop: 3,
  },
  largeProgressText: {
    fontSize: 12,
    marginTop: 5,
  },
  action: {
    alignItems: 'flex-end',
    gap: 6,
  },
  largeAction: {
    gap: 10,
  },
  claimButtonWrap: {
    transform: [{ scale: 0.84 }],
    marginRight: -10,
  },
  largeClaimButtonWrap: {
    transform: [{ scale: 1 }],
    marginRight: 0,
  },
  rewardRow: {
    alignItems: 'flex-end',
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentPurple,
  },
  largeRewardText: {
    fontSize: 13,
  },
  rewardCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rewardCoinsText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.coinDark,
  },
  claimedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  largeClaimedLabel: {
    fontSize: 14,
  },
});
