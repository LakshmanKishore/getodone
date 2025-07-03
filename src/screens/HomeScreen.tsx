import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { ThemedTextInput } from '../components/ThemedTextInput';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { TodoItem } from '../components/TodoItem';
import { Todo } from '../services/types';
import { getTodos, saveTodos } from '../services/storage';
import uuid from 'react-native-uuid';
import { useFocusEffect } from '@react-navigation/native';

const getodoneLogoXml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 60" width="160" height="60">
  <!-- Gradient Definitions -->
  <defs>
    <!-- Gradient for "t": Top half amber (o from todo), Bottom half green (ge) -->
    <linearGradient id="tGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="50%" stop-color="#FFC107" /> <!-- Amber (top half) -->
      <stop offset="50%" stop-color="#4CAF50" /> <!-- Green (bottom half) -->
    </linearGradient>

    <!-- Gradient for "do": Top half blue (ne from done), Bottom half amber (o from todo) -->
    <linearGradient id="doGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="50%" stop-color="#2196F3" /> <!-- Blue (top half) -->
      <stop offset="50%" stop-color="#FFC107" /> <!-- Amber (bottom half) -->
    </linearGradient>
  </defs>

  <!-- Text element with consistent letter spacing -->
  <text x="10" y="42" font-family="Arial, sans-serif" font-weight="bold" font-size="36" letter-spacing="1" textLength="140">
    <tspan fill="#4CAF50">g</tspan>
    <tspan fill="#4CAF50">e</tspan>
    <tspan fill="url(#tGradient)">t</tspan>
    <tspan fill="#FFC107">o</tspan>
    <tspan fill="url(#doGradient)">d</tspan>
    <tspan fill="url(#doGradient)">o</tspan>
    <tspan fill="#2196F3">n</tspan>
    <tspan fill="#2196F3">e</tspan>
  </text>
</svg>`;

export default function HomeScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');

  const loadTodos = useCallback(async () => {
    const storedTodos = await getTodos();
    setTodos(storedTodos);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTodos();
    }, [loadTodos])
  );

  const addTodo = async () => {
    if (newTodoTitle.trim() === '') {
      Alert.alert('Error', 'Todo title cannot be empty.');
      return;
    }
    const newTodo: Todo = {
      id: uuid.v4() as string,
      title: newTodoTitle.trim(),
      createdAt: Date.now(),
      isCompleted: false,
    };
    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
    setNewTodoTitle('');
  };

  const toggleTodo = async (id: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
    );
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const deleteTodo = async (id: string) => {
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  return (
    <ThemedView style={styles.container}>
      <Image source={require('../assets/images/getodone_logo.png')} style={styles.logo} />
      <ThemedText type="title" style={styles.title}>Your Todos</ThemedText>
      <ThemedView style={styles.inputContainer}>
        <ThemedTextInput
          style={styles.input}
          placeholder="Add a new todo..."
          value={newTodoTitle}
          onChangeText={setNewTodoTitle}
          onSubmitEditing={addTodo}
        />
        <TouchableOpacity onPress={addTodo} style={styles.addButton}>
          <ThemedText style={styles.addButtonText}>Add</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TodoItem todo={item} onToggle={toggleTodo} onDelete={deleteTodo} />
        )}
        ListEmptyComponent={
          <ThemedText style={styles.emptyListText}>No todos yet! Add some tasks to get started.</ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  logo: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
});