import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';
import FittedImageBackground from './FittedImageBackground';
import { SHOP_BACKGROUNDS } from '../data/shop';
import type { BackgroundThemeId } from '../theme/colors';

// Overwrite Pets/Background.png with your own artwork whenever you like —
// this is the only place the app references it, no other code changes needed.
const BACKGROUND_IMAGE = require('../../Pets/Background.png');

type Props = {
  theme: BackgroundThemeId;
  children?: React.ReactNode;
};

// Each shop theme re-tints the same photo with a soft color-grade overlay,
// so the real background art always shows through.
const THEME_OVERLAY: Record<BackgroundThemeId, { colors: [string, string, string]; opacity: number }> = {
  sky: { colors: ['#D7F0FF', '#EAF6FF', '#F5FBFF'], opacity: 0 },
  forest: { colors: ['#DFF3D8', '#DFF3D8', '#CDECC9'], opacity: 0.28 },
  sunset: { colors: ['#FFD3B0', '#FFB5A7', '#F5A9C6'], opacity: 0.32 },
  night: { colors: ['#2E3568', '#3A3F73', '#4B4A8A'], opacity: 0.62 },
};

export default function HabitatBackground({ theme, children }: Props) {
  const overlay = THEME_OVERLAY[theme] ?? THEME_OVERLAY.sky;
  const item = SHOP_BACKGROUNDS.find((b) => b.id === theme);

  return (
    <FittedImageBackground
      source={BACKGROUND_IMAGE}
      aspectRatio={1080 / 1920}
      backgroundColor={overlay.colors[1]}
    >
      {overlay.opacity > 0 && (
        <LinearGradient
          colors={item?.colors ?? overlay.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[StyleSheet.absoluteFill, { opacity: overlay.opacity }]}
        />
      )}
      {children}
    </FittedImageBackground>
  );
}
