import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import FloatingMicButton from '../../components/FloatingMicButton';
import PageHeader from '../../components/PageHeader';

export default function AIDoctorScreen() {
  const { t } = useTranslation();
  const [uploaded, setUploaded] = useState(false);
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      <PageHeader
        title={t('ai.title')}
        subtitle={t('ai.subtitle')}
        iconName="leaf"
        iconColor="#16A34A"
        iconBg="#F0FBF1"
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {!uploaded ? (
          <>
            {/* Upload Box */}
            <View style={[styles.uploadBox, { backgroundColor: theme.surface }]}>
              <View style={styles.uploadIconCircle}>
                <Ionicons name="image-outline" size={40} color={COLORS.primary} />
              </View>
              <Text style={[styles.uploadTitle, { color: theme.text }]}>{t('ai.uploadTitle')}</Text>
              <Text style={styles.uploadSubtitle}>{t('ai.uploadSubtitle')}</Text>
              <View style={styles.uploadBtns}>
                <TouchableOpacity style={styles.uploadBtn} onPress={() => setUploaded(true)} activeOpacity={0.85}>
                  <Ionicons name="cloud-upload-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.uploadBtnText}>{t('ai.upload')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.uploadBtn, styles.cameraBtn]} onPress={() => setUploaded(true)} activeOpacity={0.85}>
                  <Ionicons name="camera-outline" size={18} color={COLORS.white} />
                  <Text style={[styles.uploadBtnText, { color: COLORS.white }]}>{t('ai.camera')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Tips */}
            <View style={[styles.tipsCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.tipsTitle, { color: theme.text }]}>Tips for better results</Text>
              {['Take photo in good light', 'Focus on affected leaf', 'Avoid blurry images'].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.tipNum}><Text style={styles.tipNumText}>{i + 1}</Text></View>
                  <Text style={styles.tipRowText}>{tip}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Image Preview */}
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400' }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.retakeBtn} onPress={() => setUploaded(false)}>
                <Ionicons name="refresh-outline" size={15} color={COLORS.white} />
                <Text style={styles.retakeBtnText}>{t('ai.retake')}</Text>
              </TouchableOpacity>
            </View>

            {/* Analysis Banner */}
            <View style={styles.analyzingBanner}>
              <View style={styles.analyzingIconWrap}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.analyzingText}>{t('ai.analysisComplete')}</Text>
            </View>

            {/* Result Card */}
            <View style={[styles.resultCard, { backgroundColor: theme.surface }]}>
              <View style={styles.resultHeader}>
                <View style={styles.diseaseBadge}>
                  <Ionicons name="warning" size={12} color={COLORS.red} />
                  <Text style={styles.diseaseBadgeText}>{t('ai.diseaseFound')}</Text>
                </View>
                <View style={styles.confidenceChip}>
                  <Text style={styles.confidence}>{t('ai.confidence', { value: 92 })}</Text>
                </View>
              </View>

              <Text style={styles.diseaseName}>{t('ai.result')}</Text>

              <View style={styles.divider} />

              <Text style={styles.solutionTitle}>{t('ai.solution')}</Text>
              {(['sol1', 'sol2', 'sol3'] as const).map((key, i) => (
                <View key={key} style={styles.solutionItem}>
                  <View style={styles.solutionNum}>
                    <Text style={styles.solutionNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.solutionText}>{t(`ai.${key}`)}</Text>
                </View>
              ))}

              <Button title={t('ai.consult')} style={styles.expertBtn} />
            </View>

            {/* Warning */}
            <View style={styles.warningCard}>
              <Ionicons name="warning-outline" size={18} color={COLORS.secondary} />
              <Text style={styles.warningText}>{t('ai.warning')}</Text>
            </View>
          </>
        )}

        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── Coming Soon Overlay (on top of everything) ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <BlurView
          intensity={22}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.comingSoonContainer} pointerEvents="none">
          <LinearGradient
            colors={isDark ? ['#1B2E1C', '#1F3320'] : ['#FFFFFF', '#F0FBF1']}
            style={styles.comingSoonCard}
          >
            <View style={styles.csIconCircle}>
              <Ionicons name="construct-outline" size={36} color={COLORS.primary} />
            </View>
            <Text style={[styles.csTitle, { color: isDark ? '#fff' : COLORS.text }]}>{t('ai.comingSoonTitle')}</Text>
            <Text style={styles.csSubtitle}>{t('ai.comingSoonSubtitle')}</Text>
            <View style={styles.csBadge}>
              <Ionicons name="time-outline" size={13} color={COLORS.primary} />
              <Text style={styles.csBadgeText}>{t('ai.inDevelopment')}</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      <FloatingMicButton />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1, padding: SPACING.md },

  // Upload
  uploadBox: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: '#C8E6C9',
    borderStyle: 'dashed',
    paddingVertical: SPACING.xl + 4,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  uploadIconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  uploadTitle: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, textAlign: 'center', letterSpacing: -0.2 },
  uploadSubtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 18 },
  uploadBtns: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm + 2 },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    paddingVertical: SPACING.sm + 3, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md, borderWidth: 1.5, borderColor: COLORS.primary,
  },
  cameraBtn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  uploadBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.primary },

  // Tips
  tipsCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.md, ...SHADOW.sm,
  },
  tipsTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm + 2 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  tipNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  tipNumText: { fontSize: FONT_SIZE.xs, fontWeight: '800', color: COLORS.primary },
  tipRowText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 18 },

  // Preview
  previewContainer: { borderRadius: RADIUS.lg, overflow: 'hidden', position: 'relative' },
  previewImage: { width: '100%', height: 230, backgroundColor: COLORS.lightGray },
  retakeBtn: {
    position: 'absolute', top: SPACING.sm, right: SPACING.sm,
    backgroundColor: COLORS.overlay, borderRadius: RADIUS.full,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.sm, paddingVertical: 5, gap: 4,
  },
  retakeBtnText: { color: COLORS.white, fontSize: FONT_SIZE.xs, fontWeight: '600' },

  // Analysis
  analyzingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primaryBg, borderRadius: RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.sm,
  },
  analyzingIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
  },
  analyzingText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '700' },

  // Result
  resultCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.sm, ...SHADOW.md,
  },
  resultHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.sm,
  },
  diseaseBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.redBg, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 5,
  },
  diseaseBadgeText: { fontSize: FONT_SIZE.xs, color: COLORS.red, fontWeight: '700' },
  confidenceChip: {
    backgroundColor: COLORS.primaryBg, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 5,
  },
  confidence: { fontSize: FONT_SIZE.xs, color: COLORS.primary, fontWeight: '700' },
  diseaseName: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.red, marginBottom: SPACING.sm, letterSpacing: -0.3 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  solutionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  solutionItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm + 2 },
  solutionNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  solutionNumText: { fontSize: FONT_SIZE.xs, fontWeight: '800', color: COLORS.primary },
  solutionText: { flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 21 },
  expertBtn: { marginTop: SPACING.sm + 2 },

  // Warning
  warningCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    backgroundColor: COLORS.secondaryBg, borderRadius: RADIUS.md,
    padding: SPACING.md, marginTop: SPACING.sm,
    borderLeftWidth: 3, borderLeftColor: COLORS.secondary,
  },
  warningText: { flex: 1, fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 21 },

  // Coming Soon
  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  comingSoonCard: {
    width: '100%',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
    ...SHADOW.lg,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  csIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  csTitle: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  csSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  csBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primaryBg,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    marginTop: SPACING.xs,
  },
  csBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
