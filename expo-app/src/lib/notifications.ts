import { supabase } from './supabaseClient';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const registerForPushNotificationsAsync = async (userId: string) => {
  let token;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.log('User did not grant push notification permissions.');
    return;
  }

  try {
    const pushToken = await Notifications.getExpoPushTokenAsync();
    token = pushToken.data;
    console.log('Expo Push Token:', token);
  } catch (e) {
    console.error("Failed to get Expo push token", e);
    return;
  }


  if (token) {
    const { error } = await supabase
      .from('push_tokens')
      .upsert({ token, user_id: userId }, { onConflict: 'token' });
    if (error) {
      console.error('Failed to save push token:', error);
    }
  }

  return token;
};
