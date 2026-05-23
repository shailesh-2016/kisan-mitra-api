import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import FloatingMicButton from '../../components/FloatingMicButton';
import Header from '../../components/Header';
import KisanSlider from '../../components/KisanSlider';
import { useRouter } from 'expo-router';
import { mandiAPI } from '../../services/api';
import { fetchMandiPrices, getDistricts } from '../../services/mandiApi';
import { loadNotifications } from '../../services/notificationService';
import { requireAuth } from '../../utils/authGuard';

// ── MandiPriceStrip ───────────────────────────────────────────────────────────
interface MandiItem { commodity: string; pricePerKg: number; modalPrice: number; emoji: string; minPrice: number; maxPrice: number; }

function MandiPriceStrip({ onPress }: { onPress: () => void }) {
  const [items,   setItems]   = useState<MandiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState('');
  const { theme } = useTheme();

  const load = useCallback(async () => {
    try {
      const res = await fetchMandiPrices({ state: 'Gujarat', district: 'Ahmedabad' });
      const seen = new Set<string>();
      const unique: MandiItem[] = [];
      for (const r of (res.data || [])) {
        const key = r.commodity.toLowerCase();
        if (!seen.has(key)) { seen.add(key); unique.push(r); }
        if (unique.length >= 8) break;
      }
      setItems(unique);
      setUpdatedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch { /* keep empty — strip won't show */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={ms.loadWrap}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={ms.loadTxt}>Loading mandi prices...</Text>
      </View>
    );
  }
  if (items.length === 0) return null;

  return (
    <View style={[ms.wrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Header row */}
      <View style={ms.headerRow}>
        <View style={ms.liveRow}>
          <View style={ms.liveDot} />
          <Text style={ms.liveLabel}>Live Mandi</Text>
        </View>
        <Text style={ms.updated}>Updated {updatedAt}</Text>
        <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={ms.seeAll}>See all →</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal scroll chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={ms.scrollContent}>
        {items.map((item, i) => {
          const isHigh = item.modalPrice > item.minPrice + (item.maxPrice - item.minPrice) * 0.5;
          return (
            <TouchableOpacity key={i} style={[ms.chip, { backgroundColor: theme.inputBg, borderColor: theme.border }]} onPress={onPress} activeOpacity={0.8}>
              <Text style={ms.chipEmoji}>{item.emoji}</Text>
              <View style={ms.chipInfo}>
                <Text style={[ms.chipName, { color: theme.text }]} numberOfLines={1}>{item.commodity}</Text>
                <Text style={[ms.chipPrice, { color: isHigh ? COLORS.primary : COLORS.red }]}>
                  ₹{item.pricePerKg}/kg
                </Text>
              </View>
              <View style={[ms.trendDot, { backgroundColor: isHigh ? '#E8F5E9' : '#FFEBEE' }]}>
                <Ionicons name={isHigh ? 'arrow-up' : 'arrow-down'} size={9}
                  color={isHigh ? COLORS.primary : COLORS.red} />
              </View>
            </TouchableOpacity>
          );
        })}
        {/* View all chip */}
        <TouchableOpacity style={ms.viewAllChip} onPress={onPress} activeOpacity={0.8}>
          <Ionicons name="storefront-outline" size={16} color={COLORS.primary} />
          <Text style={ms.viewAllTxt}>View All</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const ms = StyleSheet.create({
  wrap: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#1A7340',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E6F4EA',
  },
  headerRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  liveRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  liveDot:     { width: 8, height: 8, borderRadius: 4, backgroundColor: '#34C759' },
  liveLabel:   { fontSize: 13, fontWeight: '700', color: '#111827', letterSpacing: -0.1 },
  updated:     { fontSize: 10, color: '#9CA3AF', fontWeight: '500', marginRight: 10 },
  seeAll:      { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  scrollContent: { gap: 8, paddingRight: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 130,
  },
  chipEmoji:   { fontSize: 22 },
  chipInfo:    { flex: 1 },
  chipName:    { fontSize: 12, fontWeight: '600', color: '#111827' },
  chipPrice:   { fontSize: 13, fontWeight: '800', marginTop: 2 },
  trendDot:    { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  viewAllChip: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F0FBF1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    minWidth: 72,
  },
  viewAllTxt:  { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  loadWrap:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: SPACING.md, marginTop: SPACING.md, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, ...SHADOW.sm },
  loadTxt:     { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
});

// ── Grid card config ──────────────────────────────────────────────────────────
const GRID_CARDS = [
  {
    id: '1', key: 'mandi', descKey: 'mandiDesc',
    icon: 'trending-up',
    grad: ['#F0FBF1', '#DCF5E0'] as [string, string],
    iconColor: '#1E7D34',
    badge: '↑ Live',
    badgeColor: '#1E7D34',
  },
  {
    id: '2', key: 'weather', descKey: 'weatherDescShort',
    icon: 'partly-sunny',
    grad: ['#EFF6FF', '#DBEAFE'] as [string, string],
    iconColor: '#1D4ED8',
    badge: '32°C',
    badgeColor: '#1D4ED8',
  },
  {
    id: '3', key: 'govt', descKey: 'govtDesc',
    icon: 'shield-checkmark',
    grad: ['#FFFBEB', '#FEF3C7'] as [string, string],
    iconColor: '#D97706',
    badge: 'New',
    badgeColor: '#B45309',
  },
  {
    id: '4', key: 'profit', descKey: 'profitDesc',
    icon: 'calculator',
    grad: ['#FFF1F2', '#FFE4E6'] as [string, string],
    iconColor: '#BE123C',
    badge: 'Free',
    badgeColor: '#BE123C',
  },
  {
    id: '5', key: 'machine', descKey: 'machineDesc',
    icon: 'construct',
    grad: ['#F5F3FF', '#EDE9FE'] as [string, string],
    iconColor: '#5B21B6',
    badge: '🚜',
    badgeColor: '#5B21B6',
  },
  {
    id: '6', key: 'reminder', descKey: 'reminderDesc',
    icon: 'alarm',
    grad: ['#FFF7ED', '#FFEDD5'] as [string, string],
    iconColor: '#C2410C',
    badge: '⏰',
    badgeColor: '#C2410C',
  },
];

// ── Protected routes (require login) ─────────────────────────────────────────
const PROTECTED_KEYS = new Set(['machine', 'reminder', 'profit']);
const FEATURE_NAMES: Record<string, string> = {
  machine:  'Machine Tracker',
  reminder: 'Smart Reminder',
  profit:   'Profit Calculator',
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { user, isLoggedIn } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications().then(notifs => {
      setUnreadCount(notifs.filter(n => !n.read).length);
    });
  }, []);

  const CARD_ROUTES: Record<string, string> = {
    mandi: '/(tabs)/market',
    weather: '/weather',
    govt: '/govt-schemes',
    profit: '/profit-calc',
    machine: '/machines',
    reminder: '/reminders',
  };

  const handleCardPress = (key: string) => {
    const route = CARD_ROUTES[key];
    if (!route) return;
    if (PROTECTED_KEYS.has(key) && !requireAuth(isLoggedIn, FEATURE_NAMES[key] ?? key)) return;
    router.push(route as any);
  };

  const handleNotificationsPress = () => {
    if (!requireAuth(isLoggedIn, 'Notifications')) return;
    router.push('/notifications' as any);
  };

  const handleAIDoctorPress = () => {
    if (!requireAuth(isLoggedIn, 'AI Doctor')) return;
    router.push('/(tabs)/aidoctor' as any);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Header ── */}
        <Header name={user?.name || t('home.farmer')} unreadCount={unreadCount} />

        {/* ── Slider ── */}
        <KisanSlider />

        {/* ── Live Mandi Price Strip ── */}
        <MandiPriceStrip onPress={() => router.push('/(tabs)/market' as any)} />

        {/* ── Section: Kya karna hai ── */}
        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('home.todayQuestion')}</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        {/* ── Grid Cards ── */}
        <View style={styles.grid}>
          {GRID_CARDS.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.82}
              style={styles.gridCardWrap}
              onPress={() => handleCardPress(item.key)}
            >
              <LinearGradient
                colors={item.grad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gridCard}
              >
                {/* Badge top-right */}
                <View style={[styles.cardBadge, { backgroundColor: item.iconColor + '14', borderColor: item.iconColor + '30' }]}>
                  <Text style={[styles.cardBadgeText, { color: item.iconColor }]}>{item.badge}</Text>
                </View>

                {/* Icon */}
                <View style={[styles.gridIconWrap, { backgroundColor: item.iconColor + '15' }]}>
                  <Ionicons name={item.icon as any} size={26} color={item.iconColor} />
                </View>

                {/* Text */}
                <Text style={[styles.gridCardTitle, { color: item.iconColor }]}>
                  {t(`home.${item.key}`)}
                </Text>
                <Text style={styles.gridCardDesc}>
                  {t(`home.${item.descKey}`, { defaultValue: '→' })}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Quick Actions ── */}
        <Text style={[styles.sectionTitle2, { color: theme.text }]}>{t('home.quickActions')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickBtn} activeOpacity={0.85}
            onPress={() => requireAuth(isLoggedIn, 'Scan Crop') && router.push('/(tabs)/aidoctor' as any)}>
            <LinearGradient
              colors={['#166534', '#15803D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.quickBtnGrad}
            >
              <View style={styles.quickBtnIconWrap}>
                <Ionicons name="camera" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.quickBtnText}>
                <Text style={styles.quickBtnLabel}>{t('home.scanCrop')}</Text>
                <Text style={styles.quickBtnSub}>Instant result</Text>
              </View>
              <View style={styles.quickBtnArrow}>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickBtn} activeOpacity={0.85} onPress={handleAIDoctorPress}>
            <LinearGradient
              colors={['#C2410C', '#EA580C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.quickBtnGrad}
            >
              <View style={styles.quickBtnIconWrap}>
                <Ionicons name="medkit" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.quickBtnText}>
                <Text style={styles.quickBtnLabel}>{t('home.aiDoctor')}</Text>
                <Text style={styles.quickBtnSub}>AI powered</Text>
              </View>
              <View style={styles.quickBtnArrow}>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── Today's Tip ── */}
        <Text style={[styles.sectionTitle2, { color: theme.text }]}>{t('home.todayTip')}</Text>
        <View style={[styles.tipCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.tipLeft}>
            <View style={styles.tipIconWrap}>
              <Ionicons name="bulb" size={22} color={COLORS.secondary} />
            </View>
          </View>
          <View style={styles.tipRight}>
            <Text style={styles.tipLabel}>Kisan Salah</Text>
            <Text style={[styles.tipText, { color: theme.textSecondary }]}>{t('home.tipText')}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <FloatingMicButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  // ── Section headers ──
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg + 4,
    marginBottom: SPACING.sm + 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  sectionLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionTitle2: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg + 4,
    marginBottom: SPACING.sm + 2,
  },

  // ── Grid ──
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    gap: 12,
  },
  gridCardWrap: {
    width: '47.5%',
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  gridCard: {
    borderRadius: 18,
    padding: SPACING.md,
    minHeight: 132,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  gridIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  gridCardDesc: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 16,
  },

  // ── Quick Actions ──
  quickActions: {
    paddingHorizontal: SPACING.md,
    gap: 10,
  },
  quickBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  quickBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: SPACING.md,
    gap: 14,
  },
  quickBtnIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickBtnText: { flex: 1 },
  quickBtnLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  quickBtnSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 2,
  },
  quickBtnArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Tip ──
  tipCard: {
    marginHorizontal: SPACING.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  tipLeft: {},
  tipIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipRight: { flex: 1 },
  tipLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
});
