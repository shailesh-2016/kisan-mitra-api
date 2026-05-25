import { updateTaskByNotifId, getTaskByNotifId } from './reminderStorage';
import { scheduleTaskNotif, cancelTaskNotif } from './reminderNotif';
import Constants from 'expo-constants';

const IS_EXPO_GO = Constants.appOwnership === 'expo';

// This listener handles actions chosen by the user when the notification is shown
// It can handle actions even if the app was in the background
export async function registerNotificationHandlers() {
  if (IS_EXPO_GO) return; // Expo Go SDK 53 remote push crash guard

  const Notifications = await import('expo-notifications');

  Notifications.addNotificationResponseReceivedListener(async (response) => {
    const actionIdentifier = response.actionIdentifier;
    const data = response.notification.request.content.data;
    const notifId = response.notification.request.identifier;
    
    if (!data.taskId) return;

    if (actionIdentifier === 'COMPLETE') {
      // Mark as completed
      await updateTaskByNotifId(notifId, { status: 'completed' });
    } else if (actionIdentifier === 'SNOOZE') {
      // Find the task, reschedule it 10 minutes from now
      const task = await getTaskByNotifId(notifId);
      if (task) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 10);
        const newTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        await cancelTaskNotif(notifId); // clean up old notif explicitly
        
        const newTask = { ...task, time: newTime, status: 'pending' as const };
        const newNotifId = await scheduleTaskNotif(newTask, 'Snoozed: ' + task.name, 'Time to get to work!');
        
        if (newNotifId) {
          await updateTaskByNotifId(notifId, { time: newTime, notifId: newNotifId, status: 'pending' });
        }
      }
    } else if (actionIdentifier === 'DISMISS' || actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
      // If they just dismiss or tap the default action, mark as missed if time passes without completion
      // We can just leave it as pending here, and let the app mark it as missed when they open it next time
    }
  });
}
