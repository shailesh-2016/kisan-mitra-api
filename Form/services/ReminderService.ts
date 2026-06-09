import { Audio } from 'expo-av';
import { Vibration } from 'react-native';
import * as Notifications from 'expo-notifications';
import notifee, { EventType } from '@notifee/react-native';
import { router } from 'expo-router';
import { updateTask, getTaskById } from './reminderStorage';
import { scheduleAlarmNotification, cancelAlarmNotification } from './NotificationHelper';

let alarmSound: Audio.Sound | null = null;
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
    const PATTERN = [0, 1000, 1000]; // wait 0ms, vibrate 1s, wait 1s
    Vibration.vibrate(PATTERN, true);

  } catch (error) {
    console.error('Failed to start alarm audio/vibration:', error);
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

  Vibration.cancel();
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

export function initReminderService() {
  notifee.onForegroundEvent(async ({ type, detail }) => {
    const data = detail.notification?.data as any;
    if (!data || !data.taskId) return;
    
    const taskIdStr = String(data.taskId);

    switch (type) {
      case EventType.DELIVERED:
        router.push({ pathname: '/alarm', params: { taskId: taskIdStr } });
        break;
      case EventType.ACTION_PRESS:
        if (detail.pressAction?.id === 'COMPLETE') {
          await completeAlarm(taskIdStr);
        } else if (detail.pressAction?.id === 'SNOOZE') {
          await snoozeAlarm(taskIdStr);
        } else if (detail.pressAction?.id === 'DISMISS') {
          await dismissAlarm(taskIdStr);
        }
        break;
      case EventType.PRESS:
        router.push({ pathname: '/alarm', params: { taskId: taskIdStr } });
        break;
    }
  });
}

// Global Background Event Handler for Notifee
notifee.onBackgroundEvent(async ({ type, detail }) => {
  const data = detail.notification?.data as any;
  if (!data || !data.taskId) return;

  const taskIdStr = String(data.taskId);

  switch (type) {
    case EventType.DELIVERED:
      // In Android, full-screen intent handles showing the app.
      break;
    case EventType.ACTION_PRESS:
      if (detail.pressAction?.id === 'COMPLETE') {
        await completeAlarm(taskIdStr);
      } else if (detail.pressAction?.id === 'SNOOZE') {
        await snoozeAlarm(taskIdStr);
      } else if (detail.pressAction?.id === 'DISMISS') {
        await dismissAlarm(taskIdStr);
      }
      break;
  }
});
