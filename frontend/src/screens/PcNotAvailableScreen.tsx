import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { colors, pcNotAvailableScreenStyles } from '../style';

const PET_IMAGE = require('../../Pets/Pet1-1.png');

type Props = {
  onBypass: () => void;
};

export default function PcNotAvailableScreen({ onBypass }: Props) {
  return (
    <View style={pcNotAvailableScreenStyles.root}>
      <View style={pcNotAvailableScreenStyles.card}>
        <View style={pcNotAvailableScreenStyles.petWrap}>
          <Image source={PET_IMAGE} style={pcNotAvailableScreenStyles.petImage} resizeMode="contain" />
        </View>

        <View style={pcNotAvailableScreenStyles.badge}>
          <Ionicons name="phone-portrait-outline" size={16} color={colors.primaryDark} />
          <Text style={pcNotAvailableScreenStyles.badgeText}>Solo versión móvil</Text>
        </View>

        <Text style={pcNotAvailableScreenStyles.title}>Versión para PC no disponible</Text>
        <Text style={pcNotAvailableScreenStyles.subtitle}>
          PomoPets está diseñado y optimizado exclusivamente para celulares, pensado para acompañarte en tu escritorio mientras estudias con tu teléfono al lado.
        </Text>

        <View style={pcNotAvailableScreenStyles.tipsBox}>
          <View style={pcNotAvailableScreenStyles.tipRow}>
            <View style={pcNotAvailableScreenStyles.tipIconWrap}>
              <Ionicons name="qr-code-outline" size={18} color={colors.primaryDark} />
            </View>
            <View style={pcNotAvailableScreenStyles.tipTextWrap}>
              <Text style={pcNotAvailableScreenStyles.tipTitle}>Ábrelo en tu teléfono</Text>
              <Text style={pcNotAvailableScreenStyles.tipDesc}>Ingresa a la URL desde el navegador de tu celular.</Text>
            </View>
          </View>

          <View style={pcNotAvailableScreenStyles.tipDivider} />

          <View style={pcNotAvailableScreenStyles.tipRow}>
            <View style={pcNotAvailableScreenStyles.tipIconWrap}>
              <Ionicons name="hardware-chip-outline" size={18} color={colors.secondaryDark} />
            </View>
            <View style={pcNotAvailableScreenStyles.tipTextWrap}>
              <Text style={pcNotAvailableScreenStyles.tipTitle}>Modo de prueba (Dev)</Text>
              <Text style={pcNotAvailableScreenStyles.tipDesc}>Presiona F12 en tu teclado y activa el modo dispositivo móvil.</Text>
            </View>
          </View>
        </View>

        <View style={pcNotAvailableScreenStyles.actionWrap}>
          <PrimaryButton
            label="Probar de todos modos"
            iconName="arrow-forward"
            onPress={onBypass}
          />
        </View>
      </View>
    </View>
  );
}
