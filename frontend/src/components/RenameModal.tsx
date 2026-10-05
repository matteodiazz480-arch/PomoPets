import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme/colors';
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>✏️</Text>
          <Text style={styles.title}>Nombra a tu mascota</Text>
          <Text style={styles.subtitle}>Elige el nombre con el que la vas a llamar</Text>

          <TextInput
            value={draft}
            onChangeText={setDraft}
            maxLength={MAX_LENGTH}
            placeholder="Nombre de tu mascota"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          <Text style={styles.counter}>
            {draft.trim().length}/{MAX_LENGTH}
          </Text>

          <View style={styles.actions}>
            <PrimaryButton label="Cancelar" variant="secondary" onPress={onClose} sound="tap" />
            <PrimaryButton
              label="Guardar"
              onPress={handleSave}
              disabled={draft.trim().length === 0}
              sound="tap"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: 28,
    paddingVertical: 26,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 6,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  counter: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
});
