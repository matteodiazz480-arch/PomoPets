import React from 'react';
import { Image, StyleSheet, View, useWindowDimensions, type ImageSourcePropType } from 'react-native';

type Props = {
  source: ImageSourcePropType;
  aspectRatio: number;
  backgroundColor: string;
  children: React.ReactNode;
};

export default function FittedImageBackground({ source, aspectRatio, backgroundColor, children }: Props) {
  const { width, height } = useWindowDimensions();
  const imageWidth = Math.min(width, height * aspectRatio);
  const imageHeight = imageWidth / aspectRatio;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Image
        source={source}
        resizeMode="stretch"
        style={[
          styles.image,
          {
            width: imageWidth,
            height: imageHeight,
            left: (width - imageWidth) / 2,
            top: (height - imageHeight) / 2,
          },
        ]}
      />
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
  },
  content: {
    ...StyleSheet.absoluteFill,
  },
});
