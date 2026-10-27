import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { playSound } from '../audio/sounds';
import type { Task } from '../context/GameContext';
import { colors, taskListStyles } from '../style';

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
    <View style={taskListStyles.row}>
      <TouchableOpacity
        style={taskListStyles.checkbox}
        activeOpacity={0.7}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.done }}
        accessibilityLabel={task.text}
        onPress={handleToggle}
      >
        <Animated.View
          style={[
            taskListStyles.checkCircle,
            task.done && taskListStyles.checkCircleDone,
            { transform: [{ scale: checkScale }] },
          ]}
        >
          {task.done && <Ionicons name="checkmark" size={14} color={colors.white} />}
        </Animated.View>
        <Text style={[taskListStyles.taskText, task.done && taskListStyles.taskTextDone]} numberOfLines={2}>
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
        <Animated.View style={[taskListStyles.deleteButton, { transform: [{ scale: deleteScale }] }]}>
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
    <View style={[taskListStyles.card, desktop && taskListStyles.desktopCard]}>
      <View style={taskListStyles.header}>
        <Text style={[taskListStyles.title, desktop && taskListStyles.desktopTitle]}>📝 Tareas de hoy</Text>
        {tasks.length > 0 && (
          <View style={taskListStyles.countPill}>
            <Text style={taskListStyles.countText}>
              {doneCount}/{tasks.length}
            </Text>
          </View>
        )}
      </View>

      <View style={taskListStyles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          maxLength={MAX_LENGTH}
          placeholder="Ej: Repasar Álgebra"
          placeholderTextColor={colors.textSecondary}
          style={[taskListStyles.input, desktop && taskListStyles.desktopInput]}
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
              taskListStyles.addButton,
              draft.trim().length === 0 && taskListStyles.addButtonDisabled,
              { transform: [{ scale: addScale }] },
            ]}
          >
            <View style={taskListStyles.addButtonHighlight} pointerEvents="none" />
            <Ionicons name="add" size={20} color={colors.white} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {tasks.length === 0 ? (
        <Text style={[taskListStyles.emptyText, desktop && taskListStyles.desktopEmptyText]}>
          Anota los temas que quieres estudiar hoy y márcalos al terminar cada bloque.
        </Text>
      ) : (
        <View style={taskListStyles.list}>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </View>
      )}
    </View>
  );
}
