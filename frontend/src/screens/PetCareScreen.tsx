import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// The pet is the absolute protagonist here, plain — no glow/aura/ground shadow —
// sized off both screen width and height so it stays huge without ever pushing
// the care sheet off-screen.
const PET_SIZE = Math.min(300, SCREEN_WIDTH * 0.76, SCREEN_HEIGHT * 0.36);
const SHEET_PADDING_H = 24;
// Sheet horizontal padding on both sides, minus the stat row's icon bubble (30) and its margin (10).
const STAT_TRACK_WIDTH = SCREEN_WIDTH - SHEET_PADDING_H * 2 - 30 - 10;

export default function PetCareScreen() {
  const insets = useSafeAreaInsets();
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
    <FittedImageBackground source={ROOM_BACKGROUND} aspectRatio={1536 / 2752} backgroundColor={colors.appBg}>
      <View style={styles.content}>
        <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
          <Text style={styles.headerTitle}>Mi Mascota</Text>
        </View>

        <View style={styles.stageArea}>
          <PetAvatar eyesOpen={stage.eyesOpen} eyesClosed={stage.eyesClosed} size={PET_SIZE} feedSignal={feedSignal} />
          <TouchableOpacity style={styles.nameBadge} activeOpacity={0.7} onPress={() => setRenameVisible(true)}>
            <Text style={styles.petName}>{displayName}</Text>
            <Ionicons name="pencil" size={12} color={colors.textSecondary} style={styles.petNameIcon} />
          </TouchableOpacity>
        </View>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 104 }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.statsRow}>
            <StatBar icon="🍗" label="Hambre" value={state.hunger} fillColor={colors.hunger} trackWidth={STAT_TRACK_WIDTH} />
            <StatBar
              icon="💛"
              label="Felicidad"
              value={state.happiness}
              fillColor={colors.happiness}
              trackWidth={STAT_TRACK_WIDTH}
            />
          </View>

          <View style={styles.foodDivider} />

          <Text style={styles.foodTitle}>Alimentar</Text>
          {ownedFoods.length === 0 ? (
            <Text style={styles.foodEmpty}>Compra comida en la Tienda para alimentar a tu mascota</Text>
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
  header: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  stageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -6,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
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
    backgroundColor: colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 10,
    paddingHorizontal: SHEET_PADDING_H,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
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
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  foodEmpty: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  foodChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
});
