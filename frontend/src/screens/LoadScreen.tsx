import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FittedImageBackground from '../components/FittedImageBackground';
import { colors, loadScreenStyles } from '../style';

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
  }, [onFinish, progress]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <FittedImageBackground
      source={LOAD_IMAGE}
      aspectRatio={1536 / 2752}
      backgroundColor={colors.appBg}
      coverOnDesktop
    >
      <View style={loadScreenStyles.root}>
        <LinearGradient
          colors={['rgba(20,24,46,0)', 'rgba(20,24,46,0.15)', 'rgba(20,24,46,0.72)']}
          locations={[0, 0.55, 1]}
          style={loadScreenStyles.scrim}
        />
        <View
          style={[
            loadScreenStyles.bottomArea,
            desktop && loadScreenStyles.desktopBottomArea,
            { paddingBottom: insets.bottom + 48 },
          ]}
        >
          <Text style={[loadScreenStyles.brand, desktop && loadScreenStyles.desktopBrand]}>PomoPets</Text>
          <View style={loadScreenStyles.track}>
            <Animated.View style={[loadScreenStyles.fill, { width }]} />
          </View>
          <Text style={loadScreenStyles.hint}>Preparando tu hábitat…</Text>
        </View>
      </View>
    </FittedImageBackground>
  );
}
