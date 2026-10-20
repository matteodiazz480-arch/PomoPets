import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { playSound } from '../audio/sounds';
import { COIN_PACKS, type CoinPack } from '../data/coinPacks';
import { colors } from '../theme/colors';
import IconBubble from './IconBubble';
import CoinIcon from './CoinIcon';
import PrimaryButton from './PrimaryButton';

type Props = {
  visible: boolean;
  onClose: () => void;
};

function CoinPackCard({
  pack,
  onPress,
}: {
  pack: CoinPack;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    Animated.spring(scale, { toValue: 0.95, friction: 8, tension: 240, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View
        style={[
          styles.packCard,
          pack.highlight && styles.packCardHighlight,
          { transform: [{ scale }] },
        ]}
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
      </Animated.View>
    </TouchableOpacity>
  );
}

function handlePackPress(pack: CoinPack) {
  playSound('tap');
  Alert.alert(
    'Próximamente',
    `Los pagos dentro de la app aún no están disponibles. Pronto podrás comprar el pack de ${pack.coins + pack.bonusCoins} monedas por ${pack.priceLabel}.`
  );
}

export default function CoinStoreModal({ visible, onClose }: Props) {
  const closeScale = useRef(new Animated.Value(1)).current;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdropTouch} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          <View style={styles.handle} />
          <TouchableOpacity
            style={styles.closeButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.85}
            onPressIn={() => {
              Animated.spring(closeScale, { toValue: 0.88, friction: 8, tension: 240, useNativeDriver: true }).start();
            }}
            onPressOut={() => {
              Animated.spring(closeScale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }).start();
            }}
            onPress={() => {
              playSound('tap');
              onClose();
            }}
          >
            <Animated.View style={[styles.closeButtonInner, { transform: [{ scale: closeScale }] }]}>
              <View style={styles.closeButtonHighlight} pointerEvents="none" />
              <Ionicons name="close" size={18} color={colors.textPrimary} />
            </Animated.View>
          </TouchableOpacity>
          <Text style={styles.title}>Monedas</Text>
          <Text style={styles.subtitle}>Consigue monedas extra para tu mascota</Text>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
            {COIN_PACKS.map((pack) => (
              <CoinPackCard key={pack.id} pack={pack} onPress={() => handlePackPress(pack)} />
            ))}
          </ScrollView>

          <View style={styles.footerWrap}>
            <PrimaryButton label="Cerrar" variant="secondary" onPress={onClose} sound="tap" />
          </View>

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
  backdropTouch: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: colors.appBg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 2,
    borderColor: colors.border,
    paddingTop: 10,
    paddingHorizontal: 22,
    paddingBottom: 22,
    maxHeight: '84%',
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
    top: 14,
    right: 18,
    zIndex: 20,
  },
  closeButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: '#E6D5BF',
    overflow: 'hidden',
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
  footerWrap: {
    marginTop: 14,
    marginBottom: 6,
    alignItems: 'center',
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
