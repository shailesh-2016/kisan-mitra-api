import { Platform, Alert, Linking } from 'react-native';
import notifee, {
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  TriggerType,
  TimestampTrigger,
  RepeatFrequency,
  AndroidNotificationSetting,
} from '@notifee/react-native';
import { ReminderTask } from './reminderStorage';

const CHANNEL_ID = 'farming-alarm-fullscreen';

export async function requestNotifPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus === 0) return false;

  if (Platform.OS === 'android') {
    if (Platform.Version >= 31) {
      try {
        const settingsInfo = await notifee.getNotificationSettings();
        if (settingsInfo.android?.alarm === AndroidNotificationSetting.DISABLED) {
          Alert.alert(
            'Alarm Permission Required',
            'Smart Reminders ko screen par show karne ke liye "Alarms & Reminders" permission zaroori hai. Kripya settings me jaakar isko ON karein.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => notifee.openAlarmPermissionSettings() }
            ]
          );
          return false;
        }
      } catch (e) {
        console.warn('Notification settings check error:', e);
      }
    }

    // Always ask for Display Over Other Apps permission on Android
    // This solves the Xiaomi/Oppo/Vivo Lock Screen issue.
    // In a real app we'd use AsyncStorage to only ask once, but we need it now for debugging.
    Alert.alert(
      'Lock Screen Permission',
      'Phone lock hone par bhi alarm aane ke liye kripya "Display over other apps" permission ko ON karein.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Turn ON', 
          onPress: async () => {
            try {
              await Linking.sendIntent('android.settings.action.MANAGE_OVERLAY_PERMISSION');
            } catch (err) {
              Linking.openSettings();
            }
          }
        }
      ]
    );

    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Farming Alarms',
      importance: AndroidImportance.HIGH,
      vibration: true,
      vibrationPattern: [300, 500, 300, 500],
      bypassDnd: true,
    });
  }
  return true;
}

// Dedicated helper to check permissions BEFORE entering the Reminders screen
export async function checkReminderPermissions(onSuccess: () => void) {
  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus === 0) {
    Alert.alert('Permission Denied', 'Notifications permission is required.');
    return;
  }

  if (Platform.OS === 'android' && Platform.Version >= 31) {
    try {
      const settingsInfo = await notifee.getNotificationSettings();
      if (settingsInfo.android?.alarm === AndroidNotificationSetting.DISABLED) {
        Alert.alert(
          'Alarm Permission Required',
          'Smart Reminders ko screen par show karne ke liye "Alarms & Reminders" permission zaroori hai. Kripya settings me jaakar isko ON karein.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => notifee.openAlarmPermissionSettings() }
          ]
        );
        return;
      }
    } catch (e) {
      console.warn('Notification settings check error:', e);
    }
  }

  // If we made it here, core permissions are granted. 
  // We'll prompt for Overlay as a warning if needed, but we let them proceed.
  if (Platform.OS === 'android') {
    Alert.alert(
      'Lock Screen Permission',
      'Agar phone lock hone par alarm screen nahi aa raha hai, toh kripya "Display over other apps" permission ko ON karein. Agar aapne already ON kar diya hai toh "Continue" dabayein.',
      [
        { text: 'Turn ON (Settings)', onPress: async () => {
            try {
              await Linking.sendIntent('android.settings.action.MANAGE_OVERLAY_PERMISSION');
            } catch (err) {
              Linking.openSettings();
            }
          }
        },
        { text: 'Continue', onPress: onSuccess }
      ]
    );
  } else {
    onSuccess();
  }
}

export async function scheduleAlarmNotification(
  task: ReminderTask,
  title: string,
  body: string
): Promise<string | null> {
  try {
    const granted = await requestNotifPermission();
    if (!granted) return null;

    if (task.notifId) {
      await notifee.cancelNotification(task.notifId).catch(() => {});
    }

    const [hStr, mStr] = task.time.split(':');
    const hour = parseInt(hStr, 10);
    const minute = parseInt(mStr, 10);

    const now = new Date();
    let fireDate = new Date();

    if (task.date) {
      const [y, mo, d] = task.date.split('-').map(Number);
      fireDate = new Date(y, mo - 1, d, hour, minute, 0);
      if (fireDate <= now) return null; // past date
    } else {
      fireDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
      if (fireDate <= now) fireDate.setDate(fireDate.getDate() + 1); // next day
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: fireDate.getTime(),
      repeatFrequency: task.repeat ? RepeatFrequency.DAILY : undefined,
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    const notifId = `task-${task.id}-${Date.now()}`;

    await notifee.createTriggerNotification(
      {
        id: notifId,
        title,
        body,
        data: { taskId: task.id },
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
          category: AndroidCategory.ALARM,
          fullScreenAction: {
            id: 'default', // Launches the main activity automatically
            mainComponent: 'main',
          },
          actions: [
            { title: 'Dismiss', pressAction: { id: 'DISMISS' } },
            { title: 'Snooze', pressAction: { id: 'SNOOZE' } },
          ],
        },
      },
      trigger
    );

    return notifId;
  } catch (e) {
    console.warn('scheduleAlarmNotification error', e);
    return null;
  }
}

export async function cancelAlarmNotification(notifId: string): Promise<void> {
  try {
    await notifee.cancelNotification(notifId);
  } catch {}
}
