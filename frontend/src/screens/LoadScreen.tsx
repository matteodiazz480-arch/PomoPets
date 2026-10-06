import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FittedImageBackground from '../components/FittedImageBackground';
import { colors } from '../theme/colors';

const LOAD_IMAGE = require('../../Pets/LoadScreen.jpg');
const LOAD_DURATION = 2600;

type Props = {
  onFinish: () => void;
};

export default function LoadScreen({ onFinish }: Props) {
  const insets = useSafeAreaInsets();
  const desktop = useWindowDimensions().width >= 900;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: LOAD_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) onFinish();
    });
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <FittedImageBackground
      source={LOAD_IMAGE}
      aspectRatio={1536 / 2752}
      backgroundColor={colors.appBg}
      coverOnDesktop
    >
      <View style={styles.root}>
        <LinearGradient
          colors={['rgba(20,24,46,0)', 'rgba(20,24,46,0.15)', 'rgba(20,24,46,0.72)']}
          locations={[0, 0.55, 1]}
          style={styles.scrim}
        />
        <View
          style={[
            styles.bottomArea,
            desktop && styles.desktopBottomArea,
            { paddingBottom: insets.bottom + 48 },
          ]}
        >
          <Text style={[styles.brand, desktop && styles.desktopBrand]}>PomoPets</Text>
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { width }]} />
          </View>
          <Text style={styles.hint}>Preparando tu hábitat…</Text>
        </View>
      </View>
    </FittedImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  bottomArea: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  desktopBottomArea: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 18,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  desktopBrand: {
    fontSize: 34,
  },
  track: {
    width: '100%',
    height: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: colors.white,
  },
  hint: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
    opacity: 0.9,
  },
});
