import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccessoryPreview } from '../components/AccessoryOverlay';
import FittedImageBackground from '../components/FittedImageBackground';
import FoodChip from '../components/FoodChip';
import PetAvatar from '../components/PetAvatar';
import RenameModal from '../components/RenameModal';
import StatBar from '../components/StatBar';
import { useGame } from '../context/GameContext';
import { ACCESSORIES, getAccessoryById, type AccessoryId } from '../data/accessories';
import { SHOP_FOODS, type FoodId } from '../data/food';
import { getStageForLevel } from '../data/pets';
import { colors, petCareScreenStyles } from '../style';

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
      <View style={[petCareScreenStyles.content, desktop && petCareScreenStyles.desktopContent]}>
        <View style={[petCareScreenStyles.header, desktop && petCareScreenStyles.desktopHeader, { paddingTop: insets.top + 14 }]}>
          <Text style={[petCareScreenStyles.headerTitle, desktop && petCareScreenStyles.desktopHeaderTitle]}>Mi Mascota</Text>
        </View>

        <View style={[petCareScreenStyles.desktopLayout, desktop && petCareScreenStyles.desktopLayoutWide]}>
          <View style={[petCareScreenStyles.stageArea, desktop ? petCareScreenStyles.desktopStageAreaShift : petCareScreenStyles.mobileStageAreaShift]}>
            <PetAvatar
              eyesOpen={stage.eyesOpen}
              eyesClosed={stage.eyesClosed}
              size={petSize}
              feedSignal={feedSignal}
              equipped={state.equippedAccessories}
            />
            <TouchableOpacity style={petCareScreenStyles.nameBadge} activeOpacity={0.7} onPress={() => setRenameVisible(true)}>
              <Text style={petCareScreenStyles.petName}>{displayName}</Text>
              <Ionicons name="pencil" size={12} color={colors.textSecondary} style={petCareScreenStyles.petNameIcon} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              petCareScreenStyles.sheet,
              desktop && petCareScreenStyles.desktopSheet,
              { paddingBottom: desktop ? 24 : insets.bottom + 92 },
            ]}
          >
            {!desktop && <View style={petCareScreenStyles.sheetHandle} />}

            <View style={petCareScreenStyles.statsRow}>
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

            <View style={petCareScreenStyles.tabBar}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setActiveTab('feed');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                }}
                style={[petCareScreenStyles.tabButton, activeTab === 'feed' && petCareScreenStyles.tabButtonActive]}
              >
                <Ionicons
                  name="fast-food-outline"
                  size={16}
                  color={activeTab === 'feed' ? colors.primaryDark : '#64748B'}
                />
                <Text style={[petCareScreenStyles.tabText, activeTab === 'feed' && petCareScreenStyles.tabTextActive]}>
                  Comida
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setActiveTab('wardrobe');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                }}
                style={[petCareScreenStyles.tabButton, activeTab === 'wardrobe' && petCareScreenStyles.tabButtonActive]}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={16}
                  color={activeTab === 'wardrobe' ? colors.primaryDark : '#64748B'}
                />
                <Text style={[petCareScreenStyles.tabText, activeTab === 'wardrobe' && petCareScreenStyles.tabTextActive]}>
                  Ropero
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'feed' && (
              <View style={petCareScreenStyles.tabContent}>
                {ownedFoods.length === 0 ? (
                  <View style={petCareScreenStyles.emptyContainer}>
                    <Ionicons name="basket-outline" size={32} color={colors.textSecondary} style={{ marginBottom: 6 }} />
                    <Text style={[petCareScreenStyles.foodEmpty, desktop && petCareScreenStyles.desktopFoodEmpty]}>
                      No tienes comida en tu inventario. Visita la Tienda para comprar ricos snacks.
                    </Text>
                  </View>
                ) : (
                  <View style={petCareScreenStyles.foodChipsRow}>
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

            {activeTab === 'wardrobe' && (
              <View style={petCareScreenStyles.tabContent}>
                <ScrollView
                  horizontal={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={petCareScreenStyles.wardrobeContainer}
                >
                  <Text style={petCareScreenStyles.wardrobeSubtitle}>
                    Toca un accesorio para ponérselo o quitárselo a tu mascota:
                  </Text>
                  <View style={petCareScreenStyles.accessoriesGrid}>
                    {ownedAccessoriesList.map((acc) => {
                      const isEquipped = state.equippedAccessories?.[acc.category] === acc.id;
                      return (
                        <TouchableOpacity
                          key={acc.id}
                          activeOpacity={0.75}
                          onPress={() => toggleAccessory(acc.id)}
                          style={[
                            petCareScreenStyles.accCard,
                            isEquipped && petCareScreenStyles.accCardEquipped,
                          ]}
                        >
                          <View style={petCareScreenStyles.accPreviewBox}>
                            <AccessoryPreview id={acc.id} size={46} />
                          </View>
                          <Text style={petCareScreenStyles.accName} numberOfLines={1}>
                            {acc.name}
                          </Text>
                          <View
                            style={[
                              petCareScreenStyles.accBadge,
                              isEquipped ? petCareScreenStyles.accBadgeEquipped : petCareScreenStyles.accBadgeUnequipped,
                            ]}
                          >
                            <Text
                              style={[
                                petCareScreenStyles.accBadgeText,
                                isEquipped && petCareScreenStyles.accBadgeTextEquipped,
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
