import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const scheduleMotivationNotification = async (message: string) => {
  if (Platform.OS === 'web') {
    console.log('Notifications are not fully supported on web. Displaying as alert instead.');
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted. Cannot schedule notification.');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default Notifications',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Getodone Nudge!",
      body: message,
    },
    trigger: null, // Show immediately
  });
};

export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === 'web') {
    console.log('Push notifications are not fully supported on web.');
    return;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
};