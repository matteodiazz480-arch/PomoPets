import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { playSound } from '../audio/sounds';
import type { Task } from '../context/GameContext';
import { colors } from '../theme/colors';

type Props = {
  tasks: Task[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

const MAX_LENGTH = 60;

export default function TaskList({ tasks, onAdd, onToggle, onDelete }: Props) {
  const [draft, setDraft] = useState('');
  const doneCount = tasks.filter((t) => t.done).length;

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) return;
    playSound('tap');
    onAdd(trimmed);
    setDraft('');
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>📝 Tareas de hoy</Text>
        {tasks.length > 0 && (
          <View style={styles.countPill}>
            <Text style={styles.countText}>
              {doneCount}/{tasks.length}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          maxLength={MAX_LENGTH}
          placeholder="Ej: Repasar Álgebra"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity
          style={[styles.addButton, draft.trim().length === 0 && styles.addButtonDisabled]}
          activeOpacity={0.8}
          disabled={draft.trim().length === 0}
          onPress={handleAdd}
        >
          <View style={styles.addButtonHighlight} pointerEvents="none" />
          <Ionicons name="add" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <Text style={styles.emptyText}>Anota los temas que quieres estudiar hoy y márcalos al terminar cada bloque.</Text>
      ) : (
        <View style={styles.list}>
          {tasks.map((task) => (
            <View key={task.id} style={styles.row}>
              <TouchableOpacity
                style={styles.checkbox}
                activeOpacity={0.7}
                onPress={() => {
                  playSound('tap');
                  onToggle(task.id);
                }}
              >
                <View style={[styles.checkCircle, task.done && styles.checkCircleDone]}>
                  {task.done && <Ionicons name="checkmark" size={14} color={colors.white} />}
                </View>
                <Text style={[styles.taskText, task.done && styles.taskTextDone]} numberOfLines={2}>
                  {task.text}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                activeOpacity={0.7}
                onPress={() => {
                  playSound('tap');
                  onDelete(task.id);
                }}
              >
                <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 26,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  countPill: {
    backgroundColor: colors.cardAlt,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primaryDark,
    borderBottomWidth: 4,
    borderBottomColor: colors.primaryDeep,
    overflow: 'hidden',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '46%',
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderTopLeftRadius: 19,
    borderTopRightRadius: 19,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  list: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  taskTextDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
});
