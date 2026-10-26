import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import { AccessoryPreview } from '../components/AccessoryOverlay';
import CoinIcon from '../components/CoinIcon';
import CoinStoreModal from '../components/CoinStoreModal';
import { useGame } from '../context/GameContext';
import { SHOP_FOODS } from '../data/food';
import { ACCESSORIES, type AccessoryCategory } from '../data/accessories';
import { colors } from '../theme/colors';

type Category = 'food' | 'accessories';

const CATEGORY_NAMES: Record<AccessoryCategory, string> = {
  head: 'Cabeza',
  face: 'Rostro',
  neck: 'Cuello',
};

function ShopItemCard({
  style,
  onPress,
  children,
}: {
  style?: any;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    Animated.spring(scale, { toValue: 0.94, friction: 8, tension: 240, useNativeDriver: true }).start();
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
      style={style}
    >
      <Animated.View style={[{ width: '100%', alignItems: 'center' }, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const width = useWindowDimensions().width;
  const desktop = width >= 900;
  const wide = width >= 1200;
  const {
    state,
    buyFood,
    buyAccessory,
    equipAccessory,
    unequipAccessory,
  } = useGame();
  const [category, setCategory] = useState<Category>('food');
  const [coinStoreVisible, setCoinStoreVisible] = useState(false);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          desktop && styles.desktopScroll,
          { paddingTop: insets.top + 20, paddingBottom: desktop ? 40 : insets.bottom + 110 },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Tienda</Text>
          <TouchableOpacity
            style={styles.coinPill}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              playSound('tap');
              setCoinStoreVisible(true);
            }}
          >
            <CoinIcon size={22} style={styles.coinIconBubble} />
            <Text style={styles.coinValue}>{state.coins}</Text>
            <Ionicons name="add-circle" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.segmentWrap}>
          {(
            [
              { key: 'food', label: '🍎 Comida' },
              { key: 'accessories', label: ' Accesorios' },
            ] as const
          ).map((seg) => {
            const active = category === seg.key;
            return (
              <TouchableOpacity
                key={seg.key}
                activeOpacity={0.8}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
                onPress={() => {
                  if (active) return;
                  playSound('tap');
                  setCategory(seg.key);
                }}
              >
                <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>{seg.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {category === 'food' && (
          <>
            <Text style={styles.subtitle}>Snacks y pociones para cuidar a tu mascota</Text>
            <View style={[styles.grid, desktop && styles.desktopGrid]}>
              {SHOP_FOODS.map((item) => {
                const owned = state.inventory[item.id] ?? 0;
                return (
                  <ShopItemCard
                    key={item.id}
                    style={[
                      styles.itemCard,
                      desktop && styles.desktopItemCard,
                      wide && styles.wideItemCard,
                    ]}
                    onPress={() => {
                      const success = buyFood(item.id, item.price);
                      if (!success) playSound('denied');
                      else playSound('coin');
                    }}
                  >
                    <View style={styles.foodPreview}>
                      <Text style={styles.itemEmoji}>{item.icon}</Text>
                      {owned > 0 && (
                        <View style={styles.ownedBadge}>
                          <Text style={styles.ownedBadgeText}>{owned}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                    <View style={styles.foodStatsRow}>
                      <Text style={styles.foodStat}>🍗 +{item.hunger}</Text>
                      <Text style={styles.foodStat}>💛 +{item.happiness}</Text>
                    </View>
                    <View style={styles.priceRow}>
                      <CoinIcon size={18} style={styles.priceIconBubble} />
                      <Text style={styles.priceValue}>{item.price}</Text>
                    </View>
                  </ShopItemCard>
                );
              })}
            </View>
          </>
        )}

        {category === 'accessories' && (
          <>
            <Text style={styles.subtitle}>Toca un accesorio para equiparlo a tu mascota</Text>
            <View style={[styles.grid, desktop && styles.desktopGrid]}>
              {ACCESSORIES.map((item) => {
                const owned = (state.ownedAccessories ?? []).includes(item.id);
                const isEquipped = state.equippedAccessories?.[item.category] === item.id;
                return (
                  <ShopItemCard
                    key={item.id}
                    style={[
                      styles.itemCard,
                      desktop && styles.desktopItemCard,
                      wide && styles.wideItemCard,
                      isEquipped && styles.itemCardActive,
                    ]}
                    onPress={() => {
                      if (isEquipped) {
                        unequipAccessory(item.category);
                      } else if (owned) {
                        equipAccessory(item.id);
                      } else {
                        const success = buyAccessory(item.id, item.price);
                        if (!success) playSound('denied');
                        else playSound('coin');
                      }
                    }}
                  >
                    <View style={styles.accessoryPreview}>
                      <AccessoryPreview id={item.id} size={58} />
                      <View style={styles.catPill}>
                        <Text style={styles.catPillText}>{CATEGORY_NAMES[item.category]}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemDescription}>{item.description}</Text>
                    {isEquipped ? (
                      <Text style={styles.activeLabel}>✓ Puesto</Text>
                    ) : owned ? (
                      <Text style={styles.ownedLabel}>Equipar</Text>
                    ) : (
                      <Text style={styles.freeLabel}>Gratis</Text>
                    )}
                  </ShopItemCard>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
      <CoinStoreModal visible={coinStoreVisible} onClose={() => setCoinStoreVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  scroll: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  desktopScroll: {
    maxWidth: 1220,
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
    color: colors.textPrimary,
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.65,
    shadowRadius: 8,
    elevation: 2,
  },
  coinIconBubble: { marginRight: 6 },
  coinValue: { fontWeight: '700', color: colors.textPrimary },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 6,
    marginBottom: 14,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 4,
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 1,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: colors.primary,
  },
  segmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentLabelActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  avatarPreviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  avatarPreviewInfo: {
    flex: 1,
  },
  avatarPreviewTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  avatarPreviewSub: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  desktopGrid: {
    gap: 18,
  },
  itemCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 12,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 3,
  },
  desktopItemCard: {
    width: '31%',
  },
  wideItemCard: {
    width: '23.4%',
  },
  itemCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#FFFBEB',
  },
  foodPreview: {
    width: '100%',
    aspectRatio: 1.25,
    borderRadius: 14,
    backgroundColor: colors.hungerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  accessoryPreview: {
    width: '100%',
    aspectRatio: 1.25,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  catPill: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  catPillText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 9,
    color: '#78350F',
  },
  itemEmoji: {
    fontSize: 40,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  itemDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 8,
  },
  foodStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  foodStat: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceIconBubble: {},
  priceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  freeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.success,
  },
  ownedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  ownedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ownedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
