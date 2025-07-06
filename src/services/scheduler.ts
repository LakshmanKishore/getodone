import * as TaskManager from 'expo-task-manager';
import * as BackgroundTasks from 'expo-background-task';
import { Platform, Alert, AppState } from 'react-native';
import { getTodos, getSettings } from './storage';
import { buildMotivationPrompt } from '../utils/promptBuilder';
import { generateMotivationMessage } from './ai';
import { scheduleMotivationNotification } from './notifications';
import * as Notifications from 'expo-notifications';

const BACKGROUND_TASK_NAME = 'motivation-task';

export const executeBackgroundTask = async (): Promise<'no-data' | 'new-data' | 'failed'> => {
  console.log('Background task triggered.');
  try {
    const todos = await getTodos();
    console.log('Todos fetched in background task:', todos.length);
    const settings = await getSettings();
    console.log('Settings fetched in background task:', settings);

    if (!settings || !settings.apiKey || !settings.model || !settings.notificationsEnabled) {
      console.log('AI settings not configured or notifications disabled. Skipping motivation message in background task.');
      return 'no-data';
    }
    
    // Do not run background task if frequency is 5-mins, as it's handled as a one-off
    if (settings.notificationFrequency === '1-min' || settings.notificationFrequency === 'custom') {
        console.log(`Skipping background task for ${settings.notificationFrequency} frequency.`);
        return 'no-data';
    }

    const prompt = buildMotivationPrompt(todos, settings);
    console.log('Prompt built in background task.');
    const message = await generateMotivationMessage(prompt, settings);
    console.log('Motivation message generated in background task:', message ? 'Success' : 'Failed');

    if (message) {
      // Schedule with a 1-second delay to ensure it feels immediate
      await scheduleMotivationNotification(message, 1);
      console.log('Motivation notification scheduled in background task.');
    }

    return 'new-data';
  } catch (error) {
    console.error('Background task failed:', error);
    return 'failed';
  }
};

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  const result = await executeBackgroundTask();
  switch (result) {
    case 'no-data':
      return TaskManager.Result.NoData;
    case 'new-data':
      return TaskManager.Result.NewData;
    case 'failed':
      return TaskManager.Result.Failed;
  }
});

export const registerBackgroundTask = async () => {
  console.log('Attempting to register background task...');
  if (Platform.OS === 'web') {
    console.log('Background tasks are not supported on web.');
    return;
  }

  const settings = await getSettings();
  if (!settings) {
      console.log("Settings not found, can't register task.");
      return;
  }

  // Handle the "5-mins" option as a special one-time scheduled notification
  if (settings.notificationFrequency === '1-min') {
    console.log('Scheduling a one-time notification for 1 minute.');
    try {
        const todos = await getTodos();
        if (todos.length === 0) {
            Alert.alert("No Todos", "Add some tasks to get a motivation nudge!");
            return;
        }
        const prompt = buildMotivationPrompt(todos, settings);
        const message = await generateMotivationMessage(prompt, settings);
        await Notifications.cancelAllScheduledNotificationsAsync(); // Clear previous notifications
        if (message) {
            const triggerDate = new Date(Date.now() + 60 * 1000);
            console.log(`Scheduling 1-min notification for: ${triggerDate.toISOString()}`);
            await scheduleMotivationNotification(message, triggerDate);
            Alert.alert("Nudge Scheduled", "You will receive a motivation nudge in 1 minute.");
        } else {
            Alert.alert("Error", "Could not generate a motivation message.");
        }
    } catch (error) {
        console.error("Failed to schedule 5-minute notification:", error);
        Alert.alert("Error", "Failed to schedule the motivation nudge.");
    }
    return; // Do not register the persistent background task
  }

  // Handle the "custom" option as a special one-time scheduled notification
  if (settings.notificationFrequency === 'custom') {
    console.log('Scheduling a one-time notification for a custom time.');
    try {
      const [hours, minutes] = (settings.customNotificationTime || '10:00').split(':').map(Number);
      const now = new Date();
      const notificationTime = new Date();
      notificationTime.setHours(hours, minutes, 0, 0);

      if (notificationTime <= now) {
        // If the time has already passed for today, schedule it for tomorrow
        notificationTime.setDate(notificationTime.getDate() + 1);
      }

      const delayInSeconds = (notificationTime.getTime() - now.getTime()) / 1000;
      console.log(`Scheduling custom notification with delay: ${delayInSeconds} seconds`);

      const todos = await getTodos();
      if (todos.length === 0) {
        Alert.alert("No Todos", "Add some tasks to get a motivation nudge!");
        return;
      }
      const prompt = buildMotivationPrompt(todos, settings);
      const message = await generateMotivationMessage(prompt, settings);
      await Notifications.cancelAllScheduledNotificationsAsync(); // Clear previous notifications
      if (message) {
        console.log(`Scheduling custom notification for: ${notificationTime.toISOString()}`);
        await scheduleMotivationNotification(message, notificationTime);
        Alert.alert("Nudge Scheduled", `You will receive a motivation nudge at ${settings.customNotificationTime}.`);
      } else {
        Alert.alert("Error", "Could not generate a motivation message.");
      }
    } catch (error) {
      console.error("Failed to schedule custom notification:", error);
      Alert.alert("Error", "Failed to schedule the motivation nudge. Please check the time format (HH:MM).");
    }
    return; // Do not register the persistent background task
  }

  const status = await BackgroundTasks.getTaskStatusAsync();
  if (status === BackgroundTasks.TaskStatus.Restricted) {
    console.warn('Background fetch is restricted on this device.');
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
  if (isRegistered) {
    console.log('Background task already registered. It will be updated.');
    await unregisterBackgroundTask();
  }

  let interval = 60 * 60 * 24; // Default to daily

  switch (settings.notificationFrequency) {
    case 'hourly':
      interval = 60 * 60; // 1 hour
      break;
    case '3-per-day':
      interval = 8 * 60 * 60; // 8 hours
      break;
    case 'daily':
      interval = 24 * 60 * 60; // 24 hours
      break;
  }

  await BackgroundTasks.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: interval,
    stopOnTerminate: false,
    startOnBoot: true,
  });
  console.log(`Background task registered with interval: ${interval / 60} minutes.`);
};

export const unregisterBackgroundTask = async () => {
  console.log('Attempting to unregister background task...');
  if (Platform.OS === 'web') {
    console.log('Background tasks are not supported on web.');
    return;
  }
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
  if (isRegistered) {
    await BackgroundTasks.unregisterTaskAsync(BACKGROUND_TASK_NAME);
    console.log('Background task unregistered.');
  }
};