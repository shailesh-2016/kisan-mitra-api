import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import PageHeader from '../components/PageHeader';
import { useTheme } from '../context/ThemeContext';

// ── Scheme meta (icons, colors, tag colors) ───────────────────────────────────
export const SCHEME_KEYS = [
  'pmKisan', 'pmFasalBima', 'kisanCreditCard', 'soilHealth',
  'pmKrishiSinchai', 'eNAM', 'paramparagatKrishi', 'rkvy',
  'kisanMaandhan', 'pmKusumYojana',
  'tractorSubsidy', 'dripSubsidy', 'solarPumpSubsidy',
  'seedSubsidy', 'fertilizerSubsidy', 'farmEquipSubsidy',
  'polyhouseSubsidy', 'coldStorageSubsidy', 'dairySubsidy', 'sprayerSubsidy',
] as const;
export type SchemeKey = typeof SCHEME_KEYS[number];

export const SCHEME_META: Record<SchemeKey, {
  icon: string; iconBg: string; iconColor: string;
  tagBg: string; tagColor: string; isNew?: boolean;
  gradColors: [string, string];
}> = {
  // ── Schemes ──
  pmKisan: {
    icon: 'cash', iconBg: '#E8F5E9', iconColor: '#2E7D32',
    tagBg: '#E8F5E9', tagColor: '#2E7D32',
    gradColors: ['#E8F5E9', '#F1F8E9'],
  },
  pmFasalBima: {
    icon: 'shield-checkmark', iconBg: '#E3F2FD', iconColor: '#1565C0',
    tagBg: '#E3F2FD', tagColor: '#1565C0',
    gradColors: ['#E3F2FD', '#E8EAF6'], isNew: true,
  },
  kisanCreditCard: {
    icon: 'card', iconBg: '#FFF8E1', iconColor: '#F57F17',
    tagBg: '#FFF8E1', tagColor: '#F57F17',
    gradColors: ['#FFF8E1', '#FFF3E0'],
  },
  soilHealth: {
    icon: 'leaf', iconBg: '#F3E5F5', iconColor: '#7B1FA2',
    tagBg: '#F3E5F5', tagColor: '#7B1FA2',
    gradColors: ['#F3E5F5', '#EDE7F6'],
  },
  pmKrishiSinchai: {
    icon: 'water', iconBg: '#E0F7FA', iconColor: '#00838F',
    tagBg: '#E0F7FA', tagColor: '#00838F',
    gradColors: ['#E0F7FA', '#E0F2F1'],
  },
  eNAM: {
    icon: 'storefront', iconBg: '#FFF3E0', iconColor: '#E65100',
    tagBg: '#FFF3E0', tagColor: '#E65100',
    gradColors: ['#FFF3E0', '#FBE9E7'],
  },
  paramparagatKrishi: {
    icon: 'flower', iconBg: '#F1F8E9', iconColor: '#558B2F',
    tagBg: '#F1F8E9', tagColor: '#558B2F',
    gradColors: ['#F1F8E9', '#E8F5E9'],
  },
  rkvy: {
    icon: 'business', iconBg: '#EDE7F6', iconColor: '#4527A0',
    tagBg: '#EDE7F6', tagColor: '#4527A0',
    gradColors: ['#EDE7F6', '#E8EAF6'],
  },
  kisanMaandhan: {
    icon: 'umbrella', iconBg: '#FCE4EC', iconColor: '#AD1457',
    tagBg: '#FCE4EC', tagColor: '#AD1457',
    gradColors: ['#FCE4EC', '#F8BBD0'],
  },
  pmKusumYojana: {
    icon: 'sunny', iconBg: '#FFFDE7', iconColor: '#F9A825',
    tagBg: '#FFFDE7', tagColor: '#F9A825',
    gradColors: ['#FFFDE7', '#FFF9C4'], isNew: true,
  },
  // ── Subsidies ──
  tractorSubsidy: {
    icon: 'construct', iconBg: '#E8F5E9', iconColor: '#2E7D32',
    tagBg: '#E8F5E9', tagColor: '#2E7D32',
    gradColors: ['#E8F5E9', '#F1F8E9'],
  },
  dripSubsidy: {
    icon: 'water', iconBg: '#E0F7FA', iconColor: '#006064',
    tagBg: '#E0F7FA', tagColor: '#006064',
    gradColors: ['#E0F7FA', '#E0F2F1'],
  },
  solarPumpSubsidy: {
    icon: 'sunny', iconBg: '#FFFDE7', iconColor: '#F57F17',
    tagBg: '#FFFDE7', tagColor: '#F57F17',
    gradColors: ['#FFFDE7', '#FFF9C4'],
  },
  seedSubsidy: {
    icon: 'leaf', iconBg: '#F1F8E9', iconColor: '#33691E',
    tagBg: '#F1F8E9', tagColor: '#33691E',
    gradColors: ['#F1F8E9', '#E8F5E9'],
  },
  fertilizerSubsidy: {
    icon: 'flask', iconBg: '#E8EAF6', iconColor: '#283593',
    tagBg: '#E8EAF6', tagColor: '#283593',
    gradColors: ['#E8EAF6', '#EDE7F6'],
  },
  farmEquipSubsidy: {
    icon: 'hammer', iconBg: '#FBE9E7', iconColor: '#BF360C',
    tagBg: '#FBE9E7', tagColor: '#BF360C',
    gradColors: ['#FBE9E7', '#FFF3E0'],
  },
  polyhouseSubsidy: {
    icon: 'home', iconBg: '#E0F2F1', iconColor: '#004D40',
    tagBg: '#E0F2F1', tagColor: '#004D40',
    gradColors: ['#E0F2F1', '#E0F7FA'],
  },
  coldStorageSubsidy: {
    icon: 'snow', iconBg: '#E3F2FD', iconColor: '#0D47A1',
    tagBg: '#E3F2FD', tagColor: '#0D47A1',
    gradColors: ['#E3F2FD', '#E8EAF6'],
  },
  dairySubsidy: {
    icon: 'paw', iconBg: '#FFF8E1', iconColor: '#FF6F00',
    tagBg: '#FFF8E1', tagColor: '#FF6F00',
    gradColors: ['#FFF8E1', '#FFF3E0'],
  },
  sprayerSubsidy: {
    icon: 'color-wand', iconBg: '#F3E5F5', iconColor: '#6A1B9A',
    tagBg: '#F3E5F5', tagColor: '#6A1B9A',
    gradColors: ['#F3E5F5', '#EDE7F6'],
  },
};

