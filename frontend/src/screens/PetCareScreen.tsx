import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import FoodChip from '../components/FoodChip';
import FittedImageBackground from '../components/FittedImageBackground';
import PetAvatar from '../components/PetAvatar';
import RenameModal from '../components/RenameModal';
import StatBar from '../components/StatBar';
import { AccessoryPreview } from '../components/AccessoryOverlay';
import { useGame } from '../context/GameContext';
import { SHOP_FOODS, type FoodId } from '../data/food';
import { getStageForLevel } from '../data/pets';
import { ACCESSORIES, getAccessoryById, type AccessoryId } from '../data/accessories';
import { colors } from '../theme/colors';

const ROOM_BACKGROUND = require('../../Pets/fondo1.jpg');
const SHEET_PADDING_H = 24;

type CareTab = 'feed' | 'wardrobe';

export default function PetCareScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const desktop = width >= 900;
  const petSize = desktop
    ? Math.min(420, height * 0.46, (width - 328) * 0.4)
    : Math.min(200, height * 0.26, width * 0.55);
  const statTrackWidth = desktop
    ? Math.max(120, Math.min(340, (width - 328) * 0.42 - 56))
    : Math.min(520, width) - SHEET_PADDING_H * 2;

  const {
    state,
    level,
    feedPet,
    equipAccessory,
    unequipAccessory,
    setPetName,
  } = useGame();

  const [activeTab, setActiveTab] = useState<CareTab>('feed');
  const [feedSignal, setFeedSignal] = useState(0);
  const [renameVisible, setRenameVisible] = useState(false);

  const stage = getStageForLevel(level);
  const displayName = state.petName ?? stage.name;
  const ownedFoods = SHOP_FOODS.filter((f) => (state.inventory[f.id] ?? 0) > 0);
  const ownedAccessoriesList = ACCESSORIES;

  const handleFeed = (id: FoodId) => {
    const fed = feedPet(id);
    if (fed) setFeedSignal((s) => s + 1);
  };

  const toggleAccessory = (accId: AccessoryId) => {
    const acc = getAccessoryById(accId);
    if (!acc) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const isEquipped = state.equippedAccessories?.[acc.category] === accId;
    if (isEquipped) {
      unequipAccessory(acc.category);
    } else {
      equipAccessory(accId);
    }
  };

  return (
    <FittedImageBackground
      source={ROOM_BACKGROUND}
      aspectRatio={1536 / 2752}
      backgroundColor={colors.appBg}
      coverOnDesktop={desktop}
    >
      <View style={[styles.content, desktop && styles.desktopContent]}>
        <View style={[styles.header, desktop && styles.desktopHeader, { paddingTop: insets.top + 14 }]}>
          <Text style={[styles.headerTitle, desktop && styles.desktopHeaderTitle]}>Mi Mascota</Text>
        </View>

        <View style={[styles.desktopLayout, desktop && styles.desktopLayoutWide]}>
          <View style={[styles.stageArea, desktop ? styles.desktopStageAreaShift : styles.mobileStageAreaShift]}>
            <PetAvatar
              eyesOpen={stage.eyesOpen}
              eyesClosed={stage.eyesClosed}
              size={petSize}
              feedSignal={feedSignal}
              equipped={state.equippedAccessories}
            />
            <TouchableOpacity style={styles.nameBadge} activeOpacity={0.7} onPress={() => setRenameVisible(true)}>
              <Text style={styles.petName}>{displayName}</Text>
              <Ionicons name="pencil" size={12} color={colors.textSecondary} style={styles.petNameIcon} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.sheet,
              desktop && styles.desktopSheet,
              { paddingBottom: desktop ? 24 : insets.bottom + 92 },
            ]}
          >
            {!desktop && <View style={styles.sheetHandle} />}

            {/* Vital Stats: Hunger & Happiness */}
            <View style={styles.statsRow}>
              <StatBar
                icon="🍗"
                label="Hambre"
                value={state.hunger}
                fillColor={colors.hunger}
                trackWidth={statTrackWidth}
              />
              <StatBar
                icon="💛"
                label="Felicidad"
                value={state.happiness}
                fillColor={colors.happiness}
                trackWidth={statTrackWidth}
              />
            </View>

            {/* Mode Tabs: Feed & Wardrobe */}
            <View style={styles.tabBar}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setActiveTab('feed');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                }}
                style={[styles.tabButton, activeTab === 'feed' && styles.tabButtonActive]}
              >
                <Ionicons
                  name="fast-food-outline"
                  size={16}
                  color={activeTab === 'feed' ? colors.primaryDark : '#64748B'}
                />
                <Text style={[styles.tabText, activeTab === 'feed' && styles.tabTextActive]}>
                  Comida
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setActiveTab('wardrobe');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                }}
                style={[styles.tabButton, activeTab === 'wardrobe' && styles.tabButtonActive]}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={16}
                  color={activeTab === 'wardrobe' ? colors.primaryDark : '#64748B'}
                />
                <Text style={[styles.tabText, activeTab === 'wardrobe' && styles.tabTextActive]}>
                  Ropero
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab 1: Food Section */}
            {activeTab === 'feed' && (
              <View style={styles.tabContent}>
                {ownedFoods.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="basket-outline" size={32} color={colors.textSecondary} style={{ marginBottom: 6 }} />
                    <Text style={[styles.foodEmpty, desktop && styles.desktopFoodEmpty]}>
                      No tienes comida en tu inventario. Visita la Tienda para comprar ricos snacks.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.foodChipsRow}>
                    {ownedFoods.map((food) => (
                      <FoodChip
                        key={food.id}
                        icon={food.icon}
                        count={state.inventory[food.id] ?? 0}
                        onFeed={() => handleFeed(food.id)}
                      />
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Tab 2: Wardrobe (Accessories) Section */}
            {activeTab === 'wardrobe' && (
              <View style={styles.tabContent}>
                <ScrollView
                  horizontal={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.wardrobeContainer}
                >
                  <Text style={styles.wardrobeSubtitle}>
                    Toca un accesorio para ponérselo o quitárselo a tu mascota:
                  </Text>
                  <View style={styles.accessoriesGrid}>
                    {ownedAccessoriesList.map((acc) => {
                      const isEquipped = state.equippedAccessories?.[acc.category] === acc.id;
                      return (
                        <TouchableOpacity
                          key={acc.id}
                          activeOpacity={0.75}
                          onPress={() => toggleAccessory(acc.id)}
                          style={[
                            styles.accCard,
                            isEquipped && styles.accCardEquipped,
                          ]}
                        >
                          <View style={styles.accPreviewBox}>
                            <AccessoryPreview id={acc.id} size={46} />
                          </View>
                          <Text style={styles.accName} numberOfLines={1}>
                            {acc.name}
                          </Text>
                          <View
                            style={[
                              styles.accBadge,
                              isEquipped ? styles.accBadgeEquipped : styles.accBadgeUnequipped,
                            ]}
                          >
                            <Text
                              style={[
                                styles.accBadgeText,
                                isEquipped && styles.accBadgeTextEquipped,
                              ]}
                            >
                              {isEquipped ? '✓ Puesto' : 'Poner'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </View>

      <RenameModal
        visible={renameVisible}
        initialName={displayName}
        onSave={setPetName}
        onClose={() => setRenameVisible(false)}
      />
    </FittedImageBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  desktopContent: {
    width: '100%',
    maxWidth: 1480,
    alignSelf: 'center',
    paddingHorizontal: 48,
    paddingBottom: 32,
  },
  desktopHeader: {
    alignItems: 'flex-start',
    paddingBottom: 0,
    marginBottom: 10,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  headerTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 20,
    letterSpacing: -0.2,
    color: colors.textPrimary,
  },
  desktopHeaderTitle: {
    fontSize: 28,
  },
  stageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileStageAreaShift: {},
  desktopStageAreaShift: {},
  desktopLayout: {
    flex: 1,
  },
  desktopLayoutWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 36,
  },
  nameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryDeep,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 3,
  },
  petName: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: colors.textPrimary,
  },
  petNameIcon: {
    marginLeft: 6,
  },
  sheet: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: SHEET_PADDING_H,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 0,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  desktopSheet: {
    width: 530,
    maxWidth: '50%',
    paddingTop: 24,
    paddingHorizontal: 32,
    borderRadius: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignSelf: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  statsRow: {
    gap: 10,
    marginBottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    padding: 4,
    gap: 4,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 14,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: '#64748B',
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  tabContent: {
    minHeight: 140,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  foodEmpty: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  desktopFoodEmpty: {
    fontSize: 14,
  },
  foodChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 6,
  },
  wardrobeContainer: {
    paddingVertical: 4,
  },
  wardrobeSubtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  accessoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  accCard: {
    width: '30.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  accCardEquipped: {
    borderColor: colors.primary,
    backgroundColor: '#FFFBEB',
  },
  accPreviewBox: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  accName: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  accBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  accBadgeEquipped: {
    backgroundColor: colors.primary,
  },
  accBadgeUnequipped: {
    backgroundColor: '#E2E8F0',
  },
  accBadgeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    color: '#64748B',
  },
  accBadgeTextEquipped: {
    color: '#FFFFFF',
  },
});
