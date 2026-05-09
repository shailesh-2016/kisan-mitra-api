import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { SCHEME_META, SchemeKey } from './govt-schemes';
import { SCHEME_DATA } from '../constants/schemeData';
import PageHeader from '../components/PageHeader';
import { useTheme } from '../context/ThemeContext';

const STEP_COLORS = ['#E8F5E9', '#E3F2FD', '#FFF8E1', '#FCE4EC'];
const STEP_ICON_COLORS = ['#2E7D32', '#1565C0', '#F57F17', '#C62828'];

export default function GovtDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { key } = useLocalSearchParams<{ key: string }>();
  const schemeKey = (key as SchemeKey) ?? 'pmKisan';
  const meta = SCHEME_META[schemeKey];
  const data = SCHEME_DATA[schemeKey];
  const { theme, isDark } = useTheme();

  // Pick correct language
  const lang = (i18n.language?.startsWith('hi') ? 'hi' : i18n.language?.startsWith('gu') ? 'gu' : 'en') as 'en' | 'hi' | 'gu';

  const benefits    = data.benefits.map(b => b[lang]);
  const eligibility = data.eligibility.map(e => e[lang]);
  const docs        = data.docs.map(d => d[lang]);
  const steps       = data.steps.map(s => s[lang]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      <PageHeader
        title={t(`govt.schemes.${schemeKey}.name`)}
        subtitle={t(`govt.schemes.${schemeKey}.tag`)}
        onBack={() => router.back()}
        iconName={meta.icon as any}
        iconColor={meta.iconColor}
        iconBg={meta.iconBg}
      />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}>

        {/* ── Benefits ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconWrap, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="gift" size={16} color={COLORS.primary} />
            </View>
            <Text style={[s.sectionTitle, { color: theme.text }]}>{t('govt.benefits')}</Text>
          </View>
          <View style={[s.listCard, { backgroundColor: theme.surface }]}>
            {benefits.map((b, i) => (
              <View key={i} style={[s.listRow, i < benefits.length - 1 && [s.listRowBorder, { borderBottomColor: theme.borderLight }]]}>
                <View style={s.listDot} />
                <Text style={[s.listText, { color: theme.text }]}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Eligibility ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconWrap, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="person-circle" size={16} color="#1565C0" />
            </View>
            <Text style={[s.sectionTitle, { color: theme.text }]}>{t('govt.eligibility')}</Text>
          </View>
          <View style={[s.listCard, { backgroundColor: theme.surface }]}>
            {eligibility.map((e, i) => (
              <View key={i} style={[s.listRow, i < eligibility.length - 1 && [s.listRowBorder, { borderBottomColor: theme.borderLight }]]}>
                <Ionicons name="checkmark-circle" size={16} color="#1565C0" />
                <Text style={[s.listText, { color: theme.text }]}>{e}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Documents ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconWrap, { backgroundColor: '#FFF8E1' }]}>
              <Ionicons name="document-text" size={16} color="#F57F17" />
            </View>
            <Text style={[s.sectionTitle, { color: theme.text }]}>{t('govt.documents')}</Text>
          </View>
          <View style={s.docsGrid}>
            {docs.map((doc, i) => (
              <View key={i} style={[s.docChip, { backgroundColor: theme.surface }]}>
                <Ionicons name="document-attach" size={14} color="#F57F17" />
                <Text style={[s.docText, { color: theme.text }]}>{doc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── How to Apply ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconWrap, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="list" size={16} color="#7B1FA2" />
            </View>
            <Text style={[s.sectionTitle, { color: theme.text }]}>{t('govt.howToApply')}</Text>
          </View>
          {steps.map((step, i) => (
            <View key={i} style={s.stepRow}>
              <LinearGradient
                colors={[STEP_COLORS[i % 4], STEP_COLORS[i % 4]]}
                style={s.stepNumWrap}
              >
                <Text style={[s.stepNum, { color: STEP_ICON_COLORS[i % 4] }]}>{i + 1}</Text>
              </LinearGradient>
              {i < steps.length - 1 && <View style={s.stepLine} />}
              <View style={s.stepContent}>
                <Text style={[s.stepLabel, { color: theme.textSecondary }]}>{t('govt.step')} {i + 1}</Text>
                <Text style={[s.stepText, { color: theme.text }]}>{step}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Apply CTA ── */}
      <View style={[s.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity style={s.applyBtn} activeOpacity={0.85}>
          <Ionicons name="send" size={18} color={COLORS.white} />
          <Text style={s.applyBtnText}>{t('govt.applyNow')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  section: { paddingHorizontal: SPACING.md, marginTop: SPACING.lg },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm,
  },
  sectionIconWrap: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '800', color: COLORS.text, letterSpacing: -0.2 },

  listCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    overflow: 'hidden', ...SHADOW.sm,
  },
  listRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.md,
  },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  listDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.primary, flexShrink: 0,
  },
  listText: { flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.text, lineHeight: 20, fontWeight: '500' },

  docsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  docChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.white, borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm + 2, paddingVertical: SPACING.sm,
    borderWidth: 1, borderColor: '#FFE082', ...SHADOW.sm,
  },
  docText: { fontSize: FONT_SIZE.xs, color: COLORS.text, fontWeight: '600' },

  stepRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: SPACING.md, marginBottom: SPACING.sm, position: 'relative',
  },
  stepNumWrap: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  stepNum: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  stepLine: {
    position: 'absolute', left: 17, top: 36,
    width: 2, height: SPACING.sm + 4,
    backgroundColor: COLORS.border,
  },
  stepContent: { flex: 1, paddingTop: 2 },
  stepLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 2 },
  stepText: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: '600', lineHeight: 20 },

  bottomBar: {
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  applyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: SPACING.sm, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md, paddingVertical: SPACING.md,
    ...SHADOW.md,
  },
  applyBtnText: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.white, letterSpacing: -0.2 },
});
