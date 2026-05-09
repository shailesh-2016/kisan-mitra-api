/**
 * notificationService.ts
 * Smart notification engine for Kisan Mitra.
 * Generates, stores, and manages dynamic notifications.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

// ── Types ─────────────────────────────────────────────────────────────────────
export type NotifCategory =
  | 'weather' | 'mandi' | 'reminder' | 'subsidy'
  | 'machine' | 'govt' | 'insight' | 'system';

export type NotifPriority = 'high' | 'medium' | 'low';

export interface AppNotification {
  id:         string;
  category:   NotifCategory;
  priority:   NotifPriority;
  icon:       string;
  iconBg:     string;
  iconColor:  string;
  title:      string;
  message:    string;
  time:       string;       // display string e.g. "2 hours ago"
  createdAt:  number;       // timestamp ms
  expiresAt:  number;       // timestamp ms (24h after creation)
  read:       boolean;
}

const STORAGE_KEY = '@kisan_notifications_v2';
const TTL_MS      = 24 * 60 * 60 * 1000; // 24 hours

// ── Category meta ─────────────────────────────────────────────────────────────
export const CATEGORY_META: Record<NotifCategory, { icon: string; iconBg: string; iconColor: string; labelKey: string }> = {
  weather:  { icon: 'partly-sunny',    iconBg: '#E3F2FD', iconColor: '#1565C0', labelKey: 'notif.catWeather'  },
  mandi:    { icon: 'trending-up',     iconBg: '#E8F5E9', iconColor: '#2E7D32', labelKey: 'notif.catMandi'    },
  reminder: { icon: 'alarm',           iconBg: '#FFF8E1', iconColor: '#F57F17', labelKey: 'notif.catReminder' },
  subsidy:  { icon: 'cash',            iconBg: '#F3E5F5', iconColor: '#7B1FA2', labelKey: 'notif.catSubsidy'  },
  machine:  { icon: 'construct',       iconBg: '#FCE4EC', iconColor: '#C62828', labelKey: 'notif.catMachine'  },
  govt:     { icon: 'shield-checkmark',iconBg: '#E8F5E9', iconColor: '#1B5E20', labelKey: 'notif.catGovt'     },
  insight:  { icon: 'bulb',            iconBg: '#FFFDE7', iconColor: '#F9A825', labelKey: 'notif.catInsight'  },
  system:   { icon: 'information-circle', iconBg: '#F5F5F5', iconColor: '#616161', labelKey: 'notif.catSystem' },
};

// ── Storage helpers ───────────────────────────────────────────────────────────
export async function loadNotifications(): Promise<AppNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const all: AppNotification[] = raw ? JSON.parse(raw) : [];
    // Auto-delete expired
    const now   = Date.now();
    const valid = all.filter(n => n.expiresAt > now);
    if (valid.length !== all.length) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return [];
  }
}

export async function saveNotifications(notifs: AppNotification[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
}

export async function addNotification(n: Omit<AppNotification, 'id' | 'createdAt' | 'expiresAt' | 'read' | 'time'>): Promise<void> {
  const existing = await loadNotifications();
  const now      = Date.now();
  const notif: AppNotification = {
    ...n,
    id:        `${now}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    expiresAt: now + TTL_MS,
    read:      false,
    time:      formatRelativeTime(now),
  };
  // Deduplicate: skip if same category+title added in last 6 hours
  const sixHours = 6 * 60 * 60 * 1000;
  const isDup = existing.some(e =>
    e.category === notif.category &&
    e.title    === notif.title &&
    now - e.createdAt < sixHours
  );
  if (!isDup) {
    await saveNotifications([notif, ...existing]);
  }
}

export async function markAllRead(): Promise<void> {
  const notifs = await loadNotifications();
  await saveNotifications(notifs.map(n => ({ ...n, read: true })));
}

export async function deleteNotification(id: string): Promise<void> {
  const notifs = await loadNotifications();
  await saveNotifications(notifs.filter(n => n.id !== id));
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

// ── Time formatter ────────────────────────────────────────────────────────────
export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return i18n.t('notif.justNow');
  if (mins < 60) return `${mins} ${i18n.t('notif.minsAgo')}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} ${i18n.t('notif.hoursAgo')}`;
  const days = Math.floor(hrs / 24);
  return `${days} ${i18n.t('notif.daysAgo')}`;
}

// ── Weather notification generator ───────────────────────────────────────────
export async function generateWeatherNotifications(weatherData: {
  temp: number;
  humidity: number;
  windSpeed: number;
  rainChance: number;
  iconCode: string;
  hourlyForecast?: Array<{ time: string; icon: string; temp: string; pop?: number }>;
}): Promise<void> {
  const { temp, humidity, windSpeed, rainChance, iconCode } = weatherData;
  const lang = i18n.language?.startsWith('hi') ? 'hi' : i18n.language?.startsWith('gu') ? 'gu' : 'en';

  const notifs: Array<Omit<AppNotification, 'id' | 'createdAt' | 'expiresAt' | 'read' | 'time'>> = [];

  // Rain alert
  if (rainChance >= 50 || iconCode.startsWith('09') || iconCode.startsWith('10')) {
    notifs.push({
      category: 'weather', priority: 'high',
      icon: 'rainy', iconBg: '#E3F2FD', iconColor: '#1565C0',
      title: i18n.t('notif.rainTitle'),
      message: i18n.t('notif.rainMsg', { chance: rainChance }),
    });
  }

  // Thunderstorm
  if (iconCode.startsWith('11')) {
    notifs.push({
      category: 'weather', priority: 'high',
      icon: 'thunderstorm', iconBg: '#EDE7F6', iconColor: '#4527A0',
      title: i18n.t('notif.thunderTitle'),
      message: i18n.t('notif.thunderMsg'),
    });
  }

  // High temperature
  if (temp > 38) {
    notifs.push({
      category: 'weather', priority: 'high',
      icon: 'thermometer', iconBg: '#FBE9E7', iconColor: '#BF360C',
      title: i18n.t('notif.heatTitle'),
      message: i18n.t('notif.heatMsg', { temp: Math.round(temp) }),
    });
  } else if (temp > 35) {
    notifs.push({
      category: 'weather', priority: 'medium',
      icon: 'thermometer', iconBg: '#FFF3E0', iconColor: '#E65100',
      title: i18n.t('notif.warmTitle'),
      message: i18n.t('notif.warmMsg', { temp: Math.round(temp) }),
    });
  }

  // High humidity
  if (humidity > 80) {
    notifs.push({
      category: 'weather', priority: 'medium',
      icon: 'water', iconBg: '#E0F7FA', iconColor: '#006064',
      title: i18n.t('notif.humidTitle'),
      message: i18n.t('notif.humidMsg', { humidity }),
    });
  }

  // Strong wind
  if (windSpeed > 40) {
    notifs.push({
      category: 'weather', priority: 'high',
      icon: 'leaf', iconBg: '#FFEBEE', iconColor: '#C62828',
      title: i18n.t('notif.windTitle'),
      message: i18n.t('notif.windMsg', { speed: Math.round(windSpeed) }),
    });
  } else if (windSpeed > 25) {
    notifs.push({
      category: 'weather', priority: 'medium',
      icon: 'leaf', iconBg: '#FFF3E0', iconColor: '#E65100',
      title: i18n.t('notif.windModTitle'),
      message: i18n.t('notif.windModMsg', { speed: Math.round(windSpeed) }),
    });
  }

  // Good weather for harvest
  if (iconCode.startsWith('01') && temp >= 20 && temp <= 32) {
    notifs.push({
      category: 'insight', priority: 'low',
      icon: 'sunny', iconBg: '#FFFDE7', iconColor: '#F9A825',
      title: i18n.t('notif.clearTitle'),
      message: i18n.t('notif.clearMsg'),
    });
  }

  for (const n of notifs) {
    await addNotification(n);
  }
}

// ── Static scheme/subsidy notifications ──────────────────────────────────────
export async function generateSchemeNotifications(): Promise<void> {
  const schemes = [
    {
      category: 'govt' as NotifCategory, priority: 'medium' as NotifPriority,
      icon: 'cash', iconBg: '#E8F5E9', iconColor: '#2E7D32',
      title: i18n.t('notif.pmKisanTitle'),
      message: i18n.t('notif.pmKisanMsg'),
    },
    {
      category: 'subsidy' as NotifCategory, priority: 'medium' as NotifPriority,
      icon: 'water', iconBg: '#E0F7FA', iconColor: '#006064',
      title: i18n.t('notif.dripSubsidyTitle'),
      message: i18n.t('notif.dripSubsidyMsg'),
    },
    {
      category: 'govt' as NotifCategory, priority: 'low' as NotifPriority,
      icon: 'shield-checkmark', iconBg: '#E3F2FD', iconColor: '#1565C0',
      title: i18n.t('notif.fasalBimaTitle'),
      message: i18n.t('notif.fasalBimaMsg'),
    },
  ];

  // Only add one random scheme notification per day
  const today = new Date().toDateString();
  const lastKey = '@kisan_last_scheme_notif';
  const last = await AsyncStorage.getItem(lastKey);
  if (last === today) return;

  const pick = schemes[Math.floor(Math.random() * schemes.length)];
  await addNotification(pick);
  await AsyncStorage.setItem(lastKey, today);
}

// ── Reminder-based notifications ──────────────────────────────────────────────
export async function generateReminderNotifications(reminders: Array<{ name: string; time: string; status: string }>): Promise<void> {
  const now     = new Date();
  const nowMins = now.getHours() * 60 + now.getMinutes();

  for (const r of reminders) {
    if (r.status === 'completed') continue;
    const [h, m] = r.time.split(':').map(Number);
    const taskMins = h * 60 + m;
    const diff     = taskMins - nowMins;

    // Notify if task is within next 30 minutes
    if (diff >= 0 && diff <= 30) {
      await addNotification({
        category: 'reminder', priority: 'high',
        icon: 'alarm', iconBg: '#FFF8E1', iconColor: '#F57F17',
        title: i18n.t('notif.reminderTitle'),
        message: i18n.t('notif.reminderMsg', { name: r.name, time: r.time }),
      });
    }
  }
}

// ── Machine notifications ─────────────────────────────────────────────────────
export async function generateMachineNotifications(machines: Array<{ machineName: string; entries?: any[] }>): Promise<void> {
  if (!machines?.length) return;

  const today = new Date().toDateString();
  const lastKey = '@kisan_last_machine_notif';
  const last = await AsyncStorage.getItem(lastKey);
  if (last === today) return;

  const machine = machines[0];
  const entryCount = machine.entries?.length || 0;

  if (entryCount > 0) {
    await addNotification({
      category: 'machine', priority: 'low',
      icon: 'construct', iconBg: '#FCE4EC', iconColor: '#C62828',
      title: i18n.t('notif.machineTitle'),
      message: i18n.t('notif.machineMsg', { name: machine.machineName, count: entryCount }),
    });
    await AsyncStorage.setItem(lastKey, today);
  }
}

// ── Mandi price notification ──────────────────────────────────────────────────
export async function generateMandiNotification(cropName: string, price: number, change: number): Promise<void> {
  if (Math.abs(change) < 50) return; // Only notify for significant changes

  const isUp = change > 0;
  await addNotification({
    category: 'mandi', priority: isUp ? 'medium' : 'high',
    icon: isUp ? 'trending-up' : 'trending-down',
    iconBg: isUp ? '#E8F5E9' : '#FFEBEE',
    iconColor: isUp ? '#2E7D32' : '#C62828',
    title: i18n.t(isUp ? 'notif.mandiUpTitle' : 'notif.mandiDownTitle', { crop: cropName }),
    message: i18n.t(isUp ? 'notif.mandiUpMsg' : 'notif.mandiDownMsg', {
      crop: cropName, price, change: Math.abs(change),
    }),
  });
}

// ── Sort by priority ──────────────────────────────────────────────────────────
export function sortByPriority(notifs: AppNotification[]): AppNotification[] {
  const ORDER: Record<NotifPriority, number> = { high: 0, medium: 1, low: 2 };
  return [...notifs].sort((a, b) => {
    // Unread first, then by priority, then by time
    if (a.read !== b.read) return a.read ? 1 : -1;
    const pd = ORDER[a.priority] - ORDER[b.priority];
    if (pd !== 0) return pd;
    return b.createdAt - a.createdAt;
  });
}
