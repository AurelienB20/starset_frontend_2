import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true, // affiche une bannière (iOS) ou heads-up (Android)
      shouldShowList: true,   // visible dans la liste/centre de notifs
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

export async function registerForPushToken() {
  const settings = await Notifications.requestPermissionsAsync();
  if (settings.status !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFFFFF'
    });
  }

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data; // "ExponentPushToken[xxxxxxxx]"
}
