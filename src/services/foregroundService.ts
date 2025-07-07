import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location'; // Import expo-location
import { Platform } from 'react-native';

const FOREGROUND_TASK_NAME = 'foreground-notification-service';

// Define the foreground task (can be empty if only used for foreground service)
TaskManager.defineTask(FOREGROUND_TASK_NAME, async () => {
  console.log('Foreground task running...');
});

export const startForegroundService = async (message: string) => {
  if (Platform.OS === 'web') {
    console.log('Foreground services are not supported on web.');
    return;
  }

  // Request necessary permissions
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    console.log('Foreground location permission not granted. Cannot start foreground service.');
    return;
  }

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') {
    console.log('Background location permission not granted. Cannot start foreground service.');
    return;
  }

  // Ensure notification channel exists for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('foreground_service', {
      name: 'Foreground Service',
      importance: Notifications.AndroidImportance.MAX, // Highest importance for non-dismissible
      description: 'This channel is used by the foreground service to keep the app running in the background.',
      vibrationPattern: [0],
      lightColor: '#FF231F7C',
      showBadge: false,
    });
  }

  // Start the foreground service using expo-location
  await Location.startLocationUpdatesAsync(FOREGROUND_TASK_NAME, {
    accuracy: Location.Accuracy.Lowest, // Minimal accuracy as we don't need actual location
    timeInterval: 1000 * 60 * 60 * 24 * 365, // Very long interval to minimize updates (1 year)
    distanceInterval: 1000000, // Very large distance interval (1000 km)
    showsBackgroundLocationIndicator: false, // Don't show the blue bar on iOS
    foregroundService: {
      notificationTitle: 'Getodone Running',
      notificationBody: message,
      notificationColor: '#FF231F7C',
      // These properties make the notification non-dismissible
      ongoing: true,
      channelId: 'foreground_service',
    },
  });

  console.log('Foreground service started.');
};

export const stopForegroundService = async () => {
  if (Platform.OS === 'web') {
    console.log('Foreground services are not supported on web.');
    return;
  }

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(FOREGROUND_TASK_NAME);
  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(FOREGROUND_TASK_NAME);
    console.log('Foreground service stopped.');
  } else {
    console.log('Foreground service was not running.');
  }
};

export const isForegroundServiceRunning = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }
  return await Location.hasStartedLocationUpdatesAsync(FOREGROUND_TASK_NAME);
};