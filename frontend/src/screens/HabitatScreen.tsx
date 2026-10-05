import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const PET_SIZE = Math.min(320, Dimensions.get('window').width - 60);
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
      <TopBar coins={state.coins} streak={state.streak} onAddCoins={() => setCoinStoreVisible(true)} />

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 52, paddingBottom: insets.bottom + 110 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.petSection}>
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
          <PetAvatar eyesOpen={stage.eyesOpen} eyesClosed={stage.eyesClosed} size={PET_SIZE} />
          <View style={styles.xpBarWrap}>
            <XPBar level={level} xpIntoLevel={xpIntoLevel} xpToNext={xpToNext} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.phaseLabel}>
            {phase === 'idle' && 'Listo para estudiar'}
            {phase === 'focus' && '🎯 Enfoque en curso'}
            {phase === 'break' && '☕ Descanso'}
          </Text>

          <TimerRing
            progress={phase === 'idle' ? 0 : progress}
            label={formatTime(secondsLeft)}
            sublabel={phase === 'break' ? 'Descanso' : `${state.pomodoroMinutes} min sesión`}
          />

          {phase === 'idle' && (
            <View style={styles.durationsRow}>
              {DURATIONS.map((d) => (
                <View key={d} style={styles.durationChipWrap}>
                  <PrimaryButton
                    label={`${d} min`}
                    variant={state.pomodoroMinutes === d ? 'primary' : 'secondary'}
                    onPress={() => setPomodoroMinutes(d)}
                  />
                </View>
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
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  petSection: {
    alignItems: 'center',
    marginBottom: 14,
  },
  bubbleWrap: {
    marginBottom: 10,
  },
  petNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  petName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  petNameIcon: {
    marginLeft: 6,
    marginTop: 4,
  },
  xpBarWrap: {
    width: '80%',
    marginTop: 8,
  },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 30,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 6,
  },
  phaseLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  durationsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  durationChipWrap: {
    transform: [{ scale: 0.82 }],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 22,
    gap: 4,
  },
  resetWrap: {
    marginLeft: 4,
  },
});
