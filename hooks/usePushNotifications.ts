import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const { user } = useAuth();
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    if (!user) return;

    registerAndSaveToken(user.id);

    // Handle notification received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // No-op — the notification is shown automatically via setNotificationHandler
    });

    // Handle tap on a notification — navigate to the relevant screen
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, string> | undefined;
      if (!data) return;

      if (data.screen === 'proposal' && data.id) {
        router.push(`/proposal/${data.id}`);
      } else if (data.screen === 'hangout' && data.id) {
        router.push(`/hangout/${data.id}`);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user?.id]);
}

async function registerAndSaveToken(userId: string) {
  // Push tokens only work on physical devices
  if (!Device.isDevice) return;
  if (Platform.OS === 'web') return;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // getExpoPushTokenAsync requires an EAS projectId in SDK 53+.
  // In Expo Go this will throw — fail silently since push notifications
  // require a dev/production build regardless.
  let token: string;
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    token = tokenData.data;
  } catch {
    return;
  }

  // Persist to Supabase so server can notify this device
  await supabase
    .from('profiles')
    .update({ push_token: token })
    .eq('id', userId);
}
