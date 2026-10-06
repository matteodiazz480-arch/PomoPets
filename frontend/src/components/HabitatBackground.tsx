import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg';
import FittedImageBackground from './FittedImageBackground';
import { SHOP_BACKGROUNDS } from '../data/shop';
import type { BackgroundThemeId } from '../theme/colors';

// Overwrite Pets/Background.png with your own artwork whenever you like —
// this is the only place the app references it, no other code changes needed.
const BACKGROUND_IMAGE = require('../../Pets/Background.png');

type Props = {
  theme: BackgroundThemeId;
  children?: React.ReactNode;
  transparentDesktop?: boolean;
};

type LandscapePalette = {
  skyTop: string;
  skyBottom: string;
  sun: string;
  hillBack: string;
  hillFront: string;
};

const LANDSCAPE_PALETTES: Record<BackgroundThemeId, LandscapePalette> = {
  sky: {
    skyTop: '#CDEBFF',
    skyBottom: '#F1FAFF',
    sun: '#FFF3BD',
    hillBack: '#CFEBC9',
    hillFront: '#A8DDB0',
  },
  forest: {
    skyTop: '#D9F0D0',
    skyBottom: '#F3F9E8',
    sun: '#FFF2BA',
    hillBack: '#B9DDAF',
    hillFront: '#8CCB91',
  },
  sunset: {
    skyTop: '#FFC9B1',
    skyBottom: '#F8D5E2',
    sun: '#FFF0C4',
    hillBack: '#E9B4B0',
    hillFront: '#D593A4',
  },
  night: {
    skyTop: '#343B71',
    skyBottom: '#62639A',
    sun: '#F4E7AE',
    hillBack: '#596294',
    hillFront: '#424C7B',
  },
};

const THEME_OVERLAY: Record<BackgroundThemeId, { colors: [string, string, string]; opacity: number }> = {
  sky: { colors: ['#D7F0FF', '#EAF6FF', '#F5FBFF'], opacity: 0 },
  forest: { colors: ['#DFF3D8', '#DFF3D8', '#CDECC9'], opacity: 0.28 },
  sunset: { colors: ['#FFD3B0', '#FFB5A7', '#F5A9C6'], opacity: 0.32 },
  night: { colors: ['#2E3568', '#3A3F73', '#4B4A8A'], opacity: 0.62 },
};

function DesktopLandscape({ theme }: { theme: BackgroundThemeId }) {
  const { width, height } = useWindowDimensions();
  const palette = LANDSCAPE_PALETTES[theme];
  const sunRadius = Math.min(height * 0.16, width * 0.11);
  const backHillTop = height * 0.76;
  const frontHillTop = height * 0.86;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={StyleSheet.absoluteFill}
      preserveAspectRatio="none"
    >
      <Defs>
        <SvgLinearGradient id="habitat-sky" x1="0" y1="0" x2="0" y2={height}>
          <Stop offset="0" stopColor={palette.skyTop} />
          <Stop offset="1" stopColor={palette.skyBottom} />
        </SvgLinearGradient>
      </Defs>
      <Path d={`M0 0H${width}V${height}H0Z`} fill="url(#habitat-sky)" />
      <Circle
        cx={width * 0.76}
        cy={height * 0.25}
        r={sunRadius}
        fill={palette.sun}
        opacity={theme === 'night' ? 0.62 : 0.7}
      />

      <Ellipse cx={width * 0.14} cy={height * 0.16} rx={height * 0.075} ry={height * 0.035} fill="#FFFFFF" opacity={0.54} />
      <Ellipse cx={width * 0.18} cy={height * 0.14} rx={height * 0.09} ry={height * 0.05} fill="#FFFFFF" opacity={0.72} />
      <Ellipse cx={width * 0.23} cy={height * 0.16} rx={height * 0.07} ry={height * 0.035} fill="#FFFFFF" opacity={0.62} />
      <Ellipse cx={width * 0.53} cy={height * 0.1} rx={height * 0.07} ry={height * 0.035} fill="#FFFFFF" opacity={0.5} />
      <Ellipse cx={width * 0.57} cy={height * 0.12} rx={height * 0.055} ry={height * 0.03} fill="#FFFFFF" opacity={0.58} />

      <Path
        d={`M0 ${backHillTop} C${width * 0.16} ${height * 0.83} ${width * 0.24} ${height * 0.7} ${width * 0.4} ${height * 0.75} C${width * 0.57} ${height * 0.81} ${width * 0.68} ${height * 0.7} ${width * 0.82} ${height * 0.76} C${width * 0.91} ${height * 0.8} ${width * 0.96} ${height * 0.82} ${width} ${height * 0.78} V${height} H0Z`}
        fill={palette.hillBack}
      />
      <Path
        d={`M0 ${frontHillTop} C${width * 0.16} ${height * 0.79} ${width * 0.26} ${height * 0.94} ${width * 0.43} ${height * 0.88} C${width * 0.6} ${height * 0.82} ${width * 0.67} ${height * 0.8} ${width * 0.82} ${height * 0.88} C${width * 0.91} ${height * 0.93} ${width * 0.96} ${height * 0.92} ${width} ${height * 0.89} V${height} H0Z`}
        fill={palette.hillFront}
      />
    </Svg>
  );
}

export default function HabitatBackground({ theme, children, transparentDesktop = false }: Props) {
  const desktop = useWindowDimensions().width >= 900;
  const overlay = THEME_OVERLAY[theme] ?? THEME_OVERLAY.sky;
  const item = SHOP_BACKGROUNDS.find((b) => b.id === theme);

  if (desktop && transparentDesktop) {
    return <View style={styles.transparentContainer} pointerEvents="box-none">{children}</View>;
  }

  if (desktop) {
    return (
      <View style={styles.desktopContainer}>
        <DesktopLandscape theme={theme} />
        <View style={styles.content} pointerEvents="box-none">{children}</View>
      </View>
    );
  }

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

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  transparentContainer: {
    flex: 1,
  },
  content: {
    ...StyleSheet.absoluteFill,
  },
});
