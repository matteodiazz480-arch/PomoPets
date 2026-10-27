import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { playSound } from '../audio/sounds';
import { useGame } from '../context/GameContext';
import { levelFromTotalXp } from '../data/progression';
import { syncPlayerScore } from '../services/firebase';
import { colors } from '../theme/colors';
import BlurredModal from './BlurredModal';

type Props = {
  visible: boolean;
  onClose: () => void;
};

async function convertAssetToDataUri(asset: ImagePicker.ImagePickerAsset): Promise<string> {
  // 1. If Expo already gave us base64 (always provided on native mobile with base64: true)
  if (asset.base64) {
    const raw = asset.base64;
    return raw.startsWith('data:') ? raw : `data:image/jpeg;base64,${raw}`;
  }

  // 2. Web / Browser Canvas conversion
  if (typeof document !== 'undefined') {
    return new Promise((resolve) => {
      const img = new (window as any).Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 120;
        canvas.width = maxDim;
        canvas.height = maxDim;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, maxDim, maxDim);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } else {
          resolve(asset.uri);
        }
      };
      img.onerror = () => resolve(asset.uri);
      img.src = asset.uri;
    });
  }

  // 3. Fallback with FileReader (supported natively on React Native)
  try {
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(asset.uri);
      reader.readAsDataURL(blob);
    });
  } catch {
    return asset.uri;
  }
}

export default function ProfileModal({ visible, onClose }: Props) {
  const { state, level, setPlayerName, setPhotoUrl } = useGame();
  const [name, setName] = useState(state.playerName || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(state.photoUrl || null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync state when modal is opened
  React.useEffect(() => {
    if (visible) {
      setName(state.playerName || '');
      setPhotoPreview(state.photoUrl || null);
    }
  }, [visible, state.playerName, state.photoUrl]);

  const handlePickImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      playSound('tap');
      setLoadingImage(true);

      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setLoadingImage(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.4,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const dataUri = await convertAssetToDataUri(asset);

        // Update local preview immediately
        setPhotoPreview(dataUri);
        setPhotoUrl(dataUri);

        // Immediately sync to cloud so other users see the photo
        await syncPlayerScore({
          id: state.playerId || 'player_default',
          name: name.trim() || state.playerName || 'Jugador',
          petName: state.petName || 'Cornolín',
          level: levelFromTotalXp(state.totalXp).level,
          totalXp: state.totalXp,
          minutesStudied: state.minutesStudiedTotal,
          streak: state.streak,
          photoUrl: dataUri,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        playSound('success');
      }
    } catch (e) {
      console.warn('[ProfileModal] Error picking image:', e);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleRemovePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    playSound('tap');
    setPhotoPreview(null);
    setPhotoUrl(null);

    await syncPlayerScore({
      id: state.playerId || 'player_default',
      name: name.trim() || state.playerName || 'Jugador',
      petName: state.petName || 'Cornolín',
      level: levelFromTotalXp(state.totalXp).level,
      totalXp: state.totalXp,
      minutesStudied: state.minutesStudiedTotal,
      streak: state.streak,
      photoUrl: '',
    });
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    setPlayerName(trimmed);

    const activePhoto = photoPreview || state.photoUrl || '';

    // Directly publish to Firestore with the new name and photo
    await syncPlayerScore({
      id: state.playerId || 'player_default',
      name: trimmed,
      petName: state.petName || 'Cornolín',
      level: levelFromTotalXp(state.totalXp).level,
      totalXp: state.totalXp,
      minutesStudied: state.minutesStudiedTotal,
      streak: state.streak,
      photoUrl: activePhoto,
    });

    setSaving(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    playSound('success');
    onClose();
  };

  const formatHours = (minutes: number) => {
    const hrs = (minutes / 60).toFixed(1);
    return `${hrs}h`;
  };

  return (
    <BlurredModal visible={visible} onClose={onClose} align="center">
      <View style={styles.sheet}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Perfil de Jugador</Text>
            <Text style={styles.subtitle}>
              Personaliza tu nombre y foto para que todos te vean en el torneo semanal
            </Text>

            {/* Avatar & Photo Picker */}
            <View style={styles.avatarSection}>
              <TouchableOpacity activeOpacity={0.85} onPress={handlePickImage} style={styles.avatarWrap}>
                {photoPreview ? (
                  <Image source={{ uri: photoPreview }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={54} color="#94A3B8" />
                  </View>
                )}
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={16} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={styles.uploadBtn}
                  activeOpacity={0.85}
                  onPress={handlePickImage}
                  disabled={loadingImage}
                >
                  {loadingImage ? (
                    <ActivityIndicator size="small" color={colors.primaryDark} />
                  ) : (
                    <>
                      <Ionicons name="image-outline" size={16} color={colors.primaryDark} />
                      <Text style={styles.uploadBtnText}>
                        {photoPreview ? 'Cambiar Foto' : 'Subir Foto de Perfil'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {photoPreview && (
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    activeOpacity={0.85}
                    onPress={handleRemovePhoto}
                  >
                    <Text style={styles.removePhotoText}>Quitar foto</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Tu Nombre o Apodo Público:</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Escribe tu nombre..."
                placeholderTextColor="#94A3B8"
                maxLength={24}
              />
            </View>

            {/* Quick Stats in Tournament */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Tus Estadísticas en el Torneo</Text>
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>Nv. {level}</Text>
                  <Text style={styles.statLabel}>Nivel</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{state.totalXp} XP</Text>
                  <Text style={styles.statLabel}>Experiencia</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{formatHours(state.minutesStudiedTotal)}</Text>
                  <Text style={styles.statLabel}>Estudio</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>🔥 {state.streak}d</Text>
                  <Text style={styles.statLabel}>Racha</Text>
                </View>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              activeOpacity={0.88}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
    </BlurredModal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    width: '100%',
    backgroundColor: colors.appBg,
    borderRadius: 28,
    paddingTop: 22,
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxHeight: '90%',
    borderWidth: 2.5,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 22,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    maxWidth: 290,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: colors.primary,
    position: 'relative',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 6,
  },
  uploadBtnText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.primaryDark,
  },
  removePhotoBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  removePhotoText: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: '#EF4444',
  },
  inputSection: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 13,
    color: colors.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 15,
    color: colors.textPrimary,
  },
  statsCard: {
    width: '100%',
    backgroundColor: '#FFFDF5',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  statsTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: '#B45309',
    textAlign: 'center',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  saveBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryDark,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
