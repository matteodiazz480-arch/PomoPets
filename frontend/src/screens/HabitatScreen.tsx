import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import CoinStoreModal from '../components/CoinStoreModal';
import HabitatBackground from '../components/HabitatBackground';
import PetAvatar from '../components/PetAvatar';
import PrimaryButton from '../components/PrimaryButton';
import RenameModal from '../components/RenameModal';
import RewardModal from '../components/RewardModal';
import SpeechBubble from '../components/SpeechBubble';
import TaskList from '../components/TaskList';
import TimerRing from '../components/TimerRing';
import TopBar from '../components/TopBar';
import XPBar from '../components/XPBar';
import { useGame } from '../context/GameContext';
import { getPetPhrase } from '../data/petPhrases';
import { getStageForLevel } from '../data/pets';
import { colors } from '../theme/colors';

// How often the pet's line refreshes on its own (it also refreshes whenever
// phase/streak change) — keeps it feeling alive without flickering text.
const PHRASE_REFRESH_MS = 5 * 60 * 1000;
// Buckets focus-session progress into 5-minute steps so the phrase doesn't
// recompute (and reroll its random pick) on every single countdown tick.
const FOCUS_BUCKET_MINUTES = 5;

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

const DURATIONS = [15, 25, 45];

export default function HabitatScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const desktop = width >= 900;
  const petSize = desktop
    ? Math.min(width >= 1200 ? 480 : 360, height * (width >= 1200 ? 0.62 : 0.48), (width - 232) * (width >= 1200 ? 0.42 : 0.48))
    : Math.min(height <= 900 ? 225 : 240, width * 0.62);
  const {
    state,
    level,
    xpIntoLevel,
    xpToNext,
    phase,
    secondsLeft,
    isRunning,
    startFocus,
    pause,
    resume,
    reset,
    setPomodoroMinutes,
    lastReward,
    clearLastReward,
    setPetName,
    addTask,
    toggleTask,
    deleteTask,
  } = useGame();
  const [coinStoreVisible, setCoinStoreVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [phraseTick, setPhraseTick] = useState(0);

  const stage = getStageForLevel(level);
  const displayName = state.petName ?? stage.name;
  const totalSeconds = (phase === 'break' ? state.breakMinutes : state.pomodoroMinutes) * 60;
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  const elapsedFocusMinutes = phase === 'focus' ? Math.floor((state.pomodoroMinutes * 60 - secondsLeft) / 60) : 0;
  const focusBucket = Math.floor(elapsedFocusMinutes / FOCUS_BUCKET_MINUTES);

  useEffect(() => {
    const id = setInterval(() => setPhraseTick((t) => t + 1), PHRASE_REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const phrase = useMemo(
    () =>
      getPetPhrase({
        hour: new Date().getHours(),
        streak: state.streak,
        phase,
        elapsedFocusMinutes: focusBucket * FOCUS_BUCKET_MINUTES,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phraseTick, state.streak, phase, focusBucket]
  );

  return (
    <HabitatBackground theme={state.activeBackground}>
      <TopBar coins={state.coins} streak={state.streak} onAddCoins={() => setCoinStoreVisible(true)} desktop={desktop} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          desktop && styles.desktopScroll,
          {
            paddingTop: insets.top + (desktop ? 92 : height <= 900 ? 32 : 52),
            paddingBottom: desktop ? 40 : insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {desktop && (
          <View style={styles.desktopHeading}>
            <Text style={styles.desktopEyebrow}>TU ESPACIO DE ENFOQUE</Text>
            <Text style={styles.desktopTitle}>Un paso a la vez</Text>
          </View>
        )}
        <View style={[styles.dashboard, desktop && styles.desktopDashboard]}>
          <View style={[styles.petSection, desktop && styles.desktopPetSection]}>
            <View style={styles.bubbleWrap}>
              <SpeechBubble text={phrase} />
            </View>
            <TouchableOpacity
              style={styles.petNameRow}
              activeOpacity={0.7}
              onPress={() => setRenameVisible(true)}
            >
              <Text style={styles.petName}>{displayName}</Text>
              <Ionicons name="pencil" size={14} color={colors.textSecondary} style={styles.petNameIcon} />
            </TouchableOpacity>
            <PetAvatar eyesOpen={stage.eyesOpen} eyesClosed={stage.eyesClosed} size={petSize} />
            <View style={styles.xpBarWrap}>
              <XPBar level={level} xpIntoLevel={xpIntoLevel} xpToNext={xpToNext} />
            </View>
          </View>

          <View style={[styles.focusColumn, desktop && styles.desktopFocusColumn]}>
            <View style={[styles.card, desktop && styles.desktopCard]}>
              <Text style={styles.phaseLabel}>
                {phase === 'idle' && 'Listo para estudiar'}
                {phase === 'focus' && '🎯 Enfoque en curso'}
                {phase === 'break' && '☕ Descanso'}
              </Text>

              <TimerRing
                progress={phase === 'idle' ? 0 : progress}
                label={formatTime(secondsLeft)}
                sublabel={phase === 'break' ? 'Descanso' : `${state.pomodoroMinutes} min sesión`}
                size={desktop ? 220 : height <= 900 ? 160 : 184}
              />

              {phase === 'idle' && (
                <View style={styles.durationsRow}>
                  {DURATIONS.map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.durationOption, state.pomodoroMinutes === d && styles.durationOptionActive]}
                      accessibilityRole="button"
                      accessibilityState={{ selected: state.pomodoroMinutes === d }}
                      onPress={() => {
                        if (state.pomodoroMinutes === d) return;
                        playSound('tap');
                        setPomodoroMinutes(d);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.durationLabel, state.pomodoroMinutes === d && styles.durationLabelActive]}>
                        {d} min
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.controlsRow}>
                {phase === 'idle' && (
                  <PrimaryButton label="Iniciar Pomodoro" iconName="play" onPress={startFocus} />
                )}
                {phase !== 'idle' && isRunning && (
                  <PrimaryButton label="Pausar" iconName="pause" variant="secondary" onPress={pause} />
                )}
                {phase !== 'idle' && !isRunning && (
                  <PrimaryButton label="Reanudar" iconName="play" onPress={resume} />
                )}
                {phase !== 'idle' && (
                  <View style={styles.resetWrap}>
                    <PrimaryButton label="Reiniciar" iconName="refresh" variant="ghost" onPress={reset} />
                  </View>
                )}
              </View>
            </View>
            <TaskList tasks={state.tasks} onAdd={addTask} onToggle={toggleTask} onDelete={deleteTask} />
          </View>
        </View>
      </ScrollView>

      <RewardModal
        visible={!!lastReward}
        xp={lastReward?.xp ?? 0}
        coins={lastReward?.coins ?? 0}
        onClose={clearLastReward}
      />
      <CoinStoreModal visible={coinStoreVisible} onClose={() => setCoinStoreVisible(false)} />
      <RenameModal
        visible={renameVisible}
        initialName={displayName}
        onSave={setPetName}
        onClose={() => setRenameVisible(false)}
      />
    </HabitatBackground>
  );
}

const styles = StyleSheet.create({
  scroll: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  desktopScroll: {
    maxWidth: 1320,
    paddingHorizontal: 40,
    alignItems: 'stretch',
  },
  desktopHeading: {
    marginBottom: 22,
  },
  desktopEyebrow: {
    color: colors.secondaryDark,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  desktopTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 5,
  },
  dashboard: {
    width: '100%',
  },
  desktopDashboard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  petSection: {
    alignItems: 'center',
    marginBottom: 4,
  },
  desktopPetSection: {
    flex: 0.9,
    minWidth: 0,
    paddingVertical: 24,
  },
  focusColumn: {
    width: '100%',
  },
  desktopFocusColumn: {
    flex: 1.1,
    minWidth: 0,
  },
  bubbleWrap: {
    marginBottom: 2,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  petName: {
    fontSize: 23,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  petNameIcon: {
    marginLeft: 6,
    marginTop: 4,
  },
  xpBarWrap: {
    width: '80%',
    marginTop: 6,
  },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 5,
    borderBottomColor: '#E6D5BF',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
  },
  desktopCard: {
    paddingVertical: 24,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  phaseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  durationsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 4,
    marginTop: 12,
    padding: 4,
    borderRadius: 15,
    backgroundColor: colors.cardAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  durationOption: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  durationOptionActive: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryDeep,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 2,
  },
  durationLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  durationLabelActive: {
    color: colors.white,
    fontWeight: '800',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  resetWrap: {
    marginLeft: 4,
  },
});
