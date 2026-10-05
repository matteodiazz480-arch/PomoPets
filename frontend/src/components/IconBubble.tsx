import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  icon: string;
  size?: number;
  background?: string;
  borderColor?: string;
  fontSize?: number;
  style?: ViewStyle;
};

// A small circular "badge" behind an emoji — the one consistent presentation
// every icon in the app gets, so a plain system emoji reads as part of one
// deliberate, illustrated icon set instead of loose floating glyphs.
export default function IconBubble({
  icon,
  size = 28,
  background = colors.cardAlt,
  borderColor = colors.border,
  fontSize,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: background,
          borderColor,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: fontSize ?? size * 0.52 }}>{icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
});
