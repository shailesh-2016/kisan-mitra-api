import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { machineAPI, profitAPI } from '../services/api';
import { toastService } from '../services/toastService';

type TabType = 'machines' | 'profits';

export default function TrashScreen() {
  const { t }  = useTranslation();
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [activeTab,      setActiveTab]      = useState<TabType>('machines');
  const [machines,       setMachines]       = useState<any[]>([]);
  const [profits,        setProfits]        = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [actionLoading,  setActionLoading]  = useState<string | null>(null);

  const loadTrash = useCallback(async () => {
    try {
      const [mData, pData] = await Promise.all([
        machineAPI.getTrash(),
        profitAPI.getTrash(),
      ]);
      setMachines(mData?.machines || []);
      setProfits(pData?.history   || []);
    } catch {
      // offline
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadTrash(); }, [loadTrash]);

  const onRefresh = () => { setRefreshing(true); loadTrash(); };

  // ── Restore ──
  const handleRestoreMachine = async (id: string) => {
    setActionLoading(id);
    try {
      await machineAPI.restore(id);
      setMachines(prev => prev.filter(m => m._id !== id));
      toastService.success(t('trash.restored') || 'Restored successfully');
    } catch (e: any) {
      toastService.error(e.message || 'Error restoring machine');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestoreProfit = async (id: string) => {
    setActionLoading(id);
    try {
      await profitAPI.restore(id);
      setProfits(prev => prev.filter(p => p._id !== id));
      toastService.success(t('trash.restored') || 'Restored successfully');
    } catch (e: any) {
      toastService.error(e.message || 'Error restoring entry');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Permanent delete ──
  const confirmPermanentDelete = (id: string, type: TabType) => {
    Alert.alert(
      t('trash.permanentTitle'),
      t('trash.permanentMsg'),
      [
        { text: t('trash.cancel'), style: 'cancel' },
        {
          text: t('trash.deleteForever'), style: 'destructive',
          onPress: async () => {
            setActionLoading(id);
            try {
              if (type === 'machines') {
                await machineAPI.permanentDelete(id);
                setMachines(prev => prev.filter(m => m._id !== id));
              } else {
                await profitAPI.permanentDelete(id);
                setProfits(prev => prev.filter(p => p._id !== id));
              }
              toastService.success(t('trash.deleted') || 'Deleted permanently');
            } catch (e: any) {
              toastService.error(e.message || 'Error deleting item');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (d: string | Date) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const activeList = activeTab === 'machines' ? machines : profits;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      {/* Header */}
      <View style={[s.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[s.backBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={[s.headerIcon, { backgroundColor: '#FFEBEE' }]}>
            <Ionicons name="trash" size={18} color={COLORS.red} />
          </View>
          <View>
            <Text style={[s.headerTitle, { color: theme.text }]}>{t('trash.title')}</Text>
            <Text style={[s.headerSub, { color: theme.textSecondary }]}>{t('trash.subtitle')}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab bar */}
      <View style={[s.tabBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {(['machines', 'profits'] as TabType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={tab === 'machines' ? 'construct' : 'stats-chart'}
              size={15}
              color={activeTab === tab ? COLORS.white : theme.textSecondary}
            />
            <Text style={[s.tabTxt, { color: activeTab === tab ? COLORS.white : theme.textSecondary }]}>
              {t(`trash.tab_${tab}`)}
            </Text>
            <View style={[s.tabBadge, { backgroundColor: activeTab === tab ? 'rgba(255,255,255,0.3)' : theme.inputBg }]}>
              <Text style={[s.tabBadgeTxt, { color: activeTab === tab ? COLORS.white : theme.textSecondary }]}>
                {tab === 'machines' ? machines.length : profits.length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {loading ? (
          <View style={s.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : activeList.length === 0 ? (
          <View style={s.empty}>
            <LinearGradient colors={['#FFEBEE', '#FCE4EC']} style={s.emptyIcon}>
              <Ionicons name="trash-outline" size={44} color={COLORS.red} />
            </LinearGradient>
            <Text style={[s.emptyTitle, { color: theme.text }]}>{t('trash.emptyTitle')}</Text>
            <Text style={[s.emptySub, { color: theme.textSecondary }]}>{t('trash.emptySub')}</Text>
          </View>
        ) : (
          <>
            {/* Info banner */}
            <View style={[s.infoBanner, { backgroundColor: '#FFF8E1', borderColor: '#FFE082' }]}>
              <Ionicons name="information-circle" size={16} color="#F57F17" />
              <Text style={[s.infoText, { color: '#E65100' }]}>{t('trash.infoMsg')}</Text>
            </View>

            {/* Machine cards */}
            {activeTab === 'machines' && machines.map(m => (
              <View key={m._id} style={[s.card, { backgroundColor: theme.surface }]}>
                <View style={s.cardLeft}>
                  <View style={[s.cardIcon, { backgroundColor: '#FCE4EC' }]}>
                    <Text style={{ fontSize: 22 }}>{m.emoji || '🚜'}</Text>
                  </View>
                  <View style={s.cardInfo}>
                    <Text style={[s.cardTitle, { color: theme.text }]} numberOfLines={1}>{m.machineName}</Text>
                    <Text style={[s.cardSub, { color: theme.textSecondary }]}>
                      {m.machineType} · {m.entries?.length || 0} {t('trash.entries')}
                    </Text>
                    <Text style={[s.cardDate, { color: theme.textMuted }]}>
                      🗑 {formatDate(m.deletedAt)}
                    </Text>
                  </View>
                </View>
                <View style={s.cardActions}>
                  <TouchableOpacity
                    style={[s.restoreBtn, { borderColor: COLORS.primary }]}
                    onPress={() => handleRestoreMachine(m._id)}
                    disabled={actionLoading === m._id}
                  >
                    {actionLoading === m._id
                      ? <ActivityIndicator size={12} color={COLORS.primary} />
                      : <Ionicons name="refresh" size={14} color={COLORS.primary} />
                    }
                    <Text style={[s.restoreTxt, { color: COLORS.primary }]}>{t('trash.restore')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => confirmPermanentDelete(m._id, 'machines')}
                    disabled={actionLoading === m._id}
                  >
                    <Ionicons name="trash" size={14} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Profit cards */}
            {activeTab === 'profits' && profits.map(p => (
              <View key={p._id} style={[s.card, { backgroundColor: theme.surface }]}>
                <View style={s.cardLeft}>
                  <View style={[s.cardIcon, { backgroundColor: p.netProfit >= 0 ? '#E8F5E9' : '#FFEBEE' }]}>
                    <Ionicons
                      name={p.netProfit >= 0 ? 'trending-up' : 'trending-down'}
                      size={22}
                      color={p.netProfit >= 0 ? COLORS.primary : COLORS.red}
                    />
                  </View>
                  <View style={s.cardInfo}>
                    <Text style={[s.cardTitle, { color: theme.text }]} numberOfLines={1}>{p.cropName}</Text>
                    <Text style={[s.cardSub, { color: p.netProfit >= 0 ? COLORS.primary : COLORS.red }]}>
                      {p.netProfit >= 0 ? '+' : ''}₹{p.netProfit?.toLocaleString('en-IN')}
                    </Text>
                    <Text style={[s.cardDate, { color: theme.textMuted }]}>
                      🗑 {formatDate(p.deletedAt)}
                    </Text>
                  </View>
                </View>
                <View style={s.cardActions}>
                  <TouchableOpacity
                    style={[s.restoreBtn, { borderColor: COLORS.primary }]}
                    onPress={() => handleRestoreProfit(p._id)}
                    disabled={actionLoading === p._id}
                  >
                    {actionLoading === p._id
                      ? <ActivityIndicator size={12} color={COLORS.primary} />
                      : <Ionicons name="refresh" size={14} color={COLORS.primary} />
                    }
                    <Text style={[s.restoreTxt, { color: COLORS.primary }]}>{t('trash.restore')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.deleteBtn}
                    onPress={() => confirmPermanentDelete(p._id, 'profits')}
                    disabled={actionLoading === p._id}
                  >
                    <Ionicons name="trash" size={14} color={COLORS.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

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

  tabBar: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 9, borderRadius: RADIUS.md,
    backgroundColor: 'transparent',
  },
  tabBtnActive: { backgroundColor: COLORS.primary },
  tabTxt: { fontSize: FONT_SIZE.sm, fontWeight: '700' },
  tabBadge: {
    minWidth: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  tabBadgeTxt: { fontSize: 10, fontWeight: '800' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },

  loadingWrap: { alignItems: 'center', paddingVertical: 60 },

  empty: { alignItems: 'center', paddingVertical: 60, gap: SPACING.sm },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm,
  },
  emptyTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800' },
  emptySub:   { fontSize: FONT_SIZE.sm, textAlign: 'center', lineHeight: 20 },

  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderRadius: RADIUS.md, padding: SPACING.sm + 2,
    borderWidth: 1, marginBottom: SPACING.md,
  },
  infoText: { flex: 1, fontSize: FONT_SIZE.xs, fontWeight: '600', lineHeight: 18 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: RADIUS.md, padding: SPACING.md,
    marginBottom: SPACING.sm, gap: SPACING.sm,
    ...SHADOW.sm,
  },
  cardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  cardIcon: {
    width: 48, height: 48, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', letterSpacing: -0.1 },
  cardSub:   { fontSize: FONT_SIZE.sm, fontWeight: '600', marginTop: 2 },
  cardDate:  { fontSize: 10, fontWeight: '500', marginTop: 3 },

  cardActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  restoreBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: RADIUS.full, borderWidth: 1.5,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  restoreTxt: { fontSize: 11, fontWeight: '700' },
  deleteBtn: {
    width: 34, height: 34, borderRadius: RADIUS.sm,
    backgroundColor: '#FFEBEE',
    alignItems: 'center', justifyContent: 'center',
  },
});
