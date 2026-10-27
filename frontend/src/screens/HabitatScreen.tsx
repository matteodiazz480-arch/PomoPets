import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import CoinStoreModal from '../components/CoinStoreModal';
import HabitatBackground from '../components/HabitatBackground';
import PetAvatar from '../components/PetAvatar';
import PrimaryButton from '../components/PrimaryButton';
import ProfileModal from '../components/ProfileModal';
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
import { colors, habitatScreenStyles } from '../style';

const PHRASE_REFRESH_MS = 5 * 60 * 1000;
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

function DurationButton({
  minutes,
  active,
  desktop,
  onSelect,
}: {
  minutes: number;
  active: boolean;
  desktop: boolean;
  onSelect: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    Animated.spring(scale, { toValue: 0.92, friction: 8, tension: 240, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onSelect}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[
          habitatScreenStyles.durationOption,
          desktop && habitatScreenStyles.desktopDurationOption,
          active && habitatScreenStyles.durationOptionActive,
          { transform: [{ scale }] },
        ]}
      >
        <Text
          style={[
            habitatScreenStyles.durationLabel,
            desktop && habitatScreenStyles.desktopDurationLabel,
            active && habitatScreenStyles.durationLabelActive,
          ]}
        >
          {minutes} min
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function HabitatScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const desktop = width >= 900;
  const timerSize = desktop
    ? Math.min(width >= 1050 ? 280 : 220, height * 0.31)
    : height <= 750
      ? 150
      : 168;
  const largeControls = width >= 1100;
  const petSize = desktop
    ? Math.min(420, height * 0.48, (width - 356) * 0.42)
    : Math.min(170, height * 0.22, width * 0.48);
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
  const [profileVisible, setProfileVisible] = useState(false);
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
    [phraseTick, state.streak, phase, focusBucket]
  );

  return (
    <HabitatBackground transparentDesktop={desktop}>
      <TopBar
        coins={state.coins}
        streak={state.streak}
        playerName={state.playerName}
        photoUrl={state.photoUrl}
        level={level}
        onOpenProfile={() => setProfileVisible(true)}
        onOpenCoins={() => setCoinStoreVisible(true)}
        desktop={desktop}
      />

      <ScrollView
        contentContainerStyle={[
          habitatScreenStyles.scroll,
          desktop && habitatScreenStyles.desktopScroll,
          {
            paddingTop: insets.top + (desktop ? 70 : 64),
            paddingBottom: desktop ? 40 : insets.bottom + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {desktop && (
          <View style={habitatScreenStyles.desktopHeading}>
            <Text style={habitatScreenStyles.desktopEyebrow}>TU ESPACIO DE ENFOQUE</Text>
            <Text style={habitatScreenStyles.desktopTitle}>Un paso a la vez</Text>
          </View>
        )}
        <View style={[habitatScreenStyles.dashboard, desktop && habitatScreenStyles.desktopDashboard]}>
          <View style={[habitatScreenStyles.petSection, desktop && habitatScreenStyles.desktopPetSection]}>
            <View style={habitatScreenStyles.bubbleWrap}>
              <SpeechBubble text={phrase} large={desktop} />
            </View>
            <View style={[habitatScreenStyles.petCharacter, desktop && habitatScreenStyles.desktopPetCharacter]}>
              <TouchableOpacity
                style={habitatScreenStyles.petNameRow}
                activeOpacity={0.7}
                onPress={() => setRenameVisible(true)}
              >
                <Text style={[habitatScreenStyles.petName, desktop && habitatScreenStyles.desktopPetName]}>
                  {displayName}
                </Text>
                <Ionicons name="pencil" size={14} color={colors.textSecondary} style={habitatScreenStyles.petNameIcon} />
              </TouchableOpacity>
              <PetAvatar eyesOpen={stage.eyesOpen} eyesClosed={stage.eyesClosed} size={petSize} />
            </View>
            <View style={habitatScreenStyles.xpBarWrap}>
              <XPBar level={level} xpIntoLevel={xpIntoLevel} xpToNext={xpToNext} large={desktop} />
            </View>
          </View>

          <View style={[habitatScreenStyles.focusColumn, desktop && habitatScreenStyles.desktopFocusColumn]}>
            <View style={[habitatScreenStyles.card, desktop && habitatScreenStyles.desktopCard]}>
              <Text style={[habitatScreenStyles.phaseLabel, desktop && habitatScreenStyles.desktopPhaseLabel]}>
                {phase === 'idle' && 'Listo para estudiar'}
                {phase === 'focus' && 'Enfoque en curso'}
                {phase === 'break' && 'Tiempo de Descanso'}
              </Text>

              <TimerRing
                progress={phase === 'idle' ? 0 : progress}
                label={formatTime(secondsLeft)}
                sublabel={phase === 'break' ? 'Descanso' : `${state.pomodoroMinutes} min sesión`}
                size={timerSize}
              />

              {phase === 'idle' && (
                <View style={habitatScreenStyles.durationsRow}>
                  {DURATIONS.map((d) => (
                    <DurationButton
                      key={d}
                      minutes={d}
                      active={state.pomodoroMinutes === d}
                      desktop={desktop}
                      onSelect={() => {
                        if (state.pomodoroMinutes === d) return;
                        playSound('tap');
                        setPomodoroMinutes(d);
                      }}
                    />
                  ))}
                </View>
              )}

              <View style={[habitatScreenStyles.controlsRow, desktop && habitatScreenStyles.desktopControlsRow]}>
                {phase === 'idle' && (
                  <PrimaryButton
                    label="Iniciar Pomodoro"
                    iconName="play"
                    size={largeControls ? 'large' : 'default'}
                    onPress={startFocus}
                  />
                )}
                {phase !== 'idle' && isRunning && (
                  <PrimaryButton
                    label="Pausar"
                    iconName="pause"
                    variant="secondary"
                    size={largeControls ? 'large' : 'default'}
                    onPress={pause}
                  />
                )}
                {phase !== 'idle' && !isRunning && (
                  <PrimaryButton
                    label="Reanudar"
                    iconName="play"
                    size={largeControls ? 'large' : 'default'}
                    onPress={resume}
                  />
                )}
                {phase !== 'idle' && (
                  <View style={habitatScreenStyles.resetWrap}>
                    <PrimaryButton
                      label="Reiniciar"
                      iconName="refresh"
                      variant="ghost"
                      size={largeControls ? 'large' : 'default'}
                      onPress={reset}
                    />
                  </View>
                )}
              </View>
            </View>
            <TaskList
              tasks={state.tasks}
              onAdd={addTask}
              onToggle={toggleTask}
              onDelete={deleteTask}
              desktop={desktop}
            />
          </View>
        </View>
      </ScrollView>

      <RewardModal
        visible={!!lastReward}
        xp={lastReward?.xp ?? 0}
        coins={lastReward?.coins ?? 0}
        onClose={clearLastReward}
      />
      <ProfileModal visible={profileVisible} onClose={() => setProfileVisible(false)} />
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
