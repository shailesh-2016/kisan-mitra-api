import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import ProductCard from '../../components/ProductCard';
import FloatingMicButton from '../../components/FloatingMicButton';
import PageHeader from '../../components/PageHeader';

const BUY_KEYS = [
  { key: 'dap', price: '₹1,350', rating: 4.5, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300' },
  { key: 'urea', price: '₹266', rating: 4.2, image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=300' },
  { key: 'seed', price: '₹2,800/bag', rating: 4.7, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300' },
  { key: 'spray', price: '₹450', rating: 3.9, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300' },
  { key: 'drip', price: '₹3,200', rating: 4.6, image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=300' },
  { key: 'pump', price: '₹1,800', rating: 4.1, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300' },
];

const SELL_KEYS = [
  { key: 'wheat', price: '₹2,150/q', rating: 4.3, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300' },
  { key: 'rice', price: '₹3,200/q', rating: 4.5, image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=300' },
  { key: 'mustard', price: '₹5,400/q', rating: 4.0, image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300' },
  { key: 'gram', price: '₹4,800/q', rating: 4.2, image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300' },
];

export default function BazaarScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const products = tab === 'buy' ? BUY_KEYS : SELL_KEYS;
  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      <PageHeader
        title={t('bazaar.title')}
        subtitle={t('bazaar.subtitle')}
        iconName="storefront"
        iconColor="#16A34A"
        iconBg="#F0FBF1"
        rightElement={
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      {/* Toggle */}
      <View style={[styles.toggleContainer, { backgroundColor: theme.inputBg }]}>
        <TouchableOpacity
          style={[styles.toggleBtn, tab === 'buy' && [styles.toggleBtnActive, { backgroundColor: theme.surface }]]}
          onPress={() => setTab('buy')}
        >
          <Ionicons name="cart-outline" size={15} color={tab === 'buy' ? COLORS.primary : theme.textSecondary} />
          <Text style={[styles.toggleText, { color: theme.textSecondary }, tab === 'buy' && styles.toggleTextActive]}>{t('bazaar.buy')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, tab === 'sell' && [styles.toggleBtnActive, { backgroundColor: theme.surface }]]}
          onPress={() => setTab('sell')}
        >
          <Ionicons name="pricetag-outline" size={15} color={tab === 'sell' ? COLORS.primary : theme.textSecondary} />
          <Text style={[styles.toggleText, { color: theme.textSecondary }, tab === 'sell' && styles.toggleTextActive]}>{t('bazaar.sell')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {tab === 'sell' && (
          <TouchableOpacity style={styles.addListingBtn} activeOpacity={0.85}>
            <Ionicons name="add-circle-outline" size={20} color={COLORS.white} />
            <Text style={styles.addListingText}>{t('bazaar.addListing')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.grid}>
          {products.map(p => (
            <ProductCard
              key={p.key}
              name={t(`bazaar.products.${p.key}`)}
              price={p.price}
              image={p.image}
              rating={p.rating}
              viewLabel={t('bazaar.view')}
            />
          ))}
        </View>

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
              <Ionicons name="storefront-outline" size={36} color={COLORS.primary} />
            </View>
            <Text style={[styles.csTitle, { color: isDark ? '#fff' : COLORS.text }]}>{t('bazaar.comingSoonTitle')}</Text>
            <Text style={styles.csSubtitle}>{t('bazaar.comingSoonSubtitle')}</Text>
            <View style={styles.csBadge}>
              <Ionicons name="time-outline" size={13} color={COLORS.primary} />
              <Text style={styles.csBadgeText}>{t('bazaar.inDevelopment')}</Text>
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
  filterBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F0FBF1', borderWidth: 1, borderColor: '#C8E6C9',
    alignItems: 'center', justifyContent: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    margin: SPACING.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: RADIUS.md,
    padding: 4,
  },
  toggleBtn: {
    flex: 1, paddingVertical: SPACING.sm,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 5,
    borderRadius: RADIUS.sm,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.white,
    ...SHADOW.sm,
  },
  toggleText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary },
  toggleTextActive: { color: COLORS.primary },
  scroll: { flex: 1, paddingHorizontal: SPACING.md },
  addListingBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  addListingText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

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
