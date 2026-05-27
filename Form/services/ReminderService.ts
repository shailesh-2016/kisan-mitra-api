import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { updateTask, getTaskById } from './reminderStorage';
import { scheduleAlarmNotification, cancelAlarmNotification } from './NotificationHelper';

let alarmSound: Audio.Sound | null = null;
let vibrationInterval: any = null;
let activeTaskId: string | null = null;

// Starts the alarm sound and vibration loop (for foreground or active Alarm screen)
export async function startAlarmAudio(taskId: string): Promise<void> {
  if (activeTaskId === taskId) return;
  activeTaskId = taskId;

  try {
    // 1. Play & loop the farming alarm custom sound
    if (alarmSound) {
      await alarmSound.unloadAsync().catch(() => {});
    }

    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sounds/farming_alarm.mp3'),
      { shouldPlay: true, isLooping: true, volume: 1.0 }
    );
    alarmSound = sound;
    await alarmSound.playAsync();

    // 2. Continuous heavy vibration loop
    if (vibrationInterval) clearInterval(vibrationInterval);
    vibrationInterval = setInterval(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    }, 1500);

  } catch (error) {
    console.error('Failed to start alarm audio/haptics:', error);
  }
}

// Stops all playing alarm sounds and vibration loop
export async function stopAlarmAudio(): Promise<void> {
  activeTaskId = null;
  
  if (alarmSound) {
    await alarmSound.stopAsync().catch(() => {});
    await alarmSound.unloadAsync().catch(() => {});
    alarmSound = null;
  }

  if (vibrationInterval) {
    clearInterval(vibrationInterval);
    vibrationInterval = null;
  }
}

// Handles user action of Snoozing the alarm by 5 minutes
export async function snoozeAlarm(taskId: string): Promise<void> {
  await stopAlarmAudio();
  const task = await getTaskById(taskId);
  if (!task) return;

  // Reschedule task 5 minutes from now
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  const newTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  if (task.notifId) {
    await cancelAlarmNotification(task.notifId);
  }

  const updatedTask = { ...task, time: newTime, status: 'pending' as const };
  const newNotifId = await scheduleAlarmNotification(updatedTask, '⏰ Kisan Plus Alarm', `Snoozed task: ${task.name}`);
  
  await updateTask(taskId, {
    time: newTime,
    status: 'pending',
    notifId: newNotifId || undefined
  });
}

// Handles completing the task
export async function completeAlarm(taskId: string): Promise<void> {
  await stopAlarmAudio();
  const task = await getTaskById(taskId);
  if (!task) return;

  if (task.notifId) {
    await cancelAlarmNotification(task.notifId);
  }

  await updateTask(taskId, { status: 'completed' });
}

// Handles dismissing the alarm (marking it as pending or missed depending on user choice)
export async function dismissAlarm(taskId: string): Promise<void> {
  await stopAlarmAudio();
}

// Global initialization of the alarm listeners
export function initReminderService() {
  // 1. Listen for notifications arriving while app is in foreground
  Notifications.addNotificationReceivedListener((notification) => {
    const data = notification.request.content.data as any;
    if (data && data.taskId) {
      // Navigate to full-screen alarm immediately
      router.push({ pathname: '/alarm', params: { taskId: String(data.taskId) } });
    }
  });

  // 2. Listen for interactions when a user clicks a notification or notification actions
  Notifications.addNotificationResponseReceivedListener(async (response) => {
    const actionIdentifier = response.actionIdentifier;
    const data = response.notification.request.content.data as any;
    if (!data || !data.taskId) return;

    const taskIdStr = String(data.taskId);

    if (actionIdentifier === 'COMPLETE') {
      await completeAlarm(taskIdStr);
    } else if (actionIdentifier === 'SNOOZE') {
      await snoozeAlarm(taskIdStr);
    } else if (actionIdentifier === 'DISMISS') {
      await dismissAlarm(taskIdStr);
    } else {
      // Default tap on the notification opens the full-screen alarm screen
      router.push({ pathname: '/alarm', params: { taskId: taskIdStr } });
    }
  });
}
