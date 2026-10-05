import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MissionCard from '../components/MissionCard';
import { useGame } from '../context/GameContext';
import { getDailyMissions } from '../data/missions';
import { EVOLUTION_STAGES, getStageForLevel } from '../data/pets';
import { colors } from '../theme/colors';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { level, xpIntoLevel, xpToNext, state, claimMission } = useGame();
  const currentStage = getStageForLevel(level);
  const todaysMissions = getDailyMissions(state.missionsDate ?? `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 110 }]}
      >
        <Text style={styles.title}>Progreso</Text>
        <Text style={styles.subtitle}>Tu camino de evolución</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{level}</Text>
            <Text style={styles.statLabel}>Nivel</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{state.streak}</Text>
            <Text style={styles.statLabel}>Racha 🔥</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{state.minutesStudiedTotal}</Text>
            <Text style={styles.statLabel}>Minutos</Text>
          </View>
        </View>

        <View style={styles.xpCard}>
          <Text style={styles.xpCardTitle}>
            {xpIntoLevel} / {xpToNext} XP para el siguiente nivel
          </Text>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${Math.min(1, xpIntoLevel / xpToNext) * 100}%` }]} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Misiones diarias</Text>
        {todaysMissions.map((mission) => (
          <MissionCard
            key={mission.id}
            mission={mission}
            progress={mission.getProgress(state)}
            claimed={state.claimedMissions.includes(mission.id)}
            onClaim={() => claimMission(mission.id)}
          />
        ))}

        <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Etapas de evolución</Text>
        {EVOLUTION_STAGES.map((stage) => {
          const unlocked = level >= stage.minLevel;
          const isCurrent = stage.id === currentStage.id;
          return (
            <View key={stage.id} style={[styles.stageCard, isCurrent && styles.stageCardActive]}>
              <View style={[styles.stageImageWrap, !unlocked && styles.stageImageLocked]}>
                <Image source={stage.eyesOpen} style={styles.stageImage} resizeMode="contain" />
              </View>
              <View style={styles.stageInfo}>
                <View style={styles.stageHeaderRow}>
                  <Text style={styles.stageName}>{stage.name}</Text>
                  {isCurrent && <Text style={styles.currentBadge}>Actual</Text>}
                </View>
                <Text style={styles.stageDesc}>{stage.description}</Text>
                <Text style={styles.stageLevel}>
                  {unlocked ? 'Desbloqueado' : `Se desbloquea en nivel ${stage.minLevel}`}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  scroll: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  xpCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  xpCardTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    fontSize: 13,
  },
  xpTrack: {
    height: 12,
    borderRadius: 8,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.accentPurple,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  sectionTitleSpaced: {
    marginTop: 8,
  },
  stageCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  stageCardActive: {
    borderColor: colors.primary,
  },
  stageImageWrap: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stageImageLocked: {
    opacity: 0.35,
  },
  stageImage: {
    width: 48,
    height: 48,
  },
  stageInfo: {
    flex: 1,
  },
  stageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageName: {
    fontWeight: '800',
    fontSize: 15,
    color: colors.textPrimary,
  },
  currentBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  stageDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  stageLevel: {
    fontSize: 11,
    color: colors.secondaryDark,
    marginTop: 4,
    fontWeight: '700',
  },
});
