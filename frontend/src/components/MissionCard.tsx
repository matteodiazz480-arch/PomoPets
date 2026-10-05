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
};

export default function MissionCard({ mission, progress, claimed, onClaim }: Props) {
  const clamped = Math.min(progress, mission.target);
  const ready = clamped >= mission.target && !claimed;
  const pct = Math.min(1, clamped / mission.target);

  return (
    <View style={[styles.card, claimed && styles.cardClaimed]}>
      <View style={[styles.iconWrap, claimed && styles.iconWrapClaimed]}>
        <Ionicons
          name={claimed ? 'checkmark-circle' : mission.icon}
          size={22}
          color={claimed ? colors.success : colors.primaryDark}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{mission.title}</Text>
        <Text style={styles.desc}>{mission.description}</Text>

        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct * 100}%` }, claimed && styles.fillClaimed]} />
        </View>
        <Text style={styles.progressText}>
          {clamped}/{mission.target}
        </Text>
      </View>

      <View style={styles.action}>
        <View style={styles.rewardRow}>
          <Text style={styles.rewardText}>+{mission.xp} XP</Text>
          <View style={styles.rewardCoins}>
            <CoinIcon size={14} />
            <Text style={styles.rewardCoinsText}>{mission.coins}</Text>
          </View>
        </View>
        {claimed ? (
          <Text style={styles.claimedLabel}>Reclamada</Text>
        ) : (
          <View style={styles.claimButtonWrap}>
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
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardClaimed: {
    opacity: 0.7,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFEFE8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapClaimed: {
    backgroundColor: '#E4F8EA',
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontWeight: '800',
    fontSize: 14,
    color: colors.textPrimary,
  },
  desc: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
    marginBottom: 8,
  },
  track: {
    height: 7,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: 'hidden',
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
  action: {
    alignItems: 'flex-end',
    gap: 6,
  },
  claimButtonWrap: {
    transform: [{ scale: 0.78 }],
    marginRight: -14,
  },
  rewardRow: {
    alignItems: 'flex-end',
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.accentPurple,
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
});
