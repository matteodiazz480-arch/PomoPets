import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

type Props = {
  size?: number;
  style?: ViewStyle;
};

export default function CoinIcon({ size = 24, style }: Props) {
  return (
    <View
      accessible
      accessibilityLabel="Moneda"
      style={[{ width: size, height: size }, style]}
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="coinGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFEA79" />
            <Stop offset="0.45" stopColor="#FFC837" />
            <Stop offset="1" stopColor="#FF9800" />
          </LinearGradient>
          <LinearGradient id="coinBevel" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#D48200" />
            <Stop offset="1" stopColor="#9C5200" />
          </LinearGradient>
          <LinearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFFDF0" />
            <Stop offset="1" stopColor="#FFE082" />
          </LinearGradient>
        </Defs>

        <Circle cx="50" cy="54" r="46" fill="url(#coinBevel)" />
        <Circle cx="50" cy="49" r="46" fill="url(#coinGrad)" stroke="#B86C00" strokeWidth="2.5" />
        <Circle cx="50" cy="49" r="36" fill="none" stroke="#FFE97D" strokeWidth="3" opacity={0.9} />
        <Circle cx="50" cy="49.8" r="37" fill="none" stroke="#C97500" strokeWidth="1.5" opacity={0.55} />
        <Path
          d="M50 28 C50 38 41 49 30 49 C41 49 50 60 50 70 C50 60 59 49 70 49 C59 49 50 38 50 28 Z"
          fill="url(#starGrad)"
          stroke="#C27300"
          strokeWidth="1.8"
        />
        <Path
          d="M24 38 A34 34 0 0 1 76 38 A35 32 0 0 0 24 38 Z"
          fill="#FFFFFF"
          opacity={0.42}
        />
        <Circle cx="35" cy="30" r="3.2" fill="#FFFFFF" opacity={0.85} />
      </Svg>
    </View>
  );
}
