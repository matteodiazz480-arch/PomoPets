import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const LOAD_IMAGE = require('../../Pets/LoadScreen.jpg');
const LOAD_DURATION = 2600;

type Props = {
  onFinish: () => void;
};

export default function LoadScreen({ onFinish }: Props) {
  const insets = useSafeAreaInsets();
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
    <View style={styles.root}>
      <Image source={LOAD_IMAGE} style={styles.backgroundImage} resizeMode="contain" />
      <LinearGradient
        colors={['rgba(20,24,46,0)', 'rgba(20,24,46,0.15)', 'rgba(20,24,46,0.72)']}
        locations={[0, 0.55, 1]}
        style={styles.scrim}
      />
      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 48 }]}>
        <Text style={styles.brand}>PomoPets</Text>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width }]} />
        </View>
        <Text style={styles.hint}>Preparando tu hábitat…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.appBg,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  bottomArea: {
    paddingHorizontal: 32,
    alignItems: 'center',
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
