import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import { colors } from '../theme/colors';

const PET_IMAGE = require('../../Pets/Pet1-1.png');

type Props = {
  onBypass: () => void;
};

export default function PcNotAvailableScreen({ onBypass }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.petWrap}>
          <Image source={PET_IMAGE} style={styles.petImage} resizeMode="contain" />
        </View>

        <View style={styles.badge}>
          <Ionicons name="phone-portrait-outline" size={16} color={colors.primaryDark} />
          <Text style={styles.badgeText}>Solo versión móvil</Text>
        </View>

        <Text style={styles.title}>Versión para PC no disponible</Text>
        <Text style={styles.subtitle}>
          PomoPets está diseñado y optimizado exclusivamente para celulares, pensado para acompañarte en tu escritorio mientras estudias con tu teléfono al lado.
        </Text>

        <View style={styles.tipsBox}>
          <View style={styles.tipRow}>
            <View style={styles.tipIconWrap}>
              <Ionicons name="qr-code-outline" size={18} color={colors.primaryDark} />
            </View>
            <View style={styles.tipTextWrap}>
              <Text style={styles.tipTitle}>Ábrelo en tu teléfono</Text>
              <Text style={styles.tipDesc}>Ingresa a la URL desde el navegador de tu celular.</Text>
            </View>
          </View>

          <View style={styles.tipDivider} />

          <View style={styles.tipRow}>
            <View style={styles.tipIconWrap}>
              <Ionicons name="hardware-chip-outline" size={18} color={colors.secondaryDark} />
            </View>
            <View style={styles.tipTextWrap}>
              <Text style={styles.tipTitle}>Modo de prueba (Dev)</Text>
              <Text style={styles.tipDesc}>Presiona F12 en tu teclado y activa el modo dispositivo móvil.</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionWrap}>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F7EFE6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.card,
    borderRadius: 32,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 6,
    borderBottomColor: '#E6D5BF',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 8,
  },
  petWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.cardAlt,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  petImage: {
    width: 250,
    height: 136,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFE9D6',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primaryDark,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  tipsBox: {
    width: '100%',
    backgroundColor: colors.cardAlt,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 24,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextWrap: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  tipDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  actionWrap: {
    width: '100%',
    alignItems: 'center',
  },
});
