// One-off script: synthesizes soft, iOS-notification-style UI sound effects as WAV files.
// Run with: node scripts/generate-sounds.js
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(OUT_DIR, { recursive: true });

function note(freq, startSec, durSec, peakVol, opts = {}) {
  return { freq, startSec, durSec, peakVol, ...opts };
}

// Renders a list of overlapping sine "notes" (each with its own attack/release envelope)
// into a single mono Float32 buffer, then encodes as 16-bit PCM WAV.
function synth(totalDurSec, notes, { filename }) {
  const totalSamples = Math.ceil(totalDurSec * SAMPLE_RATE);
  const buf = new Float32Array(totalSamples);

  for (const n of notes) {
    const startSample = Math.floor(n.startSec * SAMPLE_RATE);
    const durSamples = Math.floor(n.durSec * SAMPLE_RATE);
    const attack = Math.floor((n.attackSec ?? 0.008) * SAMPLE_RATE);
    const release = Math.floor((n.releaseSec ?? n.durSec * 0.7) * SAMPLE_RATE);

    for (let i = 0; i < durSamples; i++) {
      const t = i / SAMPLE_RATE;
      let env;
      if (i < attack) {
        env = i / attack;
      } else if (i > durSamples - release) {
        env = Math.max(0, (durSamples - i) / release);
      } else {
        env = 1;
      }
      // gentle ease (sin) envelope instead of linear, for a "soft" feel
      env = Math.sin((env * Math.PI) / 2);

      const freq = n.freqEnd ? n.freq + (n.freqEnd - n.freq) * (i / durSamples) : n.freq;
      const sample = Math.sin(2 * Math.PI * freq * t) * env * n.peakVol;

      const idx = startSample + i;
      if (idx >= 0 && idx < buf.length) {
        buf[idx] += sample;
      }
    }
  }

  // soft clip to avoid harshness when notes overlap
  for (let i = 0; i < buf.length; i++) {
    buf[i] = Math.tanh(buf[i] * 1.4) * 0.8;
  }

  writeWav(path.join(OUT_DIR, filename), buf);
  console.log('wrote', filename);
}

function writeWav(filePath, floatBuf) {
  const pcm = Buffer.alloc(floatBuf.length * 2);
  for (let i = 0; i < floatBuf.length; i++) {
    const s = Math.max(-1, Math.min(1, floatBuf[i]));
    pcm.writeInt16LE(Math.round(s * 32767), i * 2);
  }

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);

  fs.writeFileSync(filePath, Buffer.concat([header, pcm]));
}

// Soft tap / click — short, gentle, like an iOS keyboard click but softer.
synth(0.09, [note(1500, 0, 0.06, 0.35, { attackSec: 0.002, releaseSec: 0.05 })], {
  filename: 'tap.wav',
});

// Subtle tick for tab switches — a touch lower & shorter than tap.
synth(0.07, [note(1100, 0, 0.05, 0.28, { attackSec: 0.002, releaseSec: 0.04 })], {
  filename: 'tick.wav',
});

// Gentle two-note ascending chime — session complete / success.
synth(0.6, [
  note(880, 0, 0.28, 0.32, { releaseSec: 0.22 }),
  note(1318.5, 0.12, 0.4, 0.3, { releaseSec: 0.32 }),
], { filename: 'success.wav' });

// Bright little "pop + shimmer" for coins / purchases.
synth(0.35, [
  note(1046.5, 0, 0.05, 0.4, { attackSec: 0.001, releaseSec: 0.04 }),
  note(1568, 0.03, 0.22, 0.28, { releaseSec: 0.18 }),
], { filename: 'coin.wav' });

// Warm ascending 3-note arpeggio for leveling up / evolving.
synth(0.85, [
  note(659.25, 0, 0.22, 0.3, { releaseSec: 0.16 }),
  note(830.6, 0.14, 0.24, 0.3, { releaseSec: 0.18 }),
  note(1046.5, 0.28, 0.45, 0.34, { releaseSec: 0.36 }),
], { filename: 'levelup.wav' });

// Soft muted thud — "can't do that" (not enough coins, etc).
synth(0.18, [note(220, 0, 0.14, 0.3, { attackSec: 0.004, releaseSec: 0.12, freqEnd: 160 })], {
  filename: 'denied.wav',
});

// Very soft whoosh-like start cue for beginning a focus session.
synth(0.4, [
  note(523.25, 0, 0.32, 0.26, { releaseSec: 0.28, freqEnd: 659.25 }),
], { filename: 'start.wav' });

// Gentle "nibble" cue for feeding the pet — a soft low bite thud followed by a light happy chime.
synth(0.32, [
  note(320, 0, 0.07, 0.32, { attackSec: 0.003, releaseSec: 0.05, freqEnd: 220 }),
  note(1180, 0.08, 0.18, 0.22, { releaseSec: 0.15 }),
], { filename: 'feed.wav' });

// Soft, pleasant "timer done" alarm for the notification that fires when a
// Pomodoro/break finishes in the background — a gentle two-round bell chime,
// not jarring, meant to be heard with the phone screen off.
synth(2.1, [
  note(783.99, 0, 0.5, 0.34, { releaseSec: 0.42 }),
  note(1046.5, 0.18, 0.55, 0.3, { releaseSec: 0.46 }),
  note(783.99, 1.05, 0.5, 0.3, { releaseSec: 0.42 }),
  note(1046.5, 1.23, 0.55, 0.26, { releaseSec: 0.46 }),
], { filename: 'alarm.wav' });
