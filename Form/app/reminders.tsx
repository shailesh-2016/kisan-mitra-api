/**
 * reminders.tsx — Premium Smart Reminder Screen
 * Upgraded with Reanimated animations, priority system,
 * countdown timers, full-screen alert modal, and premium UI.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Alert, Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  withSequence, withDelay, FadeInDown, FadeInUp, Layout,
  SlideOutRight, ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { COLORS, SHADOW, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import {
  loadTasks, updateTask, deleteTask, addTask, ReminderTask,
} from '../services/reminderStorage';
import { cancelTaskNotif, scheduleTaskNotif, requestNotifPermission } from '../services/reminderNotif';
import PageHeader from '../components/PageHeader';
import ReminderAlertModal from '../components/ReminderAlertModal';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { requireAuth } from '../utils/authGuard';

const { width: W } = Dimensions.get('window');

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function getMinutesUntil(time: string): number {
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const taskMins = h * 60 + m;
  const nowMins  = now.getHours() * 60 + now.getMinutes();
  let diff = taskMins - nowMins;
  if (diff < 0) diff += 24 * 60; // next day
  return diff;
}

function formatCountdown(mins: number): string {
  if (mins <= 0)   return '🔔 Now';
  if (mins < 60)   return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getTaskEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('water') || lower.includes('पानी') || lower.includes('પાણી')) return '💧';
  if (lower.includes('spray') || lower.includes('fertiliz') || lower.includes('खाद') || lower.includes('ખાતર')) return '🌿';
  if (lower.includes('harvest') || lower.includes('कटाई') || lower.includes('કાપ')) return '🌾';
  if (lower.includes('soil') || lower.includes('मिट्टी') || lower.includes('માટી')) return '🪱';
  if (lower.includes('market') || lower.includes('मंडी') || lower.includes('મંડી')) return '🏪';
  if (lower.includes('pest') || lower.includes('कीट') || lower.includes('જીવ')) return '🐛';
  if (lower.includes('tractor') || lower.includes('ट्रैक्टर') || lower.includes('ટ્રેક')) return '🚜';
  return '⏰';
}

// Priority based on time remaining
function getPriority(mins: number): 'high' | 'medium' | 'low' {
  if (mins <= 30)  return 'high';
  if (mins <= 120) return 'medium';
  return 'low';
}

const PRIORITY_COLORS = {
  high:   { strip: '#D32F2F', bg: '#FFEBEE', text: '#D32F2F', dot: '#FF5252' },
  medium: { strip: '#F57F17', bg: '#FFF8E1', text: '#F57F17', dot: '#FFD740' },
  low:    { strip: '#2E7D32', bg: '#E8F5E9', text: '#2E7D32', dot: '#69F0AE' },
};

// ── Animated Countdown Dot ────────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.5, { duration: 500 }),
      withTiming(1.0, { duration: 500 }),
    );
    const interval = setInterval(() => {
      scale.value = withSequence(
        withTiming(1.5, { duration: 500 }),
        withTiming(1.0, { duration: 500 }),
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[
      { width: 8, height: 8, borderRadius: 4, backgroundColor: color },
      style,
    ]} />
  );
}

// ── Task Card ─────────────────────────────────────────────────────────────────
function TaskCard({
  task, index, onComplete, onDelete,
}: {
  task: ReminderTask;
  index: number;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const done = task.status === 'completed';
  const missed = task.status === 'missed';
  const isPast = done || missed;
  const mins = isPast ? 999 : getMinutesUntil(task.time);
  const priority = isPast ? 'low' : getPriority(mins);
  const pc = PRIORITY_COLORS[priority];
  const emoji = getTaskEmoji(task.name);

  // Press scale animation
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn  = () => { scale.value = withSpring(0.97, { damping: 12 }); };
  const onPressOut = () => { scale.value = withSpring(1.0,  { damping: 12 }); };

  // Complete button bounce
  const checkScale = useSharedValue(1);
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  const handleComplete = () => {
    checkScale.value = withSequence(
      withSpring(1.4, { damping: 8 }),
      withSpring(1.0, { damping: 8 }),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setTimeout(onComplete, 150);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      layout={Layout.springify()}
      exiting={SlideOutRight.duration(250)}
      style={pressStyle}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          tc.card,
          { backgroundColor: theme.surface },
          done && { opacity: 0.65 },
        ]}
      >
        {/* Priority strip */}
        <View style={[tc.strip, { backgroundColor: done ? theme.textMuted : pc.strip }]} />

        <View style={tc.body}>
          {/* Emoji icon */}
          <View style={[tc.iconBox, {
            backgroundColor: done ? theme.inputBg : pc.bg,
          }]}>
            <Text style={{ fontSize: 24 }}>{emoji}</Text>
          </View>

          {/* Info */}
          <View style={tc.info}>
            <Text style={[tc.name, { color: theme.text }, done && tc.nameDone, missed && tc.nameMissed]} numberOfLines={2}>
              {task.name}
            </Text>

            <View style={tc.metaRow}>
              <Ionicons name="time-outline" size={12} color={done ? theme.textMuted : pc.strip} />
              <Text style={[tc.time, { color: done ? theme.textMuted : pc.strip }]}>
                {formatTime(task.time)}
              </Text>
              {task.repeat && (
                <>
                  <Text style={[tc.dot, { color: theme.textMuted }]}>·</Text>
                  <Ionicons name="repeat-outline" size={11} color={theme.secondary} />
                  <Text style={[tc.repeatTxt, { color: theme.secondary }]}>{t('reminder.daily')}</Text>
                </>
              )}
            </View>

            {/* Countdown / status pill */}
            {!isPast ? (
              <View style={[tc.countdownPill, { backgroundColor: pc.bg }]}>
                <PulseDot color={pc.dot} />
                <Text style={[tc.countdownTxt, { color: pc.text }]}>
                  {formatCountdown(mins)}
                </Text>
              </View>
            ) : done ? (
              <View style={[tc.statusPill, { backgroundColor: theme.primaryBg }]}>
                <Ionicons name="checkmark-circle" size={11} color={theme.primary} />
                <Text style={[tc.statusTxt, { color: theme.primary }]}>
                  {t('reminder.completed', 'Completed')}
                </Text>
              </View>
            ) : (
              <View style={[tc.statusPill, { backgroundColor: theme.redBg }]}>
                <Ionicons name="close-circle" size={11} color={theme.red} />
                <Text style={[tc.statusTxt, { color: theme.red }]}>
                  {t('reminder.missed', 'Missed')}
                </Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={tc.actions}>
            {!isPast && (
              <Animated.View style={checkStyle}>
                <TouchableOpacity
                  style={[tc.doneBtn, { backgroundColor: theme.primaryBg }]}
                  onPress={handleComplete}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={17} color={theme.primary} />
                </TouchableOpacity>
              </Animated.View>
            )}
            <TouchableOpacity
              style={[tc.delBtn, { backgroundColor: theme.redBg }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                onDelete();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={15} color={theme.red} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const tc = StyleSheet.create({
  card: {
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 10,
    ...SHADOW.md,
  },
  strip: { width: 5 },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconBox: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1, gap: 5 },
  name: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  nameDone: { textDecorationLine: 'line-through' },
  nameMissed: { color: '#D32F2F' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  time: { fontSize: 13, fontWeight: '700' },
  dot: { fontSize: 12 },
  repeatTxt: { fontSize: 11, fontWeight: '600' },
  countdownPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  countdownTxt: { fontSize: 11, fontWeight: '800' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  statusTxt: { fontSize: 10, fontWeight: '700' },
  actions: { gap: 8, alignItems: 'center' },
  doneBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  delBtn: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
});

// ── Animated Stats Card ───────────────────────────────────────────────────────
function StatsRow({ total, pending, completed, missed }: {
  total: number; pending: number; completed: number; missed: number;
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const stats = [
    { label: t('reminder.pending', 'Pending'),   value: pending,   color: '#C2410C',     bg: '#FFF7ED',       icon: 'time-outline'          },
    { label: t('reminder.completed', 'Completed'), value: completed, color: theme.primary, bg: theme.primaryBg, icon: 'checkmark-circle-outline' },
    { label: t('reminder.missed', 'Missed'), value: missed, color: '#D32F2F', bg: '#FFEBEE', icon: 'close-circle-outline' },
  ];

  return (
    <Animated.View entering={FadeInUp.delay(100).springify()}>
      <View style={[sr.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {stats.map((st, i) => (
          <React.Fragment key={st.label}>
            <View style={[sr.item, { backgroundColor: st.bg }]}>
              <Ionicons name={st.icon as any} size={16} color={st.color} />
              <Text style={[sr.val, { color: st.color }]}>{st.value}</Text>
              <Text style={[sr.lbl, { color: theme.textSecondary }]}>{st.label}</Text>
            </View>
            {i < stats.length - 1 && <View style={[sr.div, { backgroundColor: theme.border }]} />}
          </React.Fragment>
        ))}
      </View>
    </Animated.View>
  );
}

const sr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    ...SHADOW.sm,
  },
  item: {
    flex: 1, alignItems: 'center',
    paddingVertical: 14, gap: 3,
  },
  val: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  lbl: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  div: { width: 1, marginVertical: 10 },
});

// ── Animated Empty State ──────────────────────────────────────────────────────
function EmptyState() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const bounce = useSharedValue(0);
  useEffect(() => {
    const loop = () => {
      bounce.value = withSequence(
        withTiming(-12, { duration: 700 }),
        withTiming(0,   { duration: 700 }),
      );
      setTimeout(loop, 2000);
    };
    loop();
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Animated.View entering={ZoomIn.delay(200).springify()} style={es.wrap}>
      <Animated.View style={[es.iconWrap, { backgroundColor: theme.primaryBg }, floatStyle]}>
        <Text style={{ fontSize: 56 }}>🌾</Text>
      </Animated.View>
      <Text style={[es.title, { color: theme.text }]}>{t('reminder.noTasks')}</Text>
      <Text style={[es.sub, { color: theme.textSecondary }]}>{t('reminder.noTasksSub')}</Text>
      <View style={[es.hint, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="bulb-outline" size={14} color={COLORS.secondary} />
        <Text style={[es.hintTxt, { color: theme.textSecondary }]}>{t('reminder.emptyHint')}</Text>
      </View>
    </Animated.View>
  );
}

const es = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 60, gap: 14 },
  iconWrap: {
    width: 100, height: 100, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOW.md,
  },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  sub: { fontSize: 13, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
  hint: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, marginTop: 4,
  },
  hintTxt: { fontSize: 12, fontWeight: '600' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function RemindersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { isLoggedIn } = useAuth();
  const [tasks, setTasks] = useState<ReminderTask[]>([]);

  // Alert modal state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTask, setAlertTask] = useState<ReminderTask | null>(null);

  // Countdown refresh every minute
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  // Check for due reminders every minute
  useEffect(() => {
    if (!alertVisible && tasks.length > 0) {
      const now = new Date();
      const nowMins = now.getHours() * 60 + now.getMinutes();
      const due = tasks.find(task => {
        if (task.status !== 'pending') return false;
        const [h, m] = task.time.split(':').map(Number);
        const taskMins = h * 60 + m;
        return taskMins === nowMins;
      });
      if (due) {
        setAlertTask(due);
        setAlertVisible(true);
      }

      // Check for missed tasks (e.g., passed more than 15 minutes ago)
      tasks.forEach(async (task) => {
         if (task.status === 'pending') {
            const [h, m] = task.time.split(':').map(Number);
            const taskMins = h * 60 + m;
            let diff = taskMins - nowMins;
            // If diff is between -15 and -1440 (yesterday), we consider it missed if it was scheduled for today
            if (diff < -15 && diff > -1440) {
               await updateTask(task.id, { status: 'missed' });
               setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'missed' } : t));
            }
         }
      });
    }
  }, [tick, tasks]);

  const load = useCallback(async () => {
    const data = await loadTasks();
    setTasks(data);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleComplete = async (id: string) => {
    await updateTask(id, { status: 'completed' });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  const handleDelete = (task: ReminderTask) => {
    Alert.alert(
      t('reminder.deleteTitle'),
      t('reminder.deleteConfirm', { name: task.name }),
      [
        { text: t('reminder.cancel'), style: 'cancel' },
        {
          text: t('reminder.delete'), style: 'destructive',
          onPress: async () => {
            if (task.notifId) await cancelTaskNotif(task.notifId);
            await deleteTask(task.id);
            setTasks(prev => prev.filter(t => t.id !== task.id));
          },
        },
      ],
    );
  };

  // Alert modal handlers
  const handleAlertComplete = async () => {
    if (!alertTask) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await handleComplete(alertTask.id);
    setAlertVisible(false);
    setAlertTask(null);
  };

  const handleAlertSnooze = async () => {
    if (!alertTask) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    // Reschedule 10 minutes later
    const [h, m] = alertTask.time.split(':').map(Number);
    const snoozeDate = new Date();
    snoozeDate.setHours(h, m + 10, 0, 0);
    const newTime = `${snoozeDate.getHours().toString().padStart(2, '0')}:${snoozeDate.getMinutes().toString().padStart(2, '0')}`;
    const snoozedTask: ReminderTask = { ...alertTask, time: newTime };
    await updateTask(alertTask.id, { time: newTime });
    setTasks(prev => prev.map(t => t.id === alertTask.id ? { ...t, time: newTime } : t));
    setAlertVisible(false);
    setAlertTask(null);
  };

  const handleAlertDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setAlertVisible(false);
    setAlertTask(null);
  };

  const pending   = tasks.filter(t => t.status === 'pending');
  const completed = tasks.filter(t => t.status === 'completed');
  const missed    = tasks.filter(t => t.status === 'missed');

  // Sort pending by time remaining
  const sortedPending = [...pending].sort((a, b) => getMinutesUntil(a.time) - getMinutesUntil(b.time));

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      <PageHeader
        title={t('reminder.title', 'Smart Reminders')}
        subtitle={t('reminder.subtitle', 'Manage farming tasks & alarms')}
        onBack={() => router.back()}
        iconName="alarm"
        iconColor="#C2410C"
        iconBg="#FFF7ED"
        rightElement={
          tasks.length > 0 ? (
            <View style={[s.badge, { backgroundColor: '#FFF7ED', borderColor: '#C2410C40' }]}>
              <Text style={s.badgeTxt}>{pending.length}</Text>
            </View>
          ) : undefined
        }
      />

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* Stats */}
        {tasks.length > 0 && (
          <StatsRow total={tasks.length} pending={pending.length} completed={completed.length} missed={missed.length} />
        )}

        {/* Empty state */}
        {tasks.length === 0 && <EmptyState />}

        {/* Pending tasks */}
        {sortedPending.length > 0 && (
          <>
            <Animated.Text
              entering={FadeInDown.delay(80)}
              style={[s.sectionLabel, { color: theme.textSecondary }]}
            >
              {t('reminder.pendingTasks')}
            </Animated.Text>
            {sortedPending.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                onComplete={() => handleComplete(task.id)}
                onDelete={() => handleDelete(task)}
              />
            ))}
          </>
        )}

        {/* Completed tasks */}
        {completed.length > 0 && (
          <>
            <Animated.Text
              entering={FadeInDown.delay(120)}
              style={[s.sectionLabel, { color: theme.textSecondary }]}
            >
              {t('reminder.completedTasks', 'Completed')}
            </Animated.Text>
            {completed.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                onComplete={() => handleComplete(task.id)}
                onDelete={() => handleDelete(task)}
              />
            ))}
          </>
        )}

        {/* Missed tasks */}
        {missed.length > 0 && (
          <>
            <Animated.Text
              entering={FadeInDown.delay(140)}
              style={[s.sectionLabel, { color: theme.textSecondary }]}
            >
              {t('reminder.missedTasks', 'Missed')}
            </Animated.Text>
            {missed.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                onComplete={() => handleComplete(task.id)}
                onDelete={() => handleDelete(task)}
              />
            ))}
          </>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* FAB */}
      <Animated.View entering={FadeInUp.delay(300).springify()} style={s.fabWrap}>
        <TouchableOpacity
          style={s.fab}
          activeOpacity={0.85}
          onPress={() => {
            if (!requireAuth(isLoggedIn, 'Smart Reminder')) return;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            router.push('/add-reminder' as any);
          }}
        >
          <LinearGradient colors={['#1B5E20', '#43A047']} style={s.fabGrad}>
            <Ionicons name="add" size={22} color="#FFF" />
            <Text style={s.fabTxt}>{t('reminder.addTask')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Full-screen alert modal */}
      {alertTask && (
        <ReminderAlertModal
          visible={alertVisible}
          taskName={alertTask.name}
          time={alertTask.time}
          priority={getPriority(getMinutesUntil(alertTask.time))}
          onComplete={handleAlertComplete}
          onSnooze={handleAlertSnooze}
          onDismiss={handleAlertDismiss}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  badge: {
    width: 40, height: 40, borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeTxt: { fontSize: 14, fontWeight: '800', color: '#C2410C' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 18 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: 10, marginTop: 6,
  },
  fabWrap: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
  },
  fab: {
    borderRadius: 18, overflow: 'hidden',
    shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  fabGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingVertical: 17,
  },
  fabTxt: { fontSize: 15, fontWeight: '800', color: '#FFF' },
});
