import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { SettingsForm } from '../components/SettingsForm';
import { getSettings, saveSettings, getTodos } from '../services/storage';
import { buildMotivationPrompt } from '../utils/promptBuilder';
import { generateMotivationMessage } from '../services/ai';
import { scheduleMotivationNotification } from '../services/notifications';
import { Settings } from '../services/types';
import { useFocusEffect } from '@react-navigation/native';
import { registerBackgroundTask, unregisterBackgroundTask } from '../services/scheduler';
import { registerForPushNotificationsAsync } from '../services/notifications';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<Settings | null>(null);

  const loadSettings = useCallback(async () => {
    const storedSettings = await getSettings();
    if (storedSettings) {
      setSettings(storedSettings);
    } else {
      // Set default settings if nothing is stored yet
      setSettings({
        notificationFrequency: 'daily',
        aiTone: 'neutral',
        apiKey: '',
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings])
  );

  useEffect(() => {
    // Register for push notifications when the component mounts
    registerForPushNotificationsAsync();
  }, []);

  const handleSaveSettings = async (newSettings: Settings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
    Alert.alert('Settings Saved', 'Your settings have been updated.');

    // Re-register background task with new settings
    await unregisterBackgroundTask();
    await registerBackgroundTask();
  };

  const handleTestNotification = useCallback(async () => {
    console.log('Attempting to send test notification...');
    const currentSettings = await getSettings();
    const currentTodos = await getTodos();

    if (!currentSettings) {
      console.log('Settings not found.');
      Alert.alert('Error', 'Please configure your AI API Key and Model in settings first.');
      return;
    }

    if (!currentSettings.apiKey || !currentSettings.model) {
      console.log('API Key or Model not configured.');
      Alert.alert('Error', 'Please configure your AI API Key and Model in settings first.');
      return;
    }

    if (currentTodos.length === 0) {
      console.log('No todos found.');
      Alert.alert('Info', 'Add some todos first to get a meaningful motivation message.');
      return;
    }

    try {
      console.log('Building prompt...');
      const prompt = buildMotivationPrompt(currentTodos, currentSettings);
      console.log('Prompt built:', prompt);

      console.log('Generating motivation message...');
      const message = await generateMotivationMessage(prompt, currentSettings);
      console.log('Motivation message generated:', message ? 'Success' : 'Failed');

      if (message) {
        console.log('Scheduling notification...');
        await scheduleMotivationNotification(message);
        console.log('Notification scheduled.');
        Alert.alert('Test Notification Sent', message);
      } else {
        console.log('Failed to generate motivation message (empty message).');
        Alert.alert('Error', 'Failed to generate motivation message.');
      }
    } catch (error) {
      console.error('Error testing notification:', error);
      Alert.alert('Error', `Failed to send test notification: ${error.message || 'Unknown error'}. Check your API key and network connection.`);
    }
  }, []);

  if (!settings) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading settings...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Settings</ThemedText>
      <SettingsForm
        initialSettings={settings}
        onSave={handleSaveSettings}
        onTestNotification={handleTestNotification}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
});