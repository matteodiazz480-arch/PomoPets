import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, timerRingStyles } from '../style';

type Props = {
  progress: number;
  label: string;
  sublabel: string;
  size?: number;
};

export default function TimerRing({ progress, label, sublabel, size = 180 }: Props) {
  const stroke = size >= 240 ? 15 : 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <View style={[timerRingStyles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={timerRingStyles.center}>
        <Text style={[timerRingStyles.time, size >= 240 && timerRingStyles.largeTime]}>{label}</Text>
        <Text style={[timerRingStyles.sub, size >= 240 && timerRingStyles.largeSub]}>{sublabel}</Text>
      </View>
    </View>
  );
}
