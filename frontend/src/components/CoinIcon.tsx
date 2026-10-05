import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  size?: number;
  style?: ViewStyle;
};

export default function CoinIcon({ size = 24, style }: Props) {
  return (
    <View
      accessible
      accessibilityLabel="Moneda"
      style={[
        styles.coin,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: Math.max(1, size * 0.08),
        },
        style,
      ]}
    >
      <View style={[styles.inset, { left: size * 0.18, right: size * 0.18, top: size * 0.18, bottom: size * 0.18 }]}>
        <Text style={[styles.mark, { fontSize: size * 0.48, lineHeight: size * 0.62 }]}>P</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  coin: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coin,
    borderColor: colors.coinDeep,
  },
  inset: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.coinDark,
    borderRadius: 20,
  },
  mark: {
    color: colors.coinDeep,
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
