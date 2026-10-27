import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import MissionCard from '../components/MissionCard';
import { useGame } from '../context/GameContext';
import { getDailyMissions } from '../data/missions';
import { EVOLUTION_STAGES, getStageForLevel } from '../data/pets';
import { colors, progressScreenStyles } from '../style';

export default function ProgressScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const width = useWindowDimensions().width;
  const desktop = width >= 900;
  const wide = width >= 1200;
  const { level, xpIntoLevel, xpToNext, state, claimMission } = useGame();
  const currentStage = getStageForLevel(level);
  const todaysMissions = getDailyMissions(
    state.missionsDate ?? `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
  );

  return (
    <View style={progressScreenStyles.root}>
      <ScrollView
        contentContainerStyle={[
          progressScreenStyles.scroll,
          desktop && progressScreenStyles.desktopScroll,
          { paddingTop: insets.top + 20, paddingBottom: desktop ? 40 : insets.bottom + 110 },
        ]}
      >
        <Text style={[progressScreenStyles.title, desktop && progressScreenStyles.desktopTitle]}>Progreso</Text>
        <Text style={[progressScreenStyles.subtitle, desktop && progressScreenStyles.desktopSubtitle]}>
          Tu camino de evolución
        </Text>

        <View style={[progressScreenStyles.statsRow, desktop && progressScreenStyles.desktopStatsRow]}>
          <View style={[progressScreenStyles.statCard, desktop && progressScreenStyles.desktopStatCard]}>
            <View style={[progressScreenStyles.badgeContainer, progressScreenStyles.levelBadge, desktop && progressScreenStyles.desktopBadgeContainer]}>
              <Text style={[progressScreenStyles.statValue, desktop && progressScreenStyles.desktopStatValue]}>{level}</Text>
            </View>
            <Text style={[progressScreenStyles.statLabel, desktop && progressScreenStyles.desktopStatLabel]}>Nivel</Text>
          </View>
          <View style={[progressScreenStyles.statCard, desktop && progressScreenStyles.desktopStatCard]}>
            <View style={[progressScreenStyles.badgeContainer, progressScreenStyles.streakBadge, desktop && progressScreenStyles.desktopBadgeContainer]}>
              <Text style={[progressScreenStyles.statValue, desktop && progressScreenStyles.desktopStatValue]}>{state.streak}</Text>
            </View>
            <Text style={[progressScreenStyles.statLabel, desktop && progressScreenStyles.desktopStatLabel]}>Racha 🔥</Text>
          </View>
          <View style={[progressScreenStyles.statCard, desktop && progressScreenStyles.desktopStatCard]}>
            <View style={[progressScreenStyles.badgeContainer, progressScreenStyles.minutesBadge, desktop && progressScreenStyles.desktopBadgeContainer]}>
              <Text style={[progressScreenStyles.statValue, desktop && progressScreenStyles.desktopStatValue]}>
                {state.minutesStudiedTotal}
              </Text>
            </View>
            <Text style={[progressScreenStyles.statLabel, desktop && progressScreenStyles.desktopStatLabel]}>Minutos</Text>
          </View>
        </View>

        <View style={[progressScreenStyles.xpCard, desktop && progressScreenStyles.desktopXpCard]}>
          <Text style={[progressScreenStyles.xpCardTitle, desktop && progressScreenStyles.desktopXpCardTitle]}>
            {xpIntoLevel} / {xpToNext} XP para el siguiente nivel
          </Text>
          <View style={progressScreenStyles.xpTrack}>
            <View style={[progressScreenStyles.xpFill, { width: `${Math.min(1, xpIntoLevel / xpToNext) * 100}%` }]} />
          </View>
        </View>

        <TouchableOpacity
          style={progressScreenStyles.tournamentBanner}
          activeOpacity={0.88}
          onPress={() => {
            playSound('tap');
            navigation?.navigate('Torneo');
          }}
        >
          <View style={progressScreenStyles.tournamentBannerIcon}>
            <Ionicons name="trophy" size={24} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={progressScreenStyles.tournamentBannerTitle}>Torneo Global de Estudio</Text>
            <Text style={progressScreenStyles.tournamentBannerSub}>
              Compara tus horas de foco y sube al podio semanal.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={[progressScreenStyles.desktopSections, wide && progressScreenStyles.desktopSectionsWide]}>
          <View style={progressScreenStyles.progressSection}>
            <Text style={[progressScreenStyles.sectionTitle, desktop && progressScreenStyles.desktopSectionTitle]}>
              ⭐ Misiones diarias
            </Text>
            {todaysMissions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                progress={mission.getProgress(state)}
                claimed={state.claimedMissions.includes(mission.id)}
                onClaim={() => claimMission(mission.id)}
                large={desktop}
              />
            ))}
          </View>

          <View style={progressScreenStyles.progressSection}>
            <Text
              style={[
                progressScreenStyles.sectionTitle,
                progressScreenStyles.sectionTitleSpaced,
                desktop && progressScreenStyles.desktopSectionTitle,
              ]}
            >
              ✨ Etapas de evolución
            </Text>
            {EVOLUTION_STAGES.map((stage) => {
              const unlocked = level >= stage.minLevel;
              const isCurrent = stage.id === currentStage.id;
              const frameSize = desktop ? 74 : 60;
              const spriteWidth = frameSize * (677 / 369);
              return (
                <View
                  key={stage.id}
                  style={[
                    progressScreenStyles.stageCard,
                    desktop && progressScreenStyles.desktopStageCard,
                    isCurrent && progressScreenStyles.stageCardActive,
                  ]}
                >
                  <View
                    style={[
                      progressScreenStyles.stageImageWrap,
                      desktop && progressScreenStyles.desktopStageImageWrap,
                      !unlocked && progressScreenStyles.stageImageLocked,
                    ]}
                  >
                    <Image
                      source={stage.eyesOpen}
                      style={[
                        progressScreenStyles.stageSprite,
                        {
                          width: spriteWidth,
                          height: frameSize,
                          left: (frameSize - spriteWidth) / 2,
                        },
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={progressScreenStyles.stageInfo}>
                    <View style={progressScreenStyles.stageHeaderRow}>
                      <Text style={[progressScreenStyles.stageName, desktop && progressScreenStyles.desktopStageName]}>
                        {stage.name}
                      </Text>
                      {isCurrent && <Text style={progressScreenStyles.currentBadge}>Actual</Text>}
                    </View>
                    <Text style={[progressScreenStyles.stageDesc, desktop && progressScreenStyles.desktopStageDesc]}>
                      {stage.description}
                    </Text>
                    <Text style={[progressScreenStyles.stageLevel, desktop && progressScreenStyles.desktopStageLevel]}>
                      {unlocked ? 'Desbloqueado' : `Se desbloquea en nivel ${stage.minLevel}`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