const CATS = ['all', 'subsidy', 'loan', 'insurance'] as const;

export default function GovtSchemesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string>('all');
  const { theme, isDark } = useTheme();

  const TAG_MAP: Record<string, string> = {
    subsidy: t('govt.subsidy'), loan: t('govt.loan'),
    insurance: t('govt.insurance'), training: t('govt.training'),
  };

  const filtered = SCHEME_KEYS.filter(key => {
    const name = t(`govt.schemes.${key}.name`).toLowerCase();
    const tag  = t(`govt.schemes.${key}.tag`).toLowerCase();
    const matchSearch = name.includes(search.toLowerCase());
    const matchCat = activeCat === 'all' ||
      tag === t(`govt.${activeCat}`).toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      <PageHeader
        title={t('govt.title')}
        subtitle={t('govt.subtitle')}
        onBack={() => router.back()}
        iconName="shield-checkmark"
        iconColor="#D97706"
        iconBg="#FFFBEB"
        rightElement={
          <View style={s.countPill}>
            <Text style={s.countText}>{filtered.length}</Text>
          </View>
        }
      />

      {/* Search box */}
      <View style={[s.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Ionicons name="search-outline" size={15} color="#9CA3AF" />
        <TextInput
          style={[s.searchInput, { color: theme.text }]}
          placeholder={t('govt.search')}
          value={search} onChangeText={setSearch}
          placeholderTextColor="#9CA3AF"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={15} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Category Tabs ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={s.catScroll} contentContainerStyle={s.catContent}>
        {CATS.map(cat => (
          <TouchableOpacity key={cat}
            style={[s.catTab, { backgroundColor: theme.surface, borderColor: theme.border }, activeCat === cat && s.catTabActive]}
            onPress={() => setActiveCat(cat)} activeOpacity={0.8}>
            <Text style={[s.catLabel, { color: theme.textSecondary }, activeCat === cat && s.catLabelActive]}>
              {t(`govt.${cat}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Scheme List ── */}
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}>

        {filtered.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.lightGray} />
            <Text style={s.emptyText}>{t('govt.noScheme')}</Text>
          </View>
        )}

        {filtered.map(key => {
          const meta = SCHEME_META[key];
          return (
            <TouchableOpacity
              key={key}
              style={[s.card, { backgroundColor: theme.surface }]}
              activeOpacity={0.88}
              onPress={() => router.push({ pathname: '/govt-detail', params: { key } } as any)}
            >
              {/* Top row */}
              <View style={s.cardTop}>
                <LinearGradient colors={meta.gradColors} style={s.cardIconWrap}>
                  <Ionicons name={meta.icon as any} size={26} color={meta.iconColor} />
                </LinearGradient>
                <View style={s.cardTitleBlock}>
                  <View style={s.cardTitleRow}>
                    <Text style={[s.cardName, { color: theme.text }]} numberOfLines={2}>
                      {t(`govt.schemes.${key}.name`)}
                    </Text>
                    {meta.isNew && (
                      <View style={s.newBadge}>
                        <Text style={s.newBadgeText}>{t('govt.new')}</Text>
                      </View>
                    )}
                  </View>
                  <View style={[s.tagPill, { backgroundColor: meta.tagBg }]}>
                    <Text style={[s.tagText, { color: meta.tagColor }]}>
                      {t(`govt.schemes.${key}.tag`)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Description */}
              <Text style={[s.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                {t(`govt.schemes.${key}.desc`)}
              </Text>

              {/* Divider + CTA */}
              <View style={[s.cardDivider, { backgroundColor: theme.border }]} />
              <TouchableOpacity
                style={s.viewBtn}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: '/govt-detail', params: { key } } as any)}
              >
                <Text style={s.viewBtnText}>{t('govt.viewDetails')}</Text>
                <View style={s.viewBtnArrow}>
                  <Ionicons name="arrow-forward" size={12} color={COLORS.white} />
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  countPill: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F0FBF1', borderWidth: 1, borderColor: '#C8E6C9',
    alignItems: 'center', justifyContent: 'center',
  },
  countText: { fontSize: 13, fontWeight: '800', color: COLORS.primary },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: 11,
    marginHorizontal: SPACING.md, marginTop: SPACING.sm,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.text, padding: 0 },

  catScroll: { marginTop: SPACING.sm, flexGrow: 0, height: 44 },
  catContent: { paddingHorizontal: SPACING.md, gap: SPACING.sm, alignItems: 'center', height: 44 },
  catTab: {
    paddingHorizontal: SPACING.md, height: 34, justifyContent: 'center',
    borderRadius: RADIUS.full, backgroundColor: COLORS.white,
    borderWidth: 1.5, borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  catTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catLabel: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.textSecondary },
  catLabelActive: { color: COLORS.white },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },

  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.md, ...SHADOW.md,
  },
  cardTop: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.sm },
  cardIconWrap: {
    width: 56, height: 56, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardTitleBlock: { flex: 1, gap: 5 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  cardName: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: '800', color: COLORS.text, letterSpacing: -0.2, lineHeight: 20 },
  newBadge: {
    backgroundColor: '#E8F5E9', borderRadius: RADIUS.full,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: '#A5D6A7',
  },
  newBadgeText: { fontSize: 9, color: COLORS.primary, fontWeight: '800' },
  tagPill: {
    alignSelf: 'flex-start', borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  tagText: { fontSize: 10, fontWeight: '700' },
  cardDesc: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.sm },
  cardDivider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.sm },
  viewBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: COLORS.primary, borderRadius: RADIUS.sm,
    paddingVertical: 9,
  },
  viewBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.white },
  viewBtnArrow: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  empty: { alignItems: 'center', paddingVertical: SPACING.xl, gap: SPACING.sm },
  emptyText: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary },
});
