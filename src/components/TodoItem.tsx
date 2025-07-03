import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Todo } from '../services/types';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={() => onToggle(todo.id)} style={styles.checkbox}>
        <ThemedText style={styles.checkboxText}>{todo.isCompleted ? '✅' : '⬜'}</ThemedText>
      </TouchableOpacity>
      <ThemedText style={[styles.title, todo.isCompleted && styles.completedText]}>
        {todo.title}
      </ThemedText>
      <TouchableOpacity onPress={() => onDelete(todo.id)} style={styles.deleteButton}>
        <ThemedText style={styles.deleteButtonText}>❌</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxText: {
    fontSize: 20,
  },
  title: {
    flex: 1,
    fontSize: 18,
  },
  completedText: {
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 20,
  },
});