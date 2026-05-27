import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ReminderTask } from './reminderStorage';

// Configure default notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CHANNEL_ID = 'farming-alarm-channel';

export async function requestNotifPermission(): Promise<boolean> {
  // Create Android high-importance notification channel with custom sound & vibration
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Farming Alarms',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500, 250, 500],
      lightColor: '#2E7D32',
      sound: 'farming_alarm.mp3', // Configured in app.json plugins
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });
  }

  // Register the interactive categories for actions
  await Notifications.setNotificationCategoryAsync('FARMING_REMINDER', [
    {
      identifier: 'COMPLETE',
      buttonTitle: 'Mark Completed',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'SNOOZE',
      buttonTitle: 'Snooze (5m)',
      options: { opensAppToForeground: false },
    },
    {
      identifier: 'DISMISS',
      buttonTitle: 'Dismiss',
      options: { isDestructive: true, opensAppToForeground: false },
    },
  ]);

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleAlarmNotification(
  task: ReminderTask,
  title: string,
  body: string
): Promise<string | null> {
  try {
    const granted = await requestNotifPermission();
    if (!granted) return null;

    // Clean up existing notification if it was already scheduled
    if (task.notifId) {
      await Notifications.cancelScheduledNotificationAsync(task.notifId).catch(() => {});
    }

    const [hStr, mStr] = task.time.split(':');
    const hour = parseInt(hStr, 10);
    const minute = parseInt(mStr, 10);

    let trigger: Notifications.NotificationTriggerInput;

    if (task.repeat) {
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      };
    } else if (task.date) {
      const [y, mo, d] = task.date.split('-').map(Number);
      const fireDate = new Date(y, mo - 1, d, hour, minute, 0);
      if (fireDate <= new Date()) return null;
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      };
    } else {
      const now = new Date();
      const fireDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
      if (fireDate <= now) fireDate.setDate(fireDate.getDate() + 1);
      trigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      };
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'farming_alarm.mp3', // Custom alarm sound for iOS / Legacy Android
        priority: Notifications.AndroidNotificationPriority.MAX, // Max priority
        categoryIdentifier: 'FARMING_REMINDER', // Actions category
        data: { taskId: task.id },
      },
      trigger,
    });
    return id;
  } catch (e) {
    console.warn('scheduleAlarmNotification error', e);
    return null;
  }
}

export async function cancelAlarmNotification(notifId: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notifId);
  } catch {}
}
