import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FoodChip from '../components/FoodChip';
import FittedImageBackground from '../components/FittedImageBackground';
import PetAvatar from '../components/PetAvatar';
import RenameModal from '../components/RenameModal';
import StatBar from '../components/StatBar';
import { useGame } from '../context/GameContext';
import { SHOP_FOODS, type FoodId } from '../data/food';
import { getStageForLevel } from '../data/pets';
import { colors } from '../theme/colors';

// The cozy illustrated room that sets this screen's whole visual tone —
// overwrite Pets/fondo1.jpg to restyle the room, no code changes needed.
const ROOM_BACKGROUND = require('../../Pets/fondo1.jpg');

const SHEET_PADDING_H = 24;

export default function PetCareScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const desktop = width >= 900;
  const petSize = desktop
    ? Math.min(440, height * 0.5, (width - 328) * 0.42)
    : Math.min(390, width * 0.96, height * 0.48);
  const statTrackWidth = desktop
    ? Math.max(120, Math.min(340, (width - 328) * 0.42 - 56))
    : Math.min(520, width) - SHEET_PADDING_H * 2;
  const { state, level, feedPet, setPetName } = useGame();
  const [feedSignal, setFeedSignal] = useState(0);
  const [renameVisible, setRenameVisible] = useState(false);

  const stage = getStageForLevel(level);
  const displayName = state.petName ?? stage.name;
  const ownedFoods = SHOP_FOODS.filter((f) => (state.inventory[f.id] ?? 0) > 0);

  const handleFeed = (id: FoodId) => {
    const fed = feedPet(id);
    if (fed) setFeedSignal((s) => s + 1);
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
            <PetAvatar eyesOpen={stage.eyesOpen} eyesClosed={stage.eyesClosed} size={petSize} feedSignal={feedSignal} />
            <TouchableOpacity style={styles.nameBadge} activeOpacity={0.7} onPress={() => setRenameVisible(true)}>
              <Text style={styles.petName}>{displayName}</Text>
              <Ionicons name="pencil" size={12} color={colors.textSecondary} style={styles.petNameIcon} />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.sheet,
              desktop && styles.desktopSheet,
              { paddingBottom: desktop ? 28 : insets.bottom + 104 },
            ]}
          >
            {!desktop && <View style={styles.sheetHandle} />}

            <View style={styles.statsRow}>
              <StatBar icon="🍗" label="Hambre" value={state.hunger} fillColor={colors.hunger} trackWidth={statTrackWidth} />
              <StatBar
                icon="💛"
                label="Felicidad"
                value={state.happiness}
                fillColor={colors.happiness}
                trackWidth={statTrackWidth}
              />
            </View>

            <View style={styles.foodDivider} />

            <Text style={[styles.foodTitle, desktop && styles.desktopFoodTitle]}>Alimentar</Text>
            {ownedFoods.length === 0 ? (
              <Text style={[styles.foodEmpty, desktop && styles.desktopFoodEmpty]}>
                Compra comida en la Tienda para alimentar a tu mascota
              </Text>
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
    marginBottom: 14,
  },
  header: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
  mobileStageAreaShift: {
    transform: [{ translateX: 14 }],
  },
  desktopStageAreaShift: {
    transform: [{ translateX: -28 }],
  },
  desktopLayout: {
    flex: 1,
  },
  desktopLayoutWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 44,
  },
  nameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -6,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
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
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  petNameIcon: {
    marginLeft: 6,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 10,
    paddingHorizontal: SHEET_PADDING_H,
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 5,
    borderBottomColor: '#E6D5BF',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
  },
  desktopSheet: {
    width: 520,
    maxWidth: '48%',
    paddingTop: 28,
    paddingHorizontal: 36,
    paddingBottom: 34,
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
    marginBottom: 16,
  },
  statsRow: {
    gap: 14,
  },
  foodDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  foodTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  desktopFoodTitle: {
    fontSize: 19,
    marginBottom: 16,
  },
  foodEmpty: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  desktopFoodEmpty: {
    fontSize: 15,
    lineHeight: 23,
  },
  foodChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
});
