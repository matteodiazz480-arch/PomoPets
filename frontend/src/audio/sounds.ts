import { createAudioPlayer, preload, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

// Button.mp3 / Reward.mp3 / RewardQuest.mp3 are supplied by the user in Pets/.
// Overwrite those exact filenames to change the sounds — no code changes needed.
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

// Per expo-audio docs, preloading at module scope (before any component
// renders) lets later createAudioPlayer() calls for the same source start
// playback almost instantly instead of decoding the asset from scratch.
(Object.keys(SOURCES) as SoundName[]).forEach((name) => {
  try {
    preload(SOURCES[name]);
  } catch {
    // ignore — sound is a non-critical enhancement
  }
});

// A very short cooldown per sound guards against the same UI event firing
// playSound twice in the same tick (e.g. a bubbling press handler).
const MIN_INTERVAL_MS = 60;
const lastPlayedAt: Partial<Record<SoundName, number>> = {};

export async function initAudio() {
  try {
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
  } catch {
    // ignore
  }
}

/**
 * Plays a sound as a disposable, one-shot player: create → play → auto-remove
 * once it finishes. This never reuses or seeks an existing player (the source
 * of the earlier lag/duplication), so each press is fully independent and
 * overlapping presses simply layer their own short-lived players.
 */
export function playSound(name: SoundName) {
  const now = Date.now();
  const last = lastPlayedAt[name] ?? 0;
  if (now - last < MIN_INTERVAL_MS) return;
  lastPlayedAt[name] = now;

  // Nothing here awaits or blocks — creation, playback and cleanup are all
  // fire-and-forget from the caller's perspective.
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
      // ignore — never let a sound glitch break the UI
      player?.remove();
    }
  });
}
