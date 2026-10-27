import { createAudioPlayer, preload, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

const SOURCES = {
  tap: require('../../Pets/Button.mp3'),
  levelup: require('../../Pets/Reward.mp3'),
  quest: require('../../Pets/RewardQuest.mp3'),
  success: require('../../assets/sounds/success.wav'),
  coin: require('../../assets/sounds/coin.wav'),
  denied: require('../../assets/sounds/denied.wav'),
  feed: require('../../assets/sounds/feed.wav'),
  alarm: require('../../assets/sounds/alarm.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

const VOLUME: Partial<Record<SoundName, number>> = {
  tap: 0.45,
  levelup: 0.85,
  quest: 0.85,
  feed: 0.7,
  alarm: 0.75,
};

(Object.keys(SOURCES) as SoundName[]).forEach((name) => {
  try {
    preload(SOURCES[name]);
  } catch {}
});

const MIN_INTERVAL_MS = 60;
const lastPlayedAt: Partial<Record<SoundName, number>> = {};

export async function initAudio() {
  try {
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
  } catch {}
}

export function playSound(name: SoundName) {
  const now = Date.now();
  const last = lastPlayedAt[name] ?? 0;
  if (now - last < MIN_INTERVAL_MS) return;
  lastPlayedAt[name] = now;

  requestAnimationFrame(() => {
    let player: AudioPlayer | null = null;
    try {
      player = createAudioPlayer(SOURCES[name]);
      player.volume = VOLUME[name] ?? 0.8;
      player.play();

      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          subscription.remove();
          player?.remove();
        }
      });
    } catch {
      player?.remove();
    }
  });
}
