import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, StatusBar, Switch, Alert, FlatList,
  Dimensions, NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, SHADOW } from '../constants/theme';
import { addTask, ReminderTask } from '../services/reminderStorage';
import { scheduleTaskNotif, requestNotifPermission } from '../services/reminderNotif';
import PageHeader from '../components/PageHeader';
import { useTheme } from '../context/ThemeContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const QUICK_TASKS = [
  { key: 'waterCrops',      emoji: '💧' },
  { key: 'sprayFertilizer', emoji: '🌿' },
  { key: 'harvestCrops',    emoji: '🌾' },
  { key: 'soilCheck',       emoji: '🪱' },
  { key: 'marketVisit',     emoji: '🏪' },
  { key: 'pestControl',     emoji: '🐛' },
];

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES  = Array.from({ length: 60 }, (_, i) => i);
const AMPM     = ['AM', 'PM'];

const ITEM_H  = 52;
const VISIBLE = 5;
const DRUM_H  = ITEM_H * VISIBLE;
const PAD     = ITEM_H * Math.floor(VISIBLE / 2);

function pad(n: number) { return n.toString().padStart(2, '0'); }

// ── Drum Picker ───────────────────────────────────────────────────────────────
interface DrumProps {
  data: (number | string)[];
  selected: number;
  onSelect: (idx: number) => void;
  format?: (v: number | string) => string;
  width?: number;
}

function DrumPicker({ data, selected, onSelect, format, width = 72 }: DrumProps) {
  const { theme } = useTheme();
  const ref = useRef<FlatList>(null);
  const scrolling = useRef(false);

  useEffect(() => {
    if (!scrolling.current) {
      ref.current?.scrollToOffset({ offset: selected * ITEM_H, animated: false });
    }
  }, [selected]);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrolling.current = false;
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, data.length - 1));
      onSelect(clamped);
    },
    [data.length, onSelect],
  );

  const onScrollBegin = useCallback(() => { scrolling.current = true; }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: number | string; index: number }) => {
      const isActive = index === selected;
      return (
        <TouchableOpacity
          style={[dp.item, { height: ITEM_H }]}
          onPress={() => {
            onSelect(index);
            ref.current?.scrollToOffset({ offset: index * ITEM_H, animated: true });
          }}
          activeOpacity={0.7}
        >
          <Text style={[
            dp.itemTxt,
            { color: theme.textMuted },
            isActive && { color: theme.primary, fontSize: 26, fontWeight: '800' },
          ]}>
            {format ? format(item) : typeof item === 'number' ? pad(item) : item}
          </Text>
        </TouchableOpacity>
      );
    },
    [selected, format, onSelect, theme],
  );

  return (
    <View style={[dp.wrap, { width }]}>
      {/* Selection highlight */}
      <View style={[
        dp.highlight,
        { backgroundColor: theme.primaryBg, borderColor: theme.primary + '40' },
      ]} pointerEvents="none" />
      <FlatList
        ref={ref}
        data={data}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        contentContainerStyle={{ paddingVertical: PAD }}
        onScrollBeginDrag={onScrollBegin}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, index) => ({ length: ITEM_H, offset: ITEM_H * index, index })}
        style={{ height: DRUM_H }}
        bounces={false}
        nestedScrollEnabled={true}
      />
    </View>
  );
}

