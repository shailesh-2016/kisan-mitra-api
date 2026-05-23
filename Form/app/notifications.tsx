import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, Animated, RefreshControl,
  Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { requireAuth } from '../utils/authGuard';
import {
  AppNotification, NotifCategory, NotifPriority,
  loadNotifications, markAllRead, deleteNotification,
  sortByPriority, formatRelativeTime, generateWeatherNotifications,
  generateSchemeNotifications, generateReminderNotifications,
  generateMachineNotifications, CATEGORY_META,
} from '../services/notificationService';
import { fetchCurrentWeather, fetchForecast } from '../services/weatherApi';
import { loadTasks } from '../services/reminderStorage';
import { machineAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Priority colors ───────────────────────────────────────────────────────────
const PRIORITY_COLOR: Record<NotifPriority, string> = {
  high:   '#EF4444',
  medium: '#F59E0B',
  low:    '#22C55E',
};

const PRIORITY_BG: Record<NotifPriority, string> = {
  high:   '#FEF2F2',
  medium: '#FFFBEB',
  low:    '#F0FDF4',
};

// ── Settings key ─────────────────────────────────────────────────────────────
const SETTINGS_KEY = '@kisan_notif_settings';

interface NotifSettings {
  weather:  boolean;
  mandi:    boolean;
  reminder: boolean;
  subsidy:  boolean;
  machine:  boolean;
}

const DEFAULT_SETTINGS: NotifSettings = {
  weather: true, mandi: true, reminder: true, subsidy: true, machine: true,
};

// ── Notification Card ─────────────────────────────────────────────────────────
function NotifCard({
  notif, onDelete, theme,
}: {
  notif: AppNotification;
  onDelete: (id: string) => void;
  theme: any;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handleDelete = () => {
    Animated.parallel([
      Animated.timing(scaleAnim,   { toValue: 0.92, duration: 150, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0,    duration: 200, useNativeDriver: true }),
    ]).start(() => onDelete(notif.id));
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
      <View
        style={[
          nc.card,
          { backgroundColor: notif.read ? theme.surface : PRIORITY_BG[notif.priority] },
          !notif.read && { borderLeftWidth: 3, borderLeftColor: PRIORITY_COLOR[notif.priority] },
        ]}
      >
        {/* Icon */}
        <View style={[nc.iconWrap, { backgroundColor: notif.iconBg }]}>
          <Ionicons name={notif.icon as any} size={22} color={notif.iconColor} />
        </View>

        {/* Content */}
        <View style={nc.content}>
          {/* Top row: title + priority dot */}
          <View style={nc.topRow}>
            <Text style={[nc.title, { color: theme.text }]} numberOfLines={1}>
              {notif.title}
            </Text>
            <View style={[nc.priorityDot, { backgroundColor: PRIORITY_COLOR[notif.priority] }]} />
          </View>

          {/* Message */}
          <Text style={[nc.message, { color: theme.textSecondary }]} numberOfLines={2}>
            {notif.message}
          </Text>

          {/* Footer: category badge + time + delete */}
          <View style={nc.footer}>
            <View style={[nc.catBadge, { backgroundColor: notif.iconBg }]}>
              <Ionicons name={notif.icon as any} size={10} color={notif.iconColor} />
              <Text style={[nc.catText, { color: notif.iconColor }]}>
                {CATEGORY_META[notif.category]?.labelKey
                  ? notif.category.charAt(0).toUpperCase() + notif.category.slice(1)
                  : notif.category}
              </Text>
            </View>
            <Text style={[nc.time, { color: theme.textMuted }]}>
              {formatRelativeTime(notif.createdAt)}
            </Text>
            <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="trash-outline" size={15} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const nc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
    alignItems: 'flex-start',
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  content: { flex: 1, gap: 4 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: '700', letterSpacing: -0.1 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  message: { fontSize: FONT_SIZE.sm, lineHeight: 19 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  catBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderRadius: RADIUS.full, paddingHorizontal: 7, paddingVertical: 2,
  },
  catText: { fontSize: 10, fontWeight: '700' },
  time: { flex: 1, fontSize: 10, fontWeight: '500' },
});

// ── Settings Panel ────────────────────────────────────────────────────────────
function SettingsPanel({ settings, onChange, theme, t }: {
  settings: NotifSettings;
  onChange: (key: keyof NotifSettings, val: boolean) => void;
  theme: any;
  t: any;
}) {
  const rows: Array<{ key: keyof NotifSettings; icon: string; color: string; bg: string }> = [
    { key: 'weather',  icon: 'partly-sunny',     color: '#1565C0', bg: '#E3F2FD' },
    { key: 'mandi',    icon: 'trending-up',       color: '#2E7D32', bg: '#E8F5E9' },
    { key: 'reminder', icon: 'alarm',             color: '#F57F17', bg: '#FFF8E1' },
    { key: 'subsidy',  icon: 'cash',              color: '#7B1FA2', bg: '#F3E5F5' },
    { key: 'machine',  icon: 'construct',         color: '#C62828', bg: '#FCE4EC' },
  ];

  return (
    <View style={[sp.panel, { backgroundColor: theme.surface }]}>
      <Text style={[sp.heading, { color: theme.text }]}>{t('notif.settings')}</Text>
      {rows.map((row, i) => (
        <View
          key={row.key}
          style={[sp.row, i < rows.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}
        >
          <View style={[sp.iconWrap, { backgroundColor: row.bg }]}>
            <Ionicons name={row.icon as any} size={16} color={row.color} />
          </View>
          <Text style={[sp.label, { color: theme.text }]}>{t(`notif.setting_${row.key}`)}</Text>
          <Switch
            value={settings[row.key]}
            onValueChange={v => onChange(row.key, v)}
            trackColor={{ false: '#E5E7EB', true: COLORS.primary + '60' }}
            thumbColor={settings[row.key] ? COLORS.primary : '#9CA3AF'}
          />
        </View>
      ))}
    </View>
  );
}

const sp = StyleSheet.create({
  panel: { borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.sm },
  heading: { fontSize: FONT_SIZE.md, fontWeight: '800', marginBottom: SPACING.sm, letterSpacing: -0.2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: 12 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: '600' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const { t }    = useTranslation();
  const router   = useRouter();
  const { theme, isDark } = useTheme();
  const { isLoggedIn }    = useAuth();

  const [notifs,      setNotifs]      = useState<AppNotification[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [generating,  setGenerating]  = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings,    setSettings]    = useState<NotifSettings>(DEFAULT_SETTINGS);

  // ── Load settings ──
  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then(raw => {
      if (raw) setSettings(JSON.parse(raw));
    });
  }, []);

  const updateSetting = async (key: keyof NotifSettings, val: boolean) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  // ── Load notifications ──
  const loadNotifs = useCallback(async () => {
    const all = await loadNotifications();
    setNotifs(sortByPriority(all));
    setLoading(false);
  }, []);

  // ── Generate fresh notifications ──
  const generateNotifs = useCallback(async () => {
    setGenerating(true);
    try {
      // Weather
      if (settings.weather) {
        try {
          const [current, forecast] = await Promise.all([
            fetchCurrentWeather(),
            fetchForecast(),
          ]);
          const iconCode   = current.weather[0].icon;
          const temp       = current.main.temp;
          const humidity   = current.main.humidity;
          const windSpeed  = current.wind.speed * 3.6;
          const rainChance = Math.round((forecast?.list?.[0]?.pop || 0) * 100);
          await generateWeatherNotifications({ temp, humidity, windSpeed, rainChance, iconCode });
        } catch {}
      }

      // Schemes & subsidies
      if (settings.subsidy) {
        await generateSchemeNotifications();
      }

      // Reminders
      if (settings.reminder) {
        try {
          const tasks = await loadTasks();
          await generateReminderNotifications(tasks);
        } catch {}
      }

      // Machines
      if (settings.machine && isLoggedIn) {
        try {
          const data = await machineAPI.getAll();
          if (data?.machines) {
            await generateMachineNotifications(data.machines);
          }
        } catch {}
      }

      await loadNotifs();
    } finally {
      setGenerating(false);
    }
  }, [settings, isLoggedIn, loadNotifs]);

  // ── Focus effect: reload + generate ──
  useFocusEffect(
    useCallback(() => {
      loadNotifs();
      generateNotifs();
    }, [loadNotifs, generateNotifs])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await generateNotifs();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const handleMarkAllRead = async () => {
    if (!requireAuth(isLoggedIn, 'Notifications')) return;
    await markAllRead();
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    if (!requireAuth(isLoggedIn, 'Notifications')) return;
    Alert.alert(
      t('notif.clearAllTitle'),
      t('notif.clearAllMsg'),
      [
        { text: t('notif.cancel'), style: 'cancel' },
        {
          text: t('notif.clearAll'), style: 'destructive',
          onPress: async () => {
            const { clearAll } = await import('../services/notificationService');
            await clearAll();
            setNotifs([]);
          },
        },
      ]
    );
  };

  // ── Group by date ──
  const today     = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  const todayNotifs     = notifs.filter(n => new Date(n.createdAt).toDateString() === today);
  const yesterdayNotifs = notifs.filter(n => new Date(n.createdAt).toDateString() === yesterday);
  const olderNotifs     = notifs.filter(n => {
    const d = new Date(n.createdAt).toDateString();
    return d !== today && d !== yesterday;
  });

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      {/* ── Header ── */}
      <View style={[s.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[s.backBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <LinearGradient colors={['#1B5E20', '#43A047']} style={s.headerIcon}>
            <Ionicons name="notifications" size={16} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={[s.headerTitle, { color: theme.text }]}>{t('notif.title')}</Text>
            <Text style={[s.headerSub, { color: theme.textSecondary }]}>{t('notif.subtitle')}</Text>
          </View>
        </View>

        <View style={s.headerActions}>
          {generating && <ActivityIndicator size={14} color={COLORS.primary} style={{ marginRight: 6 }} />}
          <TouchableOpacity
            onPress={() => setShowSettings(p => !p)}
            style={[s.actionBtn, { backgroundColor: theme.inputBg }]}
          >
            <Ionicons name="settings-outline" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Unread banner ── */}
      {unreadCount > 0 && (
        <View style={[s.unreadBanner, { backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary + '30' }]}>
          <View style={[s.unreadPill, { backgroundColor: COLORS.primary }]}>
            <Text style={s.unreadCount}>{unreadCount}</Text>
          </View>
          <Text style={[s.unreadText, { color: theme.text }]}>
            {t('notif.unreadMsg', { count: unreadCount })}
          </Text>
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={[s.markAllText, { color: COLORS.primary }]}>{t('notif.markAll')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Settings panel */}
        {showSettings && (
          <SettingsPanel settings={settings} onChange={updateSetting} theme={theme} t={t} />
        )}

        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[s.loadingText, { color: theme.textSecondary }]}>{t('notif.loading')}</Text>
          </View>
        ) : notifs.length === 0 ? (
          /* ── Empty state ── */
          <View style={s.empty}>
            <LinearGradient colors={['#E8F5E9', '#F1F8E9']} style={s.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={44} color={COLORS.primary} />
            </LinearGradient>
            <Text style={[s.emptyTitle, { color: theme.text }]}>{t('notif.emptyTitle')}</Text>
            <Text style={[s.emptySub, { color: theme.textSecondary }]}>{t('notif.emptySub')}</Text>
            <TouchableOpacity style={s.refreshBtn} onPress={generateNotifs}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={s.refreshBtnTxt}>{t('notif.refresh')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Today */}
            {todayNotifs.length > 0 && (
              <>
                <Text style={[s.sectionLabel, { color: theme.textSecondary }]}>{t('notif.today')}</Text>
                {todayNotifs.map(n => (
                  <NotifCard key={n.id} notif={n} onDelete={handleDelete} theme={theme} />
                ))}
              </>
            )}

            {/* Yesterday */}
            {yesterdayNotifs.length > 0 && (
              <>
                <Text style={[s.sectionLabel, { color: theme.textSecondary }]}>{t('notif.yesterday')}</Text>
                {yesterdayNotifs.map(n => (
                  <NotifCard key={n.id} notif={n} onDelete={handleDelete} theme={theme} />
                ))}
              </>
            )}

            {/* Older */}
            {olderNotifs.length > 0 && (
              <>
                <Text style={[s.sectionLabel, { color: theme.textSecondary }]}>{t('notif.older')}</Text>
                {olderNotifs.map(n => (
                  <NotifCard key={n.id} notif={n} onDelete={handleDelete} theme={theme} />
                ))}
              </>
            )}

            {/* Clear all */}
            <TouchableOpacity style={[s.clearBtn, { borderColor: theme.border }]} onPress={handleClearAll}>
              <Ionicons name="trash-outline" size={15} color={COLORS.red} />
              <Text style={[s.clearBtnTxt, { color: COLORS.red }]}>{t('notif.clearAll')}</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: 12,
    borderBottomWidth: 1, gap: SPACING.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  headerIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: FONT_SIZE.md, fontWeight: '800', letterSpacing: -0.2 },
  headerSub:   { fontSize: 10, fontWeight: '500', marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  unreadBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginHorizontal: SPACING.md, marginTop: SPACING.sm,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 10,
    borderWidth: 1,
  },
  unreadPill: {
    minWidth: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  unreadCount: { fontSize: 11, fontWeight: '800', color: '#fff' },
  unreadText:  { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: '600' },
  markAllText: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },

  sectionLabel: {
    fontSize: FONT_SIZE.xs, fontWeight: '700',
    letterSpacing: 0.8, textTransform: 'uppercase',
    marginBottom: SPACING.sm, marginTop: SPACING.sm,
  },

  loadingWrap: { alignItems: 'center', paddingVertical: 60, gap: SPACING.sm },
  loadingText: { fontSize: FONT_SIZE.sm, fontWeight: '500' },

  empty: { alignItems: 'center', paddingVertical: 60, gap: SPACING.sm },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm,
  },
  emptyTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800', letterSpacing: -0.2 },
  emptySub:   { fontSize: FONT_SIZE.sm, textAlign: 'center', lineHeight: 20 },
  refreshBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    paddingHorizontal: 20, paddingVertical: 10, marginTop: SPACING.sm,
  },
  refreshBtnTxt: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: '#fff' },

  clearBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: RADIUS.md, paddingVertical: 12,
    borderWidth: 1, marginTop: SPACING.md,
  },
  clearBtnTxt: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
});
