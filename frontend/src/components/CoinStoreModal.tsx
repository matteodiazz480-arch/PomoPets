import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { playSound } from '../audio/sounds';
import { COIN_PACKS, type CoinPack } from '../data/coinPacks';
import { colors } from '../theme/colors';
import IconBubble from './IconBubble';
import CoinIcon from './CoinIcon';

type Props = {
  visible: boolean;
  onClose: () => void;
};

// Purchases aren't wired to a real payment processor yet (that needs a native
// IAP module + store-side product setup), so tapping a pack is a clear,
// honest "coming soon" rather than silently granting free coins.
function handlePackPress(pack: CoinPack) {
  playSound('tap');
  Alert.alert(
    'Próximamente',
    `Los pagos dentro de la app aún no están disponibles. Pronto podrás comprar el pack de ${pack.coins + pack.bonusCoins} monedas por ${pack.priceLabel}.`
  );
}

export default function CoinStoreModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.8}
            onPress={() => {
              playSound('tap');
              onClose();
            }}
          >
            <View style={styles.closeButtonHighlight} pointerEvents="none" />
            <Ionicons name="close" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Monedas</Text>
          <Text style={styles.subtitle}>Consigue monedas extra para tu mascota</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {COIN_PACKS.map((pack) => (
              <TouchableOpacity
                key={pack.id}
                activeOpacity={0.85}
                style={[styles.packCard, pack.highlight && styles.packCardHighlight]}
                onPress={() => handlePackPress(pack)}
              >
                {pack.highlight && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{pack.highlight}</Text>
                  </View>
                )}
                {pack.id === 'starter' ? (
                  <CoinIcon size={46} style={styles.packIconBubble} />
                ) : (
                  <IconBubble icon={pack.icon} size={46} fontSize={24} style={styles.packIconBubble} />
                )}
                <View style={styles.packInfo}>
                  <View style={styles.packCoinsRow}>
                    <CoinIcon size={16} />
                    <Text style={styles.packCoins}>{(pack.coins + pack.bonusCoins).toLocaleString('es')}</Text>
                  </View>
                  {pack.bonusCoins > 0 && (
                    <Text style={styles.packBonus}>
                      {pack.coins.toLocaleString('es')} + {pack.bonusCoins} de regalo
                    </Text>
                  )}
                </View>
                <View style={styles.buyButton}>
                  <View style={styles.buyButtonHighlight} pointerEvents="none" />
                  <Text style={styles.buyButtonText}>{pack.priceLabel}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.disclaimer}>Los pagos dentro de la app estarán disponibles próximamente.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.appBg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingTop: 10,
    paddingHorizontal: 22,
    paddingBottom: 26,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.border,
    overflow: 'hidden',
    zIndex: 1,
  },
  closeButtonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '46%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 18,
  },
  list: {
    gap: 12,
    paddingBottom: 6,
  },
  packCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  packCardHighlight: {
    borderColor: colors.coin,
  },
  badge: {
    position: 'absolute',
    top: -9,
    left: 14,
    backgroundColor: colors.coin,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  packIconBubble: {
    marginRight: 12,
  },
  packInfo: {
    flex: 1,
  },
  packCoins: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  packCoinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  packBonus: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.coinDark,
    marginTop: 2,
  },
  buyButton: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryDeep,
    overflow: 'hidden',
  },
  buyButtonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '46%',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
  },
  buyButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  disclaimer: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
});
