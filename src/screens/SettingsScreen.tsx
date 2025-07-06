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
import { registerBackgroundTask, unregisterBackgroundTask, BACKGROUND_TASK_NAME, executeBackgroundTask } from '../services/scheduler';
import { registerForPushNotificationsAsync } from '../services/notifications';
import * as Notifications from 'expo-notifications';

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
        notificationsEnabled: false, // Default to disabled
        customNotificationTime: '10:00',
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();

      const clearPastNotifications = async () => {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        const now = Date.now();

        for (const notification of scheduledNotifications) {
          if (notification.nextTriggerDate) {
            const triggerTime = notification.nextTriggerDate;
            if (triggerTime < now) {
              console.log(`Cancelling past notification: ${notification.identifier} (Trigger Time: ${new Date(triggerTime).toLocaleTimeString()})`);
              await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            }
          }
        }
      };
      clearPastNotifications();

    }, [loadSettings])
  );

  useEffect(() => {
    // Register for push notifications when the component mounts
    registerForPushNotificationsAsync();

    // Log background task status on component mount
    const checkTaskStatus = async () => {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
      console.log(`Background task '${BACKGROUND_TASK_NAME}' registered status: ${isRegistered}`);
    };
    checkTaskStatus();
  }, []);

  const handleSaveSettings = async (newSettings: Settings) => {
    await saveSettings(newSettings);
    setSettings(newSettings);
    Alert.alert('Settings Saved', 'Your settings have been updated.');

    // Re-register background task with new settings
    if (newSettings.notificationsEnabled) {
      await registerBackgroundTask();
    } else {
      await unregisterBackgroundTask();
    }
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
        await scheduleMotivationNotification(message, new Date(Date.now() + 1000)); // 1 second delay for immediate test notification
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

  const handleTriggerBackgroundTask = useCallback(async () => {
    console.log('Manually triggering background task...');
    const result = await executeBackgroundTask();
    let alertMessage = '';
    switch (result) {
      case 'no-data':
        alertMessage = 'Background task executed: No new data.';
        break;
      case 'new-data':
        alertMessage = 'Background task executed: New data processed.';
        break;
      case 'failed':
        alertMessage = 'Background task executed: Failed.';
        break;
      default:
        alertMessage = 'Background task executed with unknown result.';
    }
    Alert.alert('Background Task Triggered', alertMessage + ' Check console for logs.');
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
        onTriggerBackgroundTask={handleTriggerBackgroundTask}
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