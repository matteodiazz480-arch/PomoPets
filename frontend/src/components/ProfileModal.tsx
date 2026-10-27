import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { playSound } from '../audio/sounds';
import { useGame } from '../context/GameContext';
import { colors } from '../theme/colors';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ProfileModal({ visible, onClose }: Props) {
  const { state, level, setPlayerName, setPhotoUrl, syncScoreToCloud } = useGame();
  const [name, setName] = useState(state.playerName || 'Estudiante');
  const [loadingImage, setLoadingImage] = useState(false);

  // Sync state if modal is opened
  React.useEffect(() => {
    if (visible) {
      setName(state.playerName || 'Estudiante');
    }
  }, [visible, state.playerName]);

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
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const imageUri = asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;

        setPhotoUrl(imageUri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        playSound('success');
      }
    } catch (e) {
      console.warn('[ProfileModal] Error picking image:', e);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleRemovePhoto = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    playSound('tap');
    setPhotoUrl(null);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed) {
      setPlayerName(trimmed);
      await syncScoreToCloud();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      playSound('success');
      onClose();
    }
  };

  const formatHours = (minutes: number) => {
    const hrs = (minutes / 60).toFixed(1);
    return `${hrs}h`;
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Perfil de Jugador</Text>
            <Text style={styles.subtitle}>Tu foto y nombre serán visibles por todos en el torneo semanal</Text>

            {/* Avatar & Photo Picker */}
            <View style={styles.avatarSection}>
              <TouchableOpacity activeOpacity={0.85} onPress={handlePickImage} style={styles.avatarWrap}>
                {state.photoUrl ? (
                  <Image source={{ uri: state.photoUrl }} style={styles.avatarImage} />
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
                <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.85} onPress={handlePickImage}>
                  <Ionicons name="image-outline" size={16} color={colors.primaryDark} />
                  <Text style={styles.uploadBtnText}>
                    {state.photoUrl ? 'Cambiar Foto' : 'Subir Foto de Perfil'}
                  </Text>
                </TouchableOpacity>

                {state.photoUrl && (
                  <TouchableOpacity style={styles.removePhotoBtn} activeOpacity={0.85} onPress={handleRemovePhoto}>
                    <Text style={styles.removePhotoText}>Quitar foto</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Name Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Tu Nombre o Apodo:</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Sofía Estudiosa"
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
            <TouchableOpacity style={styles.saveBtn} activeOpacity={0.88} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Guardar y Sincronizar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: colors.appBg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: colors.border,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
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
    maxWidth: 280,
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
