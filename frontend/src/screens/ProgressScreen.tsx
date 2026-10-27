import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import MissionCard from '../components/MissionCard';
import { useGame } from '../context/GameContext';
import { getDailyMissions } from '../data/missions';
import { EVOLUTION_STAGES, getStageForLevel } from '../data/pets';
import { colors } from '../theme/colors';

export default function ProgressScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const width = useWindowDimensions().width;
  const desktop = width >= 900;
  const wide = width >= 1200;
  const { level, xpIntoLevel, xpToNext, state, claimMission } = useGame();
  const currentStage = getStageForLevel(level);
  const todaysMissions = getDailyMissions(state.missionsDate ?? `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          desktop && styles.desktopScroll,
          { paddingTop: insets.top + 20, paddingBottom: desktop ? 40 : insets.bottom + 110 },
        ]}
      >
        <Text style={[styles.title, desktop && styles.desktopTitle]}>Progreso</Text>
        <Text style={[styles.subtitle, desktop && styles.desktopSubtitle]}>Tu camino de evolución</Text>

        <View style={[styles.statsRow, desktop && styles.desktopStatsRow]}>
          <View style={[styles.statCard, desktop && styles.desktopStatCard]}>
            <View style={[styles.badgeContainer, styles.levelBadge, desktop && styles.desktopBadgeContainer]}>
              <Text style={[styles.statValue, desktop && styles.desktopStatValue]}>{level}</Text>
            </View>
            <Text style={[styles.statLabel, desktop && styles.desktopStatLabel]}>Nivel</Text>
          </View>
          <View style={[styles.statCard, desktop && styles.desktopStatCard]}>
            <View style={[styles.badgeContainer, styles.streakBadge, desktop && styles.desktopBadgeContainer]}>
              <Text style={[styles.statValue, desktop && styles.desktopStatValue]}>{state.streak}</Text>
            </View>
            <Text style={[styles.statLabel, desktop && styles.desktopStatLabel]}>Racha 🔥</Text>
          </View>
          <View style={[styles.statCard, desktop && styles.desktopStatCard]}>
            <View style={[styles.badgeContainer, styles.minutesBadge, desktop && styles.desktopBadgeContainer]}>
              <Text style={[styles.statValue, desktop && styles.desktopStatValue]}>{state.minutesStudiedTotal}</Text>
            </View>
            <Text style={[styles.statLabel, desktop && styles.desktopStatLabel]}>Minutos</Text>
          </View>
        </View>

        <View style={[styles.xpCard, desktop && styles.desktopXpCard]}>
          <Text style={[styles.xpCardTitle, desktop && styles.desktopXpCardTitle]}>
            {xpIntoLevel} / {xpToNext} XP para el siguiente nivel
          </Text>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: `${Math.min(1, xpIntoLevel / xpToNext) * 100}%` }]} />
          </View>
        </View>

        {/* Banner de Acceso al Torneo */}
        <TouchableOpacity
          style={styles.tournamentBanner}
          activeOpacity={0.88}
          onPress={() => {
            playSound('tap');
            navigation?.navigate('Torneo');
          }}
        >
          <View style={styles.tournamentBannerIcon}>
            <Ionicons name="trophy" size={24} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tournamentBannerTitle}>Torneo Global de Estudio</Text>
            <Text style={styles.tournamentBannerSub}>
              Compara tus horas de foco y sube al podio de Google Firestore.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.desktopSections, wide && styles.desktopSectionsWide]}>
          <View style={styles.progressSection}>
            <Text style={[styles.sectionTitle, desktop && styles.desktopSectionTitle]}>⭐ Misiones diarias</Text>
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

          <View style={styles.progressSection}>
            <Text style={[styles.sectionTitle, styles.sectionTitleSpaced, desktop && styles.desktopSectionTitle]}>✨ Etapas de evolución</Text>
            {EVOLUTION_STAGES.map((stage) => {
              const unlocked = level >= stage.minLevel;
              const isCurrent = stage.id === currentStage.id;
              const frameSize = desktop ? 74 : 60;
              const spriteWidth = frameSize * (677 / 369);
              return (
                <View key={stage.id} style={[styles.stageCard, desktop && styles.desktopStageCard, isCurrent && styles.stageCardActive]}>
                  <View style={[styles.stageImageWrap, desktop && styles.desktopStageImageWrap, !unlocked && styles.stageImageLocked]}>
                    <Image
                      source={stage.eyesOpen}
                      style={[
                        styles.stageSprite,
                        {
                          width: spriteWidth,
                          height: frameSize,
                          left: (frameSize - spriteWidth) / 2,
                        },
                      ]}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.stageInfo}>
                    <View style={styles.stageHeaderRow}>
                      <Text style={[styles.stageName, desktop && styles.desktopStageName]}>{stage.name}</Text>
                      {isCurrent && <Text style={styles.currentBadge}>Actual</Text>}
                    </View>
                    <Text style={[styles.stageDesc, desktop && styles.desktopStageDesc]}>{stage.description}</Text>
                    <Text style={[styles.stageLevel, desktop && styles.desktopStageLevel]}>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  scroll: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  desktopScroll: {
    maxWidth: 1420,
    paddingHorizontal: 48,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  desktopTitle: {
    fontSize: 38,
  },
  subtitle: {
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 18,
  },
  desktopSubtitle: {
    fontSize: 17,
    marginTop: 6,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  desktopStatsRow: {
    gap: 18,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: '#E6D5BF',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  desktopStatCard: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 24,
  },
  badgeContainer: {
    minWidth: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 2,
    borderBottomWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  desktopBadgeContainer: {
    minWidth: 54,
    height: 52,
    borderRadius: 18,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  statValue: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    includeFontPadding: false,
  },
  desktopStatValue: {
    fontSize: 26,
  },
  levelBadge: {
    backgroundColor: '#EFEBFF',
    borderColor: colors.accentPurple,
  },
  streakBadge: {
    backgroundColor: colors.streakBg,
    borderColor: colors.streak,
  },
  minutesBadge: {
    backgroundColor: '#E5F3FF',
    borderColor: colors.secondary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  desktopStatLabel: {
    fontSize: 14,
    marginTop: 5,
  },
  xpCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: '#E6D5BF',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  desktopXpCard: {
    padding: 24,
    borderRadius: 26,
    marginBottom: 30,
  },
  xpCardTitle: {
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    fontSize: 13,
  },
  desktopXpCardTitle: {
    fontSize: 17,
    marginBottom: 14,
  },
  xpTrack: {
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: colors.textPrimary,
    marginBottom: 14,
  },
  desktopSectionTitle: {
    fontSize: 24,
    marginBottom: 18,
  },
  sectionTitleSpaced: {
    marginTop: 28,
  },
  desktopSections: {
    width: '100%',
  },
  desktopSectionsWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 28,
  },
  progressSection: {
    flex: 1,
    minWidth: 0,
  },
  stageCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
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
  desktopStageCard: {
    padding: 22,
    borderRadius: 26,
    marginBottom: 18,
  },
  stageCardActive: {
    borderColor: colors.primaryDark,
    borderBottomColor: colors.primaryDeep,
  },
  stageImageWrap: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.cardAlt,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  desktopStageImageWrap: {
    width: 74,
    height: 74,
    borderRadius: 21,
    marginRight: 18,
  },
  stageImageLocked: {
    opacity: 0.35,
  },
  stageSprite: {
    position: 'absolute',
    top: 0,
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
    fontWeight: '700',
    fontSize: 15,
    color: colors.textPrimary,
  },
  desktopStageName: {
    fontSize: 18,
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
  desktopStageDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  stageLevel: {
    fontSize: 11,
    color: colors.secondaryDark,
    marginTop: 4,
    fontWeight: '700',
  },
  desktopStageLevel: {
    fontSize: 13,
    marginTop: 7,
  },
  tournamentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: '#FDE68A',
    marginTop: 14,
    gap: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 2,
  },
  tournamentBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tournamentBannerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  tournamentBannerSub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
});
