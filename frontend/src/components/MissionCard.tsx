import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import type { MissionDef } from '../data/missions';
import { colors, missionCardStyles } from '../style';
import CoinIcon from './CoinIcon';
import PrimaryButton from './PrimaryButton';

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
    <View style={[missionCardStyles.card, large && missionCardStyles.largeCard, claimed && missionCardStyles.cardClaimed]}>
      <View style={[missionCardStyles.iconWrap, large && missionCardStyles.largeIconWrap, claimed && missionCardStyles.iconWrapClaimed]}>
        <Ionicons
          name={claimed ? 'checkmark-circle' : mission.icon}
          size={large ? 27 : 22}
          color={claimed ? colors.success : colors.primaryDark}
        />
      </View>

      <View style={[missionCardStyles.info, large && missionCardStyles.largeInfo]}>
        <Text style={[missionCardStyles.title, large && missionCardStyles.largeTitle]}>{mission.title}</Text>
        <Text style={[missionCardStyles.desc, large && missionCardStyles.largeDesc]}>{mission.description}</Text>

        <View style={[missionCardStyles.track, large && missionCardStyles.largeTrack]}>
          <View style={[missionCardStyles.fill, { width: `${pct * 100}%` }, claimed && missionCardStyles.fillClaimed]} />
        </View>
        <Text style={[missionCardStyles.progressText, large && missionCardStyles.largeProgressText]}>
          {clamped}/{mission.target}
        </Text>
      </View>

      <View style={[missionCardStyles.action, large && missionCardStyles.largeAction]}>
        <View style={missionCardStyles.rewardRow}>
          <Text style={[missionCardStyles.rewardText, large && missionCardStyles.largeRewardText]}>+{mission.xp} XP</Text>
          <View style={missionCardStyles.rewardCoins}>
            <CoinIcon size={large ? 17 : 14} />
            <Text style={[missionCardStyles.rewardCoinsText, large && missionCardStyles.largeRewardText]}>{mission.coins}</Text>
          </View>
        </View>
        {claimed ? (
          <Text style={[missionCardStyles.claimedLabel, large && missionCardStyles.largeClaimedLabel]}>Reclamada</Text>
        ) : (
          <View style={[missionCardStyles.claimButtonWrap, large && missionCardStyles.largeClaimButtonWrap]}>
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
