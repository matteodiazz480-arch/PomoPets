import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { playSound } from '../audio/sounds';
import type { Task } from '../context/GameContext';
import { colors } from '../theme/colors';

type Props = {
  tasks: Task[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  desktop?: boolean;
};

const MAX_LENGTH = 60;

function TaskRow({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const checkScale = useRef(new Animated.Value(1)).current;
  const deleteScale = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    playSound('tap');
    Animated.sequence([
      Animated.timing(checkScale, { toValue: 0.8, duration: 80, useNativeDriver: true }),
      Animated.spring(checkScale, { toValue: 1.15, friction: 4, tension: 200, useNativeDriver: true }),
      Animated.spring(checkScale, { toValue: 1, friction: 5, tension: 180, useNativeDriver: true }),
    ]).start();
    onToggle(task.id);
  };

  const handleDeletePressIn = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    Animated.spring(deleteScale, { toValue: 0.85, friction: 8, tension: 240, useNativeDriver: true }).start();
  };

  const handleDeletePressOut = () => {
    Animated.spring(deleteScale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }).start();
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={styles.checkbox}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
        accessibilityLabel={task.text}
        onPress={handleToggle}
      >
        <Animated.View
          style={[
            styles.checkCircle,
            task.done && styles.checkCircleDone,
            { transform: [{ scale: checkScale }] },
          ]}
        >
          {task.done && <Ionicons name="checkmark" size={14} color={colors.white} />}
        </Animated.View>
        <Text style={[styles.taskText, task.done && styles.taskTextDone]} numberOfLines={2}>
          {task.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handleDeletePressIn}
        onPressOut={handleDeletePressOut}
        onPress={() => {
          playSound('tap');
          onDelete(task.id);
        }}
      >
        <Animated.View style={[styles.deleteButton, { transform: [{ scale: deleteScale }] }]}>
          <Ionicons name="trash-outline" size={16} color={colors.textSecondary} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

export default function TaskList({ tasks, onAdd, onToggle, onDelete, desktop = false }: Props) {
  const [draft, setDraft] = useState('');
  const addScale = useRef(new Animated.Value(1)).current;
  const doneCount = tasks.filter((t) => t.done).length;

  const handleAdd = () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    } catch {}
    playSound('tap');
    onAdd(trimmed);
    setDraft('');
  };

  const handleAddPressIn = () => {
    Animated.spring(addScale, { toValue: 0.9, friction: 8, tension: 240, useNativeDriver: true }).start();
  };

  const handleAddPressOut = () => {
    Animated.spring(addScale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }).start();
  };

  return (
    <View style={[styles.card, desktop && styles.desktopCard]}>
      <View style={styles.header}>
        <Text style={[styles.title, desktop && styles.desktopTitle]}>📝 Tareas de hoy</Text>
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
          style={[styles.input, desktop && styles.desktopInput]}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={draft.trim().length === 0}
          accessibilityRole="button"
          accessibilityLabel="Agregar tarea"
          onPressIn={handleAddPressIn}
          onPressOut={handleAddPressOut}
          onPress={handleAdd}
        >
          <Animated.View
            style={[
              styles.addButton,
              draft.trim().length === 0 && styles.addButtonDisabled,
              { transform: [{ scale: addScale }] },
            ]}
          >
            <View style={styles.addButtonHighlight} pointerEvents="none" />
            <Ionicons name="add" size={20} color={colors.white} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <Text style={[styles.emptyText, desktop && styles.desktopEmptyText]}>
          Anota los temas que quieres estudiar hoy y márcalos al terminar cada bloque.
        </Text>
      ) : (
        <View style={styles.list}>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
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
    borderWidth: 2,
    borderColor: colors.border,
    borderBottomWidth: 5,
    borderBottomColor: '#E6D5BF',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  desktopCard: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    borderRadius: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  desktopTitle: {
    fontSize: 19,
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
  desktopInput: {
    minHeight: 52,
    fontSize: 16,
    paddingHorizontal: 18,
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
  addButtonDisabled: {
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  desktopEmptyText: {
    fontSize: 15,
    lineHeight: 23,
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
    borderWidth: 1.5,
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
