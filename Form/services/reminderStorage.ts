import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReminderTask {
  id: string;
  name: string;
  time: string;       // "HH:MM" 24h format
  date?: string;      // "YYYY-MM-DD" optional
  repeat: boolean;    // daily repeat
  status: 'pending' | 'completed';
  notifId?: string;   // expo notification id
  createdAt: number;
}

const KEY = 'kisan_reminders';

export async function loadTasks(): Promise<ReminderTask[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveTasks(tasks: ReminderTask[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(tasks));
}

export async function addTask(task: ReminderTask): Promise<void> {
  const tasks = await loadTasks();
  await saveTasks([task, ...tasks]);
}

export async function updateTask(id: string, patch: Partial<ReminderTask>): Promise<void> {
  const tasks = await loadTasks();
  await saveTasks(tasks.map(t => (t.id === id ? { ...t, ...patch } : t)));
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await loadTasks();
  await saveTasks(tasks.filter(t => t.id !== id));
}
