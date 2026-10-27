import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { playSound } from '../audio/sounds';
import { useGame } from '../context/GameContext';
import { levelFromTotalXp } from '../data/progression';
import { syncPlayerScore } from '../services/firebase';
import { colors, profileModalStyles } from '../style';
import BlurredModal from './BlurredModal';

type Props = {
  visible: boolean;
  onClose: () => void;
};

async function convertAssetToDataUri(asset: ImagePicker.ImagePickerAsset): Promise<string> {
  if (asset.base64) {
    const raw = asset.base64;
    return raw.startsWith('data:') ? raw : `data:image/jpeg;base64,${raw}`;
  }

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
  const { state, setPlayerName, setPhotoUrl } = useGame();
  const [name, setName] = useState(state.playerName || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(state.photoUrl || null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(state.playerName || '');
      setPhotoPreview(state.photoUrl || null);
    }
  }, [visible, state.playerName, state.photoUrl]);

  const publishProfile = async (nextName: string, nextPhoto: string) => {
    await syncPlayerScore({
      id: state.playerId || 'player_default',
      name: nextName,
      petName: state.petName || 'Cornolín',
      level: levelFromTotalXp(state.totalXp).level,
      totalXp: state.totalXp,
      minutesStudied: state.minutesStudiedTotal,
      streak: state.streak,
      photoUrl: nextPhoto,
    });
  };

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
        const dataUri = await convertAssetToDataUri(result.assets[0]);
        setPhotoPreview(dataUri);
        setPhotoUrl(dataUri);
        await publishProfile(name.trim() || state.playerName || 'Jugador', dataUri);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        playSound('success');
      }
    } finally {
      setLoadingImage(false);
    }
  };

  const handleRemovePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    playSound('tap');
    setPhotoPreview(null);
    setPhotoUrl(null);
    await publishProfile(name.trim() || state.playerName || 'Jugador', '');
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    setPlayerName(trimmed);
    await publishProfile(trimmed, photoPreview || state.photoUrl || '');
    setSaving(false);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    playSound('success');
    onClose();
  };

  return (
    <BlurredModal visible={visible} onClose={onClose} align="center">
      <View style={profileModalStyles.sheet}>
        <TouchableOpacity
          style={profileModalStyles.closeBtn}
          onPress={onClose}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={18} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={profileModalStyles.title}>Perfil de Jugador</Text>
        <Text style={profileModalStyles.subtitle}>
          Personaliza tu nombre y foto para que todos te vean en la clasificación
        </Text>

        <View style={profileModalStyles.avatarSection}>
          <TouchableOpacity activeOpacity={0.85} onPress={handlePickImage} style={profileModalStyles.avatarWrap}>
            {photoPreview ? (
              <Image source={{ uri: photoPreview }} style={profileModalStyles.avatarImage} />
            ) : (
              <View style={profileModalStyles.avatarPlaceholder}>
                <Ionicons name="person" size={44} color="#94A3B8" />
              </View>
            )}
            <View style={profileModalStyles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <View style={profileModalStyles.photoActions}>
            <TouchableOpacity
              style={profileModalStyles.uploadBtn}
              activeOpacity={0.85}
              onPress={handlePickImage}
              disabled={loadingImage}
            >
              {loadingImage ? (
                <ActivityIndicator size="small" color={colors.primaryDark} />
              ) : (
                <>
                  <Ionicons name="image-outline" size={15} color={colors.primaryDark} />
                  <Text style={profileModalStyles.uploadBtnText}>
                    {photoPreview ? 'Cambiar Foto' : 'Subir Foto'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {photoPreview && (
              <TouchableOpacity
                style={profileModalStyles.removePhotoBtn}
                activeOpacity={0.85}
                onPress={handleRemovePhoto}
              >
                <Text style={profileModalStyles.removePhotoText}>Quitar foto</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={profileModalStyles.inputSection}>
          <Text style={profileModalStyles.inputLabel}>Tu Nombre o Apodo Público:</Text>
          <TextInput
            style={profileModalStyles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Escribe tu nombre..."
            placeholderTextColor="#94A3B8"
            maxLength={24}
          />
        </View>

        <TouchableOpacity
          style={[profileModalStyles.saveBtn, saving && { opacity: 0.7 }]}
          activeOpacity={0.88}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={profileModalStyles.saveBtnText}>
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Text>
        </TouchableOpacity>
      </View>
    </BlurredModal>
  );
}
