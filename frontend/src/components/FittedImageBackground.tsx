import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';
import { fittedImageBackgroundStyles } from '../style';

type Props = {
  source: ImageSourcePropType;
  aspectRatio: number;
  backgroundColor: string;
  children: React.ReactNode;
  coverOnDesktop?: boolean;
};

export default function FittedImageBackground({
  source,
  aspectRatio,
  backgroundColor,
  children,
  coverOnDesktop = false,
}: Props) {
  const window = useWindowDimensions();
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const width = frame.width || window.width;
  const height = frame.height || window.height;
  const desktop = window.width >= 900;
  const fullCover = desktop && coverOnDesktop;
  const imageWidth =
    desktop && !fullCover
      ? Math.min(width, height * aspectRatio)
      : Math.max(width, height * aspectRatio);
  const imageHeight = imageWidth / aspectRatio;

  return (
    <View
      style={[fittedImageBackgroundStyles.container, { backgroundColor }]}
      onLayout={({ nativeEvent }) => {
        const { width: nextWidth, height: nextHeight } = nativeEvent.layout;
        if (nextWidth !== frame.width || nextHeight !== frame.height) {
          setFrame({ width: nextWidth, height: nextHeight });
        }
      }}
    >
      <Image
        source={source}
        resizeMode="cover"
        style={[
          fittedImageBackgroundStyles.image,
          {
            width: imageWidth,
            height: imageHeight,
            left: desktop && !fullCover ? 0 : (width - imageWidth) / 2,
            top: desktop && !fullCover ? 0 : (height - imageHeight) / 2,
          },
        ]}
      />
      {desktop && !fullCover && (
        <LinearGradient
          colors={['transparent', backgroundColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            fittedImageBackgroundStyles.desktopFade,
            { left: Math.max(0, imageWidth - 120) },
          ]}
        />
      )}
      <View style={fittedImageBackgroundStyles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}
