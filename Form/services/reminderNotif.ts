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

import { ReminderTask } from './reminderStorage';
import * as NotificationHelper from './NotificationHelper';

export async function requestNotifPermission(): Promise<boolean> {
  return await NotificationHelper.requestNotifPermission();
}

export async function scheduleTaskNotif(
  task: ReminderTask,
  title: string,
  body: string,
): Promise<string | null> {
  return await NotificationHelper.scheduleAlarmNotification(task, title, body);
}

export async function cancelTaskNotif(notifId: string): Promise<void> {
  await NotificationHelper.cancelAlarmNotification(notifId);
}
