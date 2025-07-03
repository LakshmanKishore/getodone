import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo, Settings } from './types';

const TODOS_KEY = '@todos';
const SETTINGS_KEY = '@settings';

export const getTodos = async (): Promise<Todo[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TODOS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error getting todos:', e);
    return [];
  }
};

export const saveTodos = async (todos: Todo[]) => {
  try {
    const jsonValue = JSON.stringify(todos);
    await AsyncStorage.setItem(TODOS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving todos:', e);
  }
};

export const getSettings = async (): Promise<Settings | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Error getting settings:', e);
    return null;
  }
};

export const saveSettings = async (settings: Settings) => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(SETTINGS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving settings:', e);
  }
};