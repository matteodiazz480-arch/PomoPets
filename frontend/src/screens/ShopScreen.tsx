import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import IconBubble from '../components/IconBubble';
import CoinIcon from '../components/CoinIcon';
import { useGame } from '../context/GameContext';
import { SHOP_FOODS } from '../data/food';
import { SHOP_BACKGROUNDS } from '../data/shop';
import { colors } from '../theme/colors';

type Category = 'backgrounds' | 'food';

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const width = useWindowDimensions().width;
  const desktop = width >= 900;
  const wide = width >= 1200;
  const { state, buyBackground, buyFood } = useGame();
  const [category, setCategory] = useState<Category>('backgrounds');

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
          <View style={styles.coinPill}>
            <CoinIcon size={22} style={styles.coinIconBubble} />
            <Text style={styles.coinValue}>{state.coins}</Text>
          </View>
        </View>

        <View style={styles.segmentWrap}>
          {(
            [
              { key: 'backgrounds', label: 'Fondos' },
              { key: 'food', label: 'Comida' },
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

        {category === 'backgrounds' ? (
          <>
            <Text style={styles.subtitle}>Personaliza el hábitat de tu mascota</Text>
            <View style={[styles.grid, desktop && styles.desktopGrid]}>
              {SHOP_BACKGROUNDS.map((item) => {
                const owned = state.ownedBackgrounds.includes(item.id);
                const active = state.activeBackground === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
                    style={[
                      styles.itemCard,
                      desktop && styles.desktopItemCard,
                      wide && styles.wideItemCard,
                      active && styles.itemCardActive,
                    ]}
                    onPress={() => {
                      if (active) return;
                      const wasOwned = owned;
                      const success = buyBackground(item.id, item.price);
                      if (!success) playSound('denied');
                      else if (!wasOwned && item.price > 0) playSound('coin');
                      else playSound('tap');
                    }}
                  >
                    <LinearGradient colors={item.colors} style={styles.itemPreview}>
                      <Text style={styles.itemIcon}>{item.icon}</Text>
                    </LinearGradient>
                    <Text style={styles.itemName}>{item.name}</Text>
                    {active ? (
                      <Text style={styles.activeLabel}>En uso</Text>
                    ) : owned ? (
                      <Text style={styles.ownedLabel}>Aplicar</Text>
                    ) : (
                      <View style={styles.priceRow}>
                        <CoinIcon size={18} style={styles.priceIconBubble} />
                        <Text style={styles.priceValue}>{item.price}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>Snacks y pociones para cuidar a tu mascota</Text>
            <View style={[styles.grid, desktop && styles.desktopGrid]}>
              {SHOP_FOODS.map((item) => {
                const owned = state.inventory[item.id] ?? 0;
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.85}
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
                      <Text style={styles.itemIcon}>{item.icon}</Text>
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
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
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
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 20,
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
    fontWeight: '500',
    marginTop: 6,
    marginBottom: 20,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#F2E4D5',
    borderRadius: 18,
    padding: 5,
    marginTop: 18,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  segmentItem: {
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryDeep,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 2,
  },
  segmentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentLabelActive: {
    color: colors.white,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  desktopGrid: {
    gap: 16,
  },
  itemCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 4,
    borderBottomColor: '#E6D5BF',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  desktopItemCard: {
    width: '47%',
    padding: 18,
    borderRadius: 26,
  },
  wideItemCard: {
    width: '31.5%',
  },
  itemCardActive: {
    borderColor: colors.primaryDark,
    borderBottomColor: colors.primaryDeep,
  },
  itemPreview: {
    width: '100%',
    height: 96,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  itemIcon: {
    fontSize: 30,
  },
  itemName: {
    fontWeight: '700',
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceIconBubble: { marginRight: 4 },
  priceValue: { fontWeight: '700', color: colors.coinDark, fontSize: 13 },
  ownedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.secondaryDark,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  foodPreview: {
    width: '100%',
    height: 96,
    borderRadius: 16,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  ownedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  ownedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
  },
  itemDescription: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  foodStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  foodStat: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
