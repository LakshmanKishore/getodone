import * as TaskManager from 'expo-task-manager';
import * as BackgroundTasks from 'expo-background-task';
import { Platform } from 'react-native';
import { getTodos, getSettings } from './storage';
import { buildMotivationPrompt } from '../utils/promptBuilder';
import { generateMotivationMessage } from './ai';
import { scheduleMotivationNotification } from './notifications';

const BACKGROUND_TASK_NAME = 'motivation-task';

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  console.log('Background task triggered.');
  try {
    const todos = await getTodos();
    console.log('Todos fetched in background task:', todos.length);
    const settings = await getSettings();
    console.log('Settings fetched in background task:', settings);

    if (!settings || !settings.apiKey || !settings.model) {
      console.log('AI settings not configured. Skipping motivation message in background task.');
      return TaskManager.Result.NoData;
    }

    const prompt = buildMotivationPrompt(todos, settings);
    console.log('Prompt built in background task.');
    const message = await generateMotivationMessage(prompt, settings);
    console.log('Motivation message generated in background task:', message ? 'Success' : 'Failed');

    if (message) {
      await scheduleMotivationNotification(message);
      console.log('Motivation notification scheduled in background task.');
    }

    return TaskManager.Result.NewData;
  } catch (error) {
    console.error('Background task failed:', error);
    return TaskManager.Result.Failed;
  }
});

export const registerBackgroundTask = async () => {
  if (Platform.OS === 'web') {
    console.log('Background tasks are not supported on web.');
    return;
  }
  const status = await BackgroundTasks.getTaskStatusAsync();
  if (status === BackgroundTasks.TaskStatus.Restricted) {
    console.warn('Background fetch is restricted on this device.');
    return;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
  if (isRegistered) {
    console.log('Background task already registered.');
    // If already registered, unregister to update interval if settings changed
    await unregisterBackgroundTask();
  }

  const settings = await getSettings();
  let interval = 60 * 60 * 24; // Default to daily (24 hours)

  if (settings) {
    switch (settings.notificationFrequency) {
      case 'hourly':
        interval = 60 * 60; // 1 hour
        break;
      case '3-per-day':
        interval = 8 * 60 * 60; // 8 hours (3 times a day)
        break;
      case 'daily':
        interval = 24 * 60 * 60; // 24 hours
        break;
      case '5-mins':
        interval = 5 * 60; // 5 minutes
        break;
    }
  }

  await BackgroundTasks.registerTaskAsync(BACKGROUND_TASK_NAME, {
    minimumInterval: interval,
    stopOnTerminate: false,
    startOnBoot: true,
  });
  console.log(`Background task registered with interval: ${interval / 60} minutes.`);
};

export const unregisterBackgroundTask = async () => {
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