import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
import { habitatBackgroundStyles } from '../style';
import FittedImageBackground from './FittedImageBackground';

const BACKGROUND_IMAGE = require('../../Pets/Background.png');

type Props = {
  children?: React.ReactNode;
  transparentDesktop?: boolean;
};

function DefaultDesktopLandscape() {
  const { width, height } = useWindowDimensions();
  const sunRadius = Math.min(height * 0.14, width * 0.12);
  const backHillTop = height * 0.74;
  const frontHillTop = height * 0.85;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={StyleSheet.absoluteFill}
      preserveAspectRatio="none"
    >
      <Defs>
        <SvgLinearGradient id="habitat-sky-grad" x1="0" y1="0" x2="0" y2={height}>
          <Stop offset="0" stopColor="#BAE6FD" />
          <Stop offset="1" stopColor="#F0F9FF" />
        </SvgLinearGradient>
      </Defs>

      <Path d={`M0 0H${width}V${height}H0Z`} fill="url(#habitat-sky-grad)" />

      <Circle cx={width * 0.78} cy={height * 0.22} r={sunRadius} fill="#FEF08A" opacity={0.85} />
      <Ellipse cx={width * 0.16} cy={height * 0.16} rx={height * 0.07} ry={height * 0.035} fill="#FFFFFF" opacity={0.65} />
      <Ellipse cx={width * 0.21} cy={height * 0.14} rx={height * 0.09} ry={height * 0.045} fill="#FFFFFF" opacity={0.75} />
      <Ellipse cx={width * 0.55} cy={height * 0.12} rx={height * 0.08} ry={height * 0.04} fill="#FFFFFF" opacity={0.6} />

      <Path
        d={`M0 ${backHillTop} C${width * 0.2} ${height * 0.8} ${width * 0.3} ${height * 0.68} ${width * 0.5} ${height * 0.74} C${width * 0.7} ${height * 0.8} ${width * 0.85} ${height * 0.7} ${width} ${height * 0.76} V${height} H0Z`}
        fill="#BBF7D0"
      />

      <Path
        d={`M0 ${frontHillTop} C${width * 0.22} ${height * 0.78} ${width * 0.38} ${height * 0.92} ${width * 0.58} ${height * 0.86} C${width * 0.78} ${height * 0.8} ${width * 0.9} ${height * 0.9} ${width} ${height * 0.87} V${height} H0Z`}
        fill="#86EFAC"
      />
    </Svg>
  );
}

export default function HabitatBackground({ children, transparentDesktop = false }: Props) {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;

  if (desktop && transparentDesktop) {
    return (
      <View style={habitatBackgroundStyles.transparentContainer} pointerEvents="box-none">
        {children}
      </View>
    );
  }

  if (!desktop) {
    return (
      <FittedImageBackground
        source={BACKGROUND_IMAGE}
        aspectRatio={1080 / 1920}
        backgroundColor="#BAE6FD"
      >
        {children}
      </FittedImageBackground>
    );
  }

  return (
    <View style={habitatBackgroundStyles.container}>
      <DefaultDesktopLandscape />
      <View style={habitatBackgroundStyles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}
