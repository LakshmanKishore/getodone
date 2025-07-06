import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const FOREGROUND_TASK_NAME = 'foreground-notification-service';

// Define the foreground task
TaskManager.defineTask(FOREGROUND_TASK_NAME, async () => {
  console.log('Foreground task running...');
}, { minimumInterval: 5 }); // Log every 5 seconds to confirm it's alive

export const startForegroundService = async () => {
  if (Platform.OS === 'web') {
    console.log('Foreground services are not supported on web.');
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted. Cannot start foreground service.');
    return;
  }

  // Ensure notification channel exists for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('foreground_service', {
      name: 'Foreground Service',
      importance: Notifications.AndroidImportance.LOW,
      description: 'This channel is used by the foreground service to keep the app running in the background.',
      vibrationPattern: [0],
      lightColor: '#FF231F7C',
      showBadge: false,
    });
  }

  // Start the foreground service (this will show the persistent notification)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Getodone Running",
      body: "Ensuring reliable delivery of your motivational nudges.",
      sticky: true, // Makes the notification persistent
      sound: false, // No sound for persistent notification
    },
    trigger: null, // Show immediately
    identifier: 'foreground-service-notification',
    channelId: 'foreground_service', // Android specific channel
  });

  console.log('Foreground service started.');
};

export const stopForegroundService = async () => {
  if (Platform.OS === 'web') {
    console.log('Foreground services are not supported on web.');
    return;
  }

  // Stop the task manager task (optional, but good practice)
  const isRegistered = await TaskManager.isTaskRegisteredAsync(FOREGROUND_TASK_NAME);
  if (isRegistered) {
    await TaskManager.unregisterTaskAsync(FOREGROUND_TASK_NAME);
  }

  // Dismiss the persistent notification
  await Notifications.cancelScheduledNotificationAsync('foreground-service-notification');

  console.log('Foreground service stopped.');
};

export const isForegroundServiceRunning = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }
  // Check if the persistent notification is active
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some(notification => notification.identifier === 'foreground-service-notification');
};