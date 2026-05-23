import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ConfirmModal } from '../components/ConfirmModal';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { TYPE_EMOJIS } from '../constants/machineStore';
import { machineAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { requireAuth } from '../utils/authGuard';
import { toastService } from '../services/toastService';

export interface Machine {
  id: string; name: string; type: string; emoji: string; entries: any[];
}
export let MACHINES: Machine[] = [];
export function setMachines(m: Machine[]) { MACHINES = m; }
export function addMachine(m: Machine) { MACHINES = [m, ...MACHINES]; }
export function addEntry(machineId: string, entry: any) {
  MACHINES = MACHINES.map(m => m.id === machineId ? { ...m, entries: [entry, ...m.entries] } : m);
}

// ── Machine Card ──────────────────────────────────────────────────────────────
function MachineCard({ machine, earnings, onPress, onDelete, t }: {
  machine: Machine; earnings: number;
  onPress: () => void; onDelete: () => void; t: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn  = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 30 }).start();
  const { theme } = useTheme();

  const TYPE_COLORS: Record<string, string> = {
    tractor: '#1B5E20', rotavator: '#1565C0', harvester: '#E65100',
    pump: '#0277BD', thresher: '#6A1B9A', other: '#37474F',
  };
  const accent = TYPE_COLORS[machine.type] || '#1B5E20';

  return (
    <Animated.View style={[mc.wrap, { transform: [{ scale }] }]}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}
        activeOpacity={1} style={[mc.card, { backgroundColor: theme.surface }]}>
        {/* Left accent strip */}
        <View style={[mc.strip, { backgroundColor: accent }]} />

        <View style={mc.body}>
          {/* Emoji box */}
          <View style={[mc.emojiBox, { backgroundColor: accent + '15' }]}>
            <Text style={mc.emoji}>{machine.emoji}</Text>
          </View>

          {/* Info */}
          <View style={mc.info}>
            <Text style={[mc.name, { color: theme.text }]} numberOfLines={1}>{machine.name}</Text>
            <View style={[mc.typePill, { backgroundColor: accent + '15' }]}>
              <Text style={[mc.typeText, { color: accent }]}>{t(`machine.types.${machine.type}`)}</Text>
            </View>
            <View style={mc.metaRow}>
              <Ionicons name="document-text-outline" size={11} color="#90A4AE" />
              <Text style={[mc.metaText, { color: theme.textSecondary }]}>{machine.entries.length} {t('machine.entries')}</Text>
            </View>
          </View>

          {/* Right: earnings + actions */}
          <View style={mc.right}>
            <Text style={[mc.earnings, { color: accent }]}>₹{earnings.toLocaleString('en-IN')}</Text>
            <Text style={mc.earningsLbl}>{t('machine.totalEarnings')}</Text>
            <View style={mc.actions}>
              <View style={[mc.arrowBtn, { backgroundColor: accent + '15' }]}>
                <Ionicons name="chevron-forward" size={13} color={accent} />
              </View>
              <TouchableOpacity style={mc.delBtn} onPress={onDelete} activeOpacity={0.8}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                <Ionicons name="trash-outline" size={13} color="#EF5350" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
const mc = StyleSheet.create({
  wrap: { marginBottom: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 18, flexDirection: 'row', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
  strip: { width: 4, borderTopLeftRadius: 18, borderBottomLeftRadius: 18 },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  emojiBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 26 },
  info: { flex: 1, gap: 4 },
  name: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.2 },
  typePill: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  typeText: { fontSize: 10, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#90A4AE', fontWeight: '500' },
  right: { alignItems: 'flex-end', gap: 3 },
  earnings: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  earningsLbl: { fontSize: 9, color: '#90A4AE', fontWeight: '500' },
  actions: { flexDirection: 'row', gap: 6, marginTop: 4 },
  arrowBtn: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  delBtn: { width: 26, height: 26, borderRadius: 9, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MachinesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [machines, setMachinesState] = useState<Machine[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmId,   setConfirmId]   = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const { theme, isDark } = useTheme();
  const { isLoggedIn } = useAuth();

  const totalEarnings = (m: Machine) =>
    m.entries.reduce((s: number, e: any) => s + (e.totalAmount || 0), 0);

  const loadMachines = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const data = await machineAPI.getAll();
      const mapped: Machine[] = (data.machines || []).map((m: any) => ({
        id: m._id, name: m.machineName, type: m.machineType,
        emoji: m.emoji || TYPE_EMOJIS[m.machineType] || '🛠️',
        entries: m.entries || [],
      }));
      setMachinesState(mapped);
      setMachines(mapped);
    } catch { setMachinesState([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { loadMachines(); }, [loadMachines]));

  const handleDelete = (id: string, name: string) => { setConfirmId(id); setConfirmName(name); };

  const confirmDelete = async () => {
    if (!confirmId) return;
    const name = confirmName;
    setConfirmId(null);
    try {
      await machineAPI.delete(confirmId);
      setMachinesState(prev => prev.filter(m => m.id !== confirmId));
      toastService.machineDeleted(name);
    } catch (err: any) {
      toastService.error(t('machine.deleteFailed'), err.message);
    }
  };

  const totalEntries = machines.reduce((a, m) => a + m.entries.length, 0);
  const totalEarned  = machines.reduce((a, m) => a + totalEarnings(m), 0);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      <PageHeader
        title={t('machine.title')}
        subtitle={t('machine.subtitle')}
        onBack={() => router.back()}
        iconName="construct"
        iconColor="#5B21B6"
        iconBg="#F5F3FF"
        rightElement={
          <View style={s.statsBadge}>
            <Text style={s.statsBadgeTxt}>{machines.length}</Text>
          </View>
        }
      />

      {loading
        ? <View style={s.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>
        : <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
            contentContainerStyle={s.content}
            refreshControl={
              <RefreshControl refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadMachines(false); }}
                colors={[COLORS.primary]} />
            }>
            {machines.length === 0 && (
              <View style={s.empty}>
                <View style={s.emptyIcon}><Text style={{ fontSize: 40 }}>🚜</Text></View>
                <Text style={[s.emptyTitle, { color: theme.textSecondary }]}>{t('machine.noMachines')}</Text>
                <Text style={s.emptySub}>Tap + to add your first machine</Text>
              </View>
            )}
            {machines.map(m => (
              <MachineCard key={m.id} machine={m} earnings={totalEarnings(m)} t={t}
                onPress={() => router.push({ pathname: '/machine-detail', params: { id: m.id } } as any)}
                onDelete={() => handleDelete(m.id, m.name)} />
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
      }

      {/* FAB */}
      <TouchableOpacity style={s.fab} activeOpacity={0.85}
        onPress={() => {
          if (!requireAuth(isLoggedIn, 'Machine Tracker')) return;
          router.push('/add-machine' as any);
        }}>
        <LinearGradient colors={['#1B5E20', '#43A047']} style={s.fabGrad}>
          <Ionicons name="add" size={22} color="#FFF" />
          <Text style={s.fabTxt}>{t('machine.addMachine')}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <ConfirmModal
        visible={!!confirmId}
        title={t('machine.deleteTitle')}
        message={t('machine.deleteConfirm', { name: confirmName })}
        confirmText={t('machine.delete')} cancelText={t('machine.cancel')}
        icon="trash-outline" iconColor="#C62828" confirmColor="#C62828"
        onConfirm={confirmDelete} onCancel={() => setConfirmId(null)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  statsBadge: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F0FBF1', borderWidth: 1, borderColor: '#C8E6C9',
    alignItems: 'center', justifyContent: 'center',
  },
  statsBadgeTxt: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 18 },
  empty: { alignItems: 'center', paddingVertical: 70, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#607D8B' },
  emptySub: { fontSize: 13, color: '#90A4AE' },
  fab: { position: 'absolute', bottom: 24, left: 16, right: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  fabGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  fabTxt: { fontSize: 15, fontWeight: '800', color: '#FFF' },
});