const dp = StyleSheet.create({
  wrap: { height: DRUM_H, overflow: 'hidden', position: 'relative' },
  highlight: {
    position: 'absolute',
    top: ITEM_H * Math.floor(VISIBLE / 2),
    left: 0, right: 0,
    height: ITEM_H,
    borderRadius: 12,
    borderWidth: 1.5,
    zIndex: 0,
  },
  item: { alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  itemTxt: { fontSize: 20, fontWeight: '600' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AddReminderScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const now = new Date();
  const initH12  = now.getHours() % 12 || 12;
  const initAmpm = now.getHours() >= 12 ? 1 : 0;

  const [taskName, setTaskName] = useState('');
  const [hourIdx,  setHourIdx]  = useState(initH12 - 1);
  const [minIdx,   setMinIdx]   = useState(now.getMinutes());
  const [ampmIdx,  setAmpmIdx]  = useState(initAmpm);
  const [repeat,   setRepeat]   = useState(false);
  const [saving,   setSaving]   = useState(false);

  const displayH  = HOURS_12[hourIdx];
  const displayM  = MINUTES[minIdx];
  const displayAP = AMPM[ampmIdx];
  const hour24 = ampmIdx === 0
    ? (displayH === 12 ? 0 : displayH)
    : (displayH === 12 ? 12 : displayH + 12);

  const handleQuick = (key: string) => setTaskName(t(`reminder.tasks.${key}`));

  const handleSave = async () => {
    if (!taskName.trim()) {
      Alert.alert('', t('reminder.nameRequired'));
      return;
    }
    setSaving(true);
    try {
      await requestNotifPermission();
      const task: ReminderTask = {
        id: Date.now().toString(),
        name: taskName.trim(),
        time: `${pad(hour24)}:${pad(displayM)}`,
        repeat,
        status: 'pending',
        createdAt: Date.now(),
      };
      const notifId = await scheduleTaskNotif(
        task,
        `⏰ ${t('reminder.notifTitle')}`,
        t('reminder.notifBody', { task: task.name }),
      );
      if (notifId) task.notifId = notifId;
      await addTask(task);
      router.back();
    } catch (e) {
      Alert.alert('Error', String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      <PageHeader
        title={t('reminder.addTask')}
        onBack={() => router.back()}
        iconName="alarm"
        iconColor="#C2410C"
        iconBg="#FFF7ED"
      />

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {/* ── Quick suggestions ── */}
        <Text style={[s.label, { color: theme.textSecondary }]}>{t('reminder.quickSelect')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickRow}>
          {QUICK_TASKS.map(q => {
            const label = t(`reminder.tasks.${q.key}`);
            const active = taskName === label;
            return (
              <TouchableOpacity
                key={q.key}
                style={[
                  s.quickChip,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  active && { borderColor: theme.primary, backgroundColor: theme.primaryBg },
                ]}
                onPress={() => handleQuick(q.key)}
                activeOpacity={0.8}
              >
                <Text style={s.quickEmoji}>{q.emoji}</Text>
                <Text style={[
                  s.quickTxt,
                  { color: theme.textSecondary },
                  active && { color: theme.primary },
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Task name ── */}
        <Text style={[s.label, { color: theme.textSecondary }]}>{t('reminder.taskName')}</Text>
        <View style={[s.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="create-outline" size={20} color={theme.primary} style={s.inputIcon} />
          <TextInput
            style={[s.input, { color: theme.text }]}
            value={taskName}
            onChangeText={setTaskName}
            placeholder={t('reminder.taskNamePlaceholder')}
            placeholderTextColor={theme.textMuted}
            maxLength={80}
          />
        </View>

        {/* ── Drum Time Picker ── */}
        <Text style={[s.label, { color: theme.textSecondary }]}>{t('reminder.selectTime')}</Text>
        <View style={[s.drumCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Column labels */}
          <View style={s.drumLabels}>
            <Text style={[s.drumLabel, { width: 72, color: theme.textSecondary }]}>{t('reminder.hour')}</Text>
            <View style={s.drumSepSpace} />
            <Text style={[s.drumLabel, { width: 72, color: theme.textSecondary }]}>{t('reminder.minute')}</Text>
            <View style={s.drumSepSpace} />
            <Text style={[s.drumLabel, { width: 64, color: theme.textSecondary }]}>AM/PM</Text>
          </View>

          {/* Drums */}
          <View style={s.drumRow}>
            <DrumPicker data={HOURS_12} selected={hourIdx} onSelect={setHourIdx} format={v => pad(v as number)} width={72} />
            <Text style={[s.drumColon, { color: theme.primary }]}>:</Text>
            <DrumPicker data={MINUTES}  selected={minIdx}  onSelect={setMinIdx}  format={v => pad(v as number)} width={72} />
            <Text style={[s.drumColon, { color: theme.primary }]} />
            <DrumPicker data={AMPM}     selected={ampmIdx} onSelect={setAmpmIdx} format={v => v as string}      width={64} />
          </View>

          {/* Live time display */}
          <View style={[s.timeDisplay, { backgroundColor: theme.primaryBg, borderColor: theme.primary + '40' }]}>
            <Ionicons name="time-outline" size={16} color={theme.primary} />
            <Text style={[s.timeDisplayTxt, { color: theme.primary }]}>
              {pad(displayH)}:{pad(displayM)} {displayAP}
            </Text>
          </View>
        </View>

        {/* ── Repeat toggle ── */}
        <View style={[s.toggleRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={s.toggleLeft}>
            <View style={[s.toggleIconBox, { backgroundColor: theme.secondaryBg }]}>
              <Ionicons name="repeat-outline" size={20} color={theme.secondary} />
            </View>
            <View>
              <Text style={[s.toggleLabel, { color: theme.text }]}>{t('reminder.repeatDaily')}</Text>
              <Text style={[s.toggleSub, { color: theme.textSecondary }]}>{t('reminder.repeatSub')}</Text>
            </View>
          </View>
          <Switch
            value={repeat}
            onValueChange={setRepeat}
            trackColor={{ false: theme.switchTrackOff, true: theme.primaryLight + '80' }}
            thumbColor={repeat ? theme.primary : '#9CA3AF'}
            ios_backgroundColor={theme.switchTrackOff}
          />
        </View>

        {/* ── Notification preview ── */}
        <View style={[
          s.preview,
          { backgroundColor: theme.surface, borderColor: theme.border, borderLeftColor: theme.primary },
        ]}>
          <View style={[s.previewIcon, { backgroundColor: theme.primaryBg }]}>
            <Text style={{ fontSize: 20 }}>⏰</Text>
          </View>
          <View style={s.previewBody}>
            <Text style={[s.previewTitle, { color: theme.primary }]}>{t('reminder.notifTitle')}</Text>
            <Text style={[s.previewMsg, { color: theme.text }]} numberOfLines={2}>
              {taskName || t('reminder.taskNamePlaceholder')}
            </Text>
            <Text style={[s.previewTime, { color: theme.textSecondary }]}>
              {pad(displayH)}:{pad(displayM)} {displayAP}
              {repeat ? `  ·  ${t('reminder.daily')}` : ''}
            </Text>
          </View>
        </View>

        {/* ── Save ── */}
        <TouchableOpacity
          style={[s.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          <LinearGradient colors={['#1B5E20', '#43A047']} style={s.saveBtnGrad}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
            <Text style={s.saveBtnTxt}>
              {saving ? t('reminder.saving') : t('reminder.save')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 16 },

  label: {
    fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: 22, marginBottom: 10,
  },

  // Quick chips
  quickRow: { gap: 8, paddingBottom: 2 },
  quickChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1.5,
    ...SHADOW.sm,
  },
  quickEmoji: { fontSize: 17 },
  quickTxt: { fontSize: 13, fontWeight: '600' },

  // Input
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1.5,
    paddingHorizontal: 14, paddingVertical: 2,
    ...SHADOW.sm,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, paddingVertical: 13 },

  // Drum card
  drumCard: {
    borderRadius: 20, paddingVertical: 16, paddingHorizontal: 12,
    borderWidth: 1, alignItems: 'center',
    ...SHADOW.md,
  },
  drumLabels: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  drumLabel: {
    textAlign: 'center', fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.4,
  },
  drumSepSpace: { width: 20 },
  drumRow: { flexDirection: 'row', alignItems: 'center' },
  drumColon: {
    width: 20, textAlign: 'center',
    fontSize: 28, fontWeight: '800', marginBottom: 4,
  },
  timeDisplay: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 14, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1,
  },
  timeDisplayTxt: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  // Toggle
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 16, padding: 16, marginTop: 4,
    borderWidth: 1, ...SHADOW.sm,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleIconBox: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleLabel: { fontSize: 15, fontWeight: '700' },
  toggleSub: { fontSize: 12, marginTop: 2 },

  // Preview
  preview: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderRadius: 16, padding: 14, marginTop: 4,
    borderWidth: 1, borderLeftWidth: 4,
    ...SHADOW.sm,
  },
  previewIcon: {
    width: 42, height: 42, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  previewBody: { flex: 1 },
  previewTitle: {
    fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3,
  },
  previewMsg: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  previewTime: { fontSize: 12, marginTop: 4, fontWeight: '600' },

  // Save button
  saveBtn: {
    borderRadius: 16, overflow: 'hidden', marginTop: 24,
    shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  saveBtnGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, paddingVertical: 16,
  },
  saveBtnTxt: { fontSize: 16, fontWeight: '800', color: '#FFF' },
});
