/**
 * reminderNotif.ts
 *
 * Handles LOCAL scheduled notifications for reminders.
 * Remote push (addPushTokenListener / DevicePushTokenAutoRegistration) is
 * removed from Expo Go in SDK 53. We guard against that by checking
 * appOwnership before importing expo-notifications at runtime.
 *
 * Local scheduled notifications still work perfectly in Expo Go.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { ReminderTask } from './reminderStorage';

// True when running inside the Expo Go client
const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Lazily resolved module — avoids the auto-registration side-effect in Expo Go
let _Notif: typeof import('expo-notifications') | null = null;

async function getNotif(): Promise<typeof import('expo-notifications') | null> {
  if (IS_EXPO_GO) {
    // Expo Go SDK 53: remote push removed; skip to avoid the console error.
    // Local scheduled notifications are also unavailable in Expo Go on Android
    // without a dev build, so we gracefully return null.
    return null;
  }
  if (!_Notif) {
    _Notif = await import('expo-notifications');

    // Configure foreground behaviour once on first load
    _Notif.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
  return _Notif;
}

export async function requestNotifPermission(): Promise<boolean> {
  const Notif = await getNotif();
  if (!Notif) return false; // Expo Go — silently skip

  if (Platform.OS === 'android') {
    await Notif.setNotificationChannelAsync('reminders', {
      name: 'Kisan Reminders',
      importance: Notif.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2E7D32',
      sound: 'default',
    });
  }

  const { status: existing } = await Notif.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notif.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleTaskNotif(
  task: ReminderTask,
  title: string,
  body: string,
): Promise<string | null> {
  const Notif = await getNotif();
  if (!Notif) return null; // Expo Go — silently skip

  try {
    const granted = await requestNotifPermission();
    if (!granted) return null;

    // Cancel previous notification if one exists
    if (task.notifId) {
      await Notif.cancelScheduledNotificationAsync(task.notifId).catch(() => {});
    }

    const [hStr, mStr] = task.time.split(':');
    const hour   = parseInt(hStr, 10);
    const minute = parseInt(mStr, 10);

    let trigger: import('expo-notifications').NotificationTriggerInput;

    if (task.repeat) {
      trigger = {
        type: Notif.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      };
    } else if (task.date) {
      const [y, mo, d] = task.date.split('-').map(Number);
      const fireDate = new Date(y, mo - 1, d, hour, minute, 0);
      if (fireDate <= new Date()) return null;
      trigger = {
        type: Notif.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      };
    } else {
      const now      = new Date();
      const fireDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
      if (fireDate <= now) fireDate.setDate(fireDate.getDate() + 1);
      trigger = {
        type: Notif.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      };
    }

    const id = await Notif.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { taskId: task.id },
      },
      trigger,
    });
    return id;
  } catch (e) {
    console.warn('scheduleTaskNotif error', e);
    return null;
  }
}

export async function cancelTaskNotif(notifId: string): Promise<void> {
  const Notif = await getNotif();
  if (!Notif) return;
  try {
    await Notif.cancelScheduledNotificationAsync(notifId);
  } catch {}
}
