import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { colors, renameModalStyles } from '../style';
import BlurredModal from './BlurredModal';
import PrimaryButton from './PrimaryButton';

type Props = {
  visible: boolean;
  initialName: string;
  onSave: (name: string) => void;
  onClose: () => void;
};

const MAX_LENGTH = 18;

export default function RenameModal({ visible, initialName, onSave, onClose }: Props) {
  const [draft, setDraft] = useState(initialName);

  useEffect(() => {
    if (visible) setDraft(initialName);
  }, [visible, initialName]);

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) return;
    onSave(trimmed);
    onClose();
  };

  return (
    <BlurredModal visible={visible} onClose={onClose} align="center">
      <View style={renameModalStyles.card}>
        <Text style={renameModalStyles.emoji}>✏️</Text>
        <Text style={renameModalStyles.title}>Nombra a tu mascota</Text>
        <Text style={renameModalStyles.subtitle}>Elige el nombre con el que la vas a llamar</Text>

        <TextInput
          value={draft}
          onChangeText={setDraft}
          maxLength={MAX_LENGTH}
          placeholder="Nombre de tu mascota"
          placeholderTextColor={colors.textSecondary}
          style={renameModalStyles.input}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />
        <Text style={renameModalStyles.counter}>
          {draft.trim().length}/{MAX_LENGTH}
        </Text>

        <View style={renameModalStyles.actions}>
          <PrimaryButton label="Cancelar" variant="secondary" onPress={onClose} sound="tap" />
          <PrimaryButton
            label="Guardar"
            onPress={handleSave}
            disabled={draft.trim().length === 0}
            sound="tap"
          />
        </View>
      </View>
    </BlurredModal>
  );
}
