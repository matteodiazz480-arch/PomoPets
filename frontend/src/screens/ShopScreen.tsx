import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound } from '../audio/sounds';
import { AccessoryPreview } from '../components/AccessoryOverlay';
import CoinIcon from '../components/CoinIcon';
import CoinStoreModal from '../components/CoinStoreModal';
import { useGame } from '../context/GameContext';
import { ACCESSORIES, type AccessoryCategory } from '../data/accessories';
import { SHOP_FOODS } from '../data/food';
import { colors, shopScreenStyles } from '../style';

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
    <View style={shopScreenStyles.root}>
      <ScrollView
        contentContainerStyle={[
          shopScreenStyles.scroll,
          desktop && shopScreenStyles.desktopScroll,
          { paddingTop: insets.top + 20, paddingBottom: desktop ? 40 : insets.bottom + 110 },
        ]}
      >
        <View style={shopScreenStyles.header}>
          <Text style={shopScreenStyles.title}>Tienda</Text>
          <TouchableOpacity
            style={shopScreenStyles.coinPill}
            activeOpacity={0.8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              playSound('tap');
              setCoinStoreVisible(true);
            }}
          >
            <CoinIcon size={22} style={shopScreenStyles.coinIconBubble} />
            <Text style={shopScreenStyles.coinValue}>{state.coins}</Text>
            <Ionicons name="add-circle" size={16} color={colors.primary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <View style={shopScreenStyles.segmentWrap}>
          {(
            [
              { key: 'food', label: '🍎 Comida' },
              { key: 'accessories', label: '✨ Accesorios' },
            ] as const
          ).map((seg) => {
            const active = category === seg.key;
            return (
              <TouchableOpacity
                key={seg.key}
                activeOpacity={0.8}
                style={[shopScreenStyles.segmentItem, active && shopScreenStyles.segmentItemActive]}
                onPress={() => {
                  if (active) return;
                  playSound('tap');
                  setCategory(seg.key);
                }}
              >
                <Text style={[shopScreenStyles.segmentLabel, active && shopScreenStyles.segmentLabelActive]}>
                  {seg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {category === 'food' && (
          <>
            <Text style={shopScreenStyles.subtitle}>Snacks y pociones para cuidar a tu mascota</Text>
            <View style={[shopScreenStyles.grid, desktop && shopScreenStyles.desktopGrid]}>
              {SHOP_FOODS.map((item) => {
                const owned = state.inventory[item.id] ?? 0;
                return (
                  <ShopItemCard
                    key={item.id}
                    style={[
                      shopScreenStyles.itemCard,
                      desktop && shopScreenStyles.desktopItemCard,
                      wide && shopScreenStyles.wideItemCard,
                    ]}
                    onPress={() => {
                      const success = buyFood(item.id, item.price);
                      if (!success) playSound('denied');
                      else playSound('coin');
                    }}
                  >
                    <View style={shopScreenStyles.foodPreview}>
                      <Text style={shopScreenStyles.itemEmoji}>{item.icon}</Text>
                      {owned > 0 && (
                        <View style={shopScreenStyles.ownedBadge}>
                          <Text style={shopScreenStyles.ownedBadgeText}>{owned}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={shopScreenStyles.itemName}>{item.name}</Text>
                    <Text style={shopScreenStyles.itemDescription}>{item.description}</Text>
                    <View style={shopScreenStyles.foodStatsRow}>
                      <Text style={shopScreenStyles.foodStat}>🍗 +{item.hunger}</Text>
                      <Text style={shopScreenStyles.foodStat}>💛 +{item.happiness}</Text>
                    </View>
                    <View style={shopScreenStyles.priceRow}>
                      <CoinIcon size={18} style={shopScreenStyles.priceIconBubble} />
                      <Text style={shopScreenStyles.priceValue}>{item.price}</Text>
                    </View>
                  </ShopItemCard>
                );
              })}
            </View>
          </>
        )}

        {category === 'accessories' && (
          <>
            <Text style={shopScreenStyles.subtitle}>Toca un accesorio para equiparlo a tu mascota</Text>
            <View style={[shopScreenStyles.grid, desktop && shopScreenStyles.desktopGrid]}>
              {ACCESSORIES.map((item) => {
                const owned = (state.ownedAccessories ?? []).includes(item.id);
                const isEquipped = state.equippedAccessories?.[item.category] === item.id;
                return (
                  <ShopItemCard
                    key={item.id}
                    style={[
                      shopScreenStyles.itemCard,
                      desktop && shopScreenStyles.desktopItemCard,
                      wide && shopScreenStyles.wideItemCard,
                      isEquipped && shopScreenStyles.itemCardActive,
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
                    <View style={shopScreenStyles.accessoryPreview}>
                      <AccessoryPreview id={item.id} size={58} />
                      <View style={shopScreenStyles.catPill}>
                        <Text style={shopScreenStyles.catPillText}>{CATEGORY_NAMES[item.category]}</Text>
                      </View>
                    </View>
                    <Text style={shopScreenStyles.itemName}>{item.name}</Text>
                    <Text style={shopScreenStyles.itemDescription}>{item.description}</Text>
                    {isEquipped ? (
                      <Text style={shopScreenStyles.activeLabel}>✓ Puesto</Text>
                    ) : owned ? (
                      <Text style={shopScreenStyles.ownedLabel}>Equipar</Text>
                    ) : (
                      <Text style={shopScreenStyles.freeLabel}>Gratis</Text>
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
