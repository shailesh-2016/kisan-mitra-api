import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/theme';
import { machineAPI } from '../services/api';
import { Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import PageHeader from '../components/PageHeader';

const TYPE_COLORS: Record<string, string> = {
  tractor: '#1B5E20', rotavator: '#1565C0', harvester: '#E65100',
  pump: '#0277BD', thresher: '#6A1B9A', other: '#37474F',
};

export default function MachineDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [machine, setMachine] = useState<any>(null);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [confirmEntryId,   setConfirmEntryId]   = useState<string | null>(null);
  const [confirmEntryName, setConfirmEntryName] = useState('');

  const loadDetail = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const data = await machineAPI.getById(id!);
      if (data.machine) {
        setMachine({ id: data.machine._id, name: data.machine.machineName, type: data.machine.machineType, emoji: data.machine.emoji, entries: data.machine.entries });
        setEntries(data.machine.entries || []);
      }
    } catch { } finally { setLoading(false); setRefreshing(false); }
  }, [id]);

  useFocusEffect(useCallback(() => { loadDetail(); }, [loadDetail]));

  const handleDeleteEntry = (entryId: string, farmerName: string) => {
    setConfirmEntryId(entryId); setConfirmEntryName(farmerName);
  };

  const confirmDeleteEntry = async () => {
    if (!confirmEntryId) return;
    const eid = confirmEntryId;
    setConfirmEntryId(null);
    try {
      await machineAPI.deleteEntry(id!, eid);
      setEntries(prev => prev.filter((e: any) => (e._id || e.id) !== eid));
      Toast.show({ type: 'success', text1: t('machine.entryDeleted'), visibilityTime: 1800 });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: t('machine.deleteFailed'), text2: err.message });
    }
  };

  const totalEarnings = entries.reduce((s: number, e: any) => s + (e.totalAmount || 0), 0);
  const totalHours    = entries.reduce((s: number, e: any) => s + (e.totalHours || 0), 0);
  const accent = machine ? (TYPE_COLORS[machine.type] || '#1B5E20') : '#1B5E20';

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 32 }}>⏳</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!machine) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <Text style={{ fontSize: 48 }}>🚜</Text>
          <Text style={{ color: COLORS.textSecondary, fontWeight: '600' }}>{t('machine.notFound')}</Text>
          <TouchableOpacity onPress={() => router.back()} style={s.goBackBtn}>
            <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{t('machine.goBack')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <PageHeader
        title={machine.name}
        subtitle={`${machine.emoji}  ${t(`machine.types.${machine.type}`)}`}
        onBack={() => router.back()}
        iconName="construct"
        iconColor={accent}
        iconBg={accent + '18'}
      />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadDetail(false); }}
            colors={[COLORS.primary]} />
        }>

        {entries.length === 0 && (
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Ionicons name="document-text-outline" size={34} color="#B0BEC5" />
            </View>
            <Text style={s.emptyTitle}>{t('machine.noEntries')}</Text>
            <Text style={s.emptySub}>Tap + to add first entry</Text>
          </View>
        )}

        {entries.map((e, i) => (
          <View key={e._id || e.id || i} style={s.entryCard}>
            {/* Top */}
            <View style={s.entryTop}>
              <View style={[s.avatar, { backgroundColor: accent }]}>
                <Text style={s.avatarTxt}>{e.farmerName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={s.entryInfo}>
                <Text style={s.entryName}>{e.farmerName}</Text>
                <View style={s.locRow}>
                  <Ionicons name="location-sharp" size={11} color={COLORS.secondary} />
                  <Text style={s.locTxt} numberOfLines={1}>{e.address}</Text>
                </View>
              </View>
              <View style={s.entryRight}>
                <View style={s.dateBadge}>
                  <Ionicons name="calendar-outline" size={10} color={COLORS.primary} />
                  <Text style={s.dateTxt}>{e.date}</Text>
                </View>
                <TouchableOpacity style={s.delBtn}
                  onPress={() => handleDeleteEntry(e._id || e.id, e.farmerName)} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={13} color="#EF5350" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Time bar */}
            <View style={s.timeBar}>
              <View style={s.timePill}>
                <Ionicons name="play-circle" size={12} color={COLORS.primary} />
                <Text style={s.timeTxt}>{e.startTime || '—'}</Text>
              </View>
              <View style={s.timeLine}>
                <View style={s.timeLineDot} />
                <View style={s.timeLineTrack} />
                <View style={s.timeLineDot} />
              </View>
              <View style={[s.timePill, { backgroundColor: '#FFF3E0' }]}>
                <Ionicons name="stop-circle" size={12} color="#E65100" />
                <Text style={[s.timeTxt, { color: '#E65100' }]}>{e.endTime || '—'}</Text>
              </View>
            </View>

            {/* Result strip */}
            <View style={s.resultStrip}>
              <View style={s.resultItem}>
                <Text style={s.resultLbl}>{t('machine.totalHours')}</Text>
                <Text style={s.resultVal}>{e.totalHours} {t('machine.hrs')}</Text>
              </View>
              <View style={s.resultDiv} />
              <View style={s.resultItem}>
                <Text style={s.resultLbl}>{t('machine.pricePerHour')}</Text>
                <Text style={s.resultVal}>₹{e.pricePerHour}/hr</Text>
              </View>
              <View style={s.resultDiv} />
              <View style={s.resultItem}>
                <Text style={s.resultLbl}>{t('machine.totalAmount')}</Text>
                <Text style={[s.resultVal, { color: accent, fontSize: 16 }]}>
                  ₹{e.totalAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={s.fab} activeOpacity={0.85}
        onPress={() => router.push({ pathname: '/add-entry', params: { machineId: machine.id, machineName: machine.name, machineEmoji: machine.emoji } } as any)}>
        <LinearGradient colors={['#1B5E20', '#43A047']} style={s.fabGrad}>
          <Ionicons name="add" size={22} color="#FFF" />
          <Text style={s.fabTxt}>{t('machine.newEntry')}</Text>
        </LinearGradient>
      </TouchableOpacity>

      <ConfirmModal
        visible={!!confirmEntryId}
        title={t('machine.deleteEntryTitle')}
        message={t('machine.deleteEntryConfirm', { name: confirmEntryName })}
        confirmText={t('machine.delete')} cancelText={t('machine.cancel')}
        icon="trash-outline" iconColor="#C62828" confirmColor="#C62828"
        onConfirm={confirmDeleteEntry} onCancel={() => setConfirmEntryId(null)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  goBackBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#E8F5E9', borderRadius: 12 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 18 },
  empty: { alignItems: 'center', paddingVertical: 70, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: '#ECEFF1', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#607D8B' },
  emptySub: { fontSize: 13, color: '#90A4AE' },

  // Entry card
  entryCard: { backgroundColor: '#FFF', borderRadius: 18, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  entryTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  locTxt: { fontSize: 11, color: '#90A4AE', flex: 1 },
  entryRight: { alignItems: 'flex-end', gap: 6 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  dateTxt: { fontSize: 10, color: COLORS.primary, fontWeight: '700' },
  delBtn: { width: 28, height: 28, borderRadius: 9, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },

  // Time bar
  timeBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  timePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E8F5E9', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  timeTxt: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  timeLine: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  timeLineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#CFD8DC' },
  timeLineTrack: { flex: 1, height: 1.5, backgroundColor: '#CFD8DC' },

  // Result strip
  resultStrip: { flexDirection: 'row', backgroundColor: '#F8FAFB', borderRadius: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#ECEFF1' },
  resultItem: { flex: 1, alignItems: 'center' },
  resultLbl: { fontSize: 9, color: '#90A4AE', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  resultVal: { fontSize: 14, fontWeight: '800', color: '#1A1A2E', marginTop: 3 },
  resultDiv: { width: 1, backgroundColor: '#ECEFF1', marginVertical: 4 },

  fab: { position: 'absolute', bottom: 24, left: 16, right: 16, borderRadius: 16, overflow: 'hidden', shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8 },
  fabGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  fabTxt: { fontSize: 15, fontWeight: '800', color: '#FFF' },
});
