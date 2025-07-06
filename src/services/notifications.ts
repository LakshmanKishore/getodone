import * as Notifications from 'expo-notifications';
import { Platform, AppState } from 'react-native';

// Ensure notifications are shown even when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleMotivationNotification = async (message: string, triggerDate: Date | number | null) => {
  console.log(`scheduleMotivationNotification called with message: "${message}" and triggerDate: ${typeof triggerDate === 'number' ? `(delay: ${triggerDate} seconds)` : triggerDate?.toISOString()}`);
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

  if (!triggerDate) {
    console.log('Notification not scheduled as triggerDate is null.');
    return;
  }

  let finalTriggerDate: Date;
  if (typeof triggerDate === 'number') {
    finalTriggerDate = new Date(Date.now() + triggerDate * 1000); // Convert seconds to milliseconds
  } else {
    finalTriggerDate = triggerDate;
  }

  const trigger = { type: 'date', date: finalTriggerDate };
  console.log(`Attempting to schedule notification with trigger: ${JSON.stringify(trigger)}`);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Getodone Nudge!",
      body: message,
    },
    trigger, // Use the prepared trigger object
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