import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Image, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { LANGUAGES, changeLanguage, getStoredLanguage } from '../../i18n';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';

// ── Menu groups (only shown when logged in) ───────────────────────────────────
const MENU_GROUPS = [
  {
    groupKey: 'farm',
    items: [
      { id: '1', icon: 'leaf',        key: 'myCrops',    badge: null, iconBg: '#E8F5E9', iconColor: '#2E7D32' },
      { id: '2', icon: 'cart',        key: 'myOrders',   badge: null, iconBg: '#E3F2FD', iconColor: '#1565C0' },
      { id: '3', icon: 'stats-chart', key: 'myEarnings', badge: null, iconBg: '#F3E5F5', iconColor: '#7B1FA2' },
    ],
  },
  {
    groupKey: 'support',
    items: [
      { id: '4', icon: 'document-text', key: 'govtScheme', badge: null, iconBg: '#FFF8E1', iconColor: '#F57F17' },
      { id: '5', icon: 'help-circle',   key: 'help',       badge: null, iconBg: '#FCE4EC', iconColor: '#C62828' },
      { id: '6', icon: 'trash',         key: 'trash',      badge: null, iconBg: '#FFEBEE', iconColor: '#D32F2F' },
      { id: '7', icon: 'settings',      key: 'settings',   badge: null, iconBg: '#F5F5F5', iconColor: '#616161' },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getLocation(user: { village?: string; district?: string; state?: string }): string {
  return [user.village, user.district, user.state].filter(Boolean).join(', ') || '—';
}

// ── Screen ────────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isLoggedIn, user, loading, logout } = useAuth();
  const [activeLang, setActiveLang] = useState(i18n.language);
  const [loggingOut, setLoggingOut] = useState(false);
  const { theme, isDark } = useTheme();

  useEffect(() => { getStoredLanguage().then(setActiveLang); }, []);

  const handleLanguageChange = async (code: string) => {
    setActiveLang(code);
    await changeLanguage(code);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  // ── Loading splash ──
  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      <PageHeader
        title={t('profile.title')}
        iconName="person"
        iconColor="#16A34A"
        iconBg="#F0FBF1"
        rightElement={
          isLoggedIn ? (
            <TouchableOpacity
              style={styles.editBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/edit-profile' as any)}
            >
              <Ionicons name="pencil" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* ── LOGGED IN: Profile Card ── */}
        {isLoggedIn && user ? (
          <>
            {/* Profile Card */}
            <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {/* Avatar */}
              <View style={styles.avatarOuter}>
                {user.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
                ) : (
                  <LinearGradient
                    colors={[COLORS.primary, '#43A047']}
                    style={styles.avatarGrad}
                  >
                    <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
                  </LinearGradient>
                )}
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={9} color={COLORS.white} />
                </View>
              </View>

              {/* Name + location */}
              <View style={styles.heroInfo}>
                <Text style={[styles.heroName, { color: theme.text }]} numberOfLines={1}>{user.name}</Text>
                <View style={styles.heroLocationRow}>
                  <Ionicons name="location-sharp" size={11} color={COLORS.primary} />
                  <Text style={[styles.heroLocation, { color: theme.textSecondary }]} numberOfLines={1}>
                    {getLocation(user)}
                  </Text>
                </View>
                {user.bio ? (
                  <Text style={styles.heroBio} numberOfLines={2}>{user.bio}</Text>
                ) : null}
                <View style={styles.heroPill}>
                  <View style={styles.heroPillDot} />
                  <Text style={styles.heroPillText}>Kisan Mitra Member</Text>
                </View>
              </View>
            </View>

            {/* Social Profile Button */}
            <TouchableOpacity
              style={[styles.socialProfileBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              activeOpacity={0.85}
              onPress={() => router.push('/social-profile' as any)}
            >
              <LinearGradient colors={['#1B5E20', '#43A047']} style={styles.socialProfileIconWrap}>
                <Ionicons name="people" size={18} color={COLORS.white} />
              </LinearGradient>
              <View style={styles.socialProfileInfo}>
                <Text style={[styles.socialProfileTitle, { color: theme.text }]}>{t('profile.socialProfile')}</Text>
                <Text style={[styles.socialProfileSub, { color: theme.textSecondary }]}>
                  {user.followersCount || 0} {t('social.followers')} · {user.followingCount || 0} {t('social.following')}
                </Text>
              </View>
              <View style={[styles.menuChevronWrap, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="chevron-forward" size={13} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>

            {/* Mobile info strip */}
            <View style={[styles.mobileStrip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="call-outline" size={14} color={COLORS.primary} />
              <Text style={[styles.mobileStripText, { color: theme.text }]}>+91 {user.mobile}</Text>
              <View style={styles.mobileVerifiedPill}>
                <Ionicons name="shield-checkmark" size={11} color="#16A34A" />
                <Text style={styles.mobileVerifiedText}>{t('profile.verified')}</Text>
              </View>
            </View>

            {/* ── Language Selector ── */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="language" size={15} color={COLORS.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.language')}</Text>
              </View>
              <View style={styles.langRow}>
                {LANGUAGES.map(lang => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langBtn, { backgroundColor: theme.surface, borderColor: theme.border }, activeLang === lang.code && styles.langBtnActive]}
                    onPress={() => handleLanguageChange(lang.code)}
                    activeOpacity={0.8}
                  >
                    {activeLang === lang.code
                      ? <Ionicons name="checkmark-circle" size={15} color={COLORS.white} />
                      : <View style={styles.langDot} />
                    }
                    <Text style={[styles.langText, activeLang === lang.code && styles.langTextActive]}>
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ── Menu Groups ── */}
            {MENU_GROUPS.map(group => (
              <View key={group.groupKey} style={styles.section}>
                <View style={[styles.menuCard, { backgroundColor: theme.surface }]}>
                  {group.items.map((item, idx) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.menuItem,
                        idx < group.items.length - 1 && [styles.menuItemBorder, { borderBottomColor: theme.borderLight }],
                      ]}
                      activeOpacity={0.72}
                      onPress={() => {
                        if (item.key === 'settings') router.push('/settings' as any);
                        else if (item.key === 'govtScheme') router.push('/govt-schemes' as any);
                        else if (item.key === 'trash') router.push('/trash' as any);
                      }}
                    >
                      <View style={[styles.menuIconWrap, { backgroundColor: item.iconBg }]}>
                        <Ionicons name={item.icon as any} size={18} color={item.iconColor} />
                      </View>
                      <Text style={[styles.menuLabel, { color: theme.text }]}>{t(`profile.${item.key}`)}</Text>
                      <View style={styles.menuRight}>
                        {item.badge && (
                          <View style={[styles.menuBadge, { backgroundColor: item.iconColor }]}>
                            <Text style={styles.menuBadgeText}>{item.badge}</Text>
                          </View>
                        )}
                        <View style={[styles.menuChevronWrap, { backgroundColor: theme.inputBg }]}>
                          <Ionicons name="chevron-forward" size={13} color={COLORS.textSecondary} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}

            {/* ── App Info ── */}
            <View style={styles.section}>
              <View style={[styles.appInfoCard, { backgroundColor: theme.surface }]}>
                <View style={styles.appInfoLeft}>
                  <View style={styles.appInfoIconWrap}>
                    <Ionicons name="leaf" size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={[styles.appInfoName, { color: theme.text }]}>Kisan Mitra</Text>
                    <Text style={[styles.appInfoVersion, { color: theme.textSecondary }]}>Version 1.0.0</Text>
                  </View>
                </View>
                <View style={styles.appInfoBadge}>
                  <Text style={styles.appInfoBadgeText}>Latest</Text>
                </View>
              </View>
            </View>

            {/* ── Logout ── */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.logoutBtn}
                activeOpacity={0.85}
                onPress={handleLogout}
                disabled={loggingOut}
              >
                <View style={styles.logoutIconWrap}>
                  {loggingOut
                    ? <ActivityIndicator size="small" color={COLORS.red} />
                    : <Ionicons name="log-out-outline" size={18} color={COLORS.red} />
                  }
                </View>
                <Text style={styles.logoutText}>{t('profile.logout')}</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.red} />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          /* ── NOT LOGGED IN ── */
          <>
            {/* Guest card */}
            <View style={styles.guestCard}>
              <LinearGradient
                colors={['#E8F5E9', '#F1F8E9']}
                style={styles.guestGrad}
              >
                <View style={styles.guestAvatarWrap}>
                  <Ionicons name="person-circle-outline" size={72} color={COLORS.primary} />
                </View>
                <Text style={styles.guestTitle}>{t('profile.guestTitle')}</Text>
                <Text style={styles.guestSubtitle}>{t('profile.guestSubtitle')}</Text>
              </LinearGradient>
            </View>

            {/* Auth buttons */}
            <View style={styles.authSection}>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={() => router.push('/login' as any)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#1B5E20', '#2E7D32', '#43A047']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.loginBtnGrad}
                >
                  <Ionicons name="log-in-outline" size={18} color={COLORS.white} />
                  <Text style={styles.loginBtnText}>{t('profile.login')}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerBtn}
                onPress={() => router.push('/register' as any)}
                activeOpacity={0.85}
              >
                <Ionicons name="person-add-outline" size={17} color={COLORS.primary} />
                <Text style={styles.registerBtnText}>{t('profile.register')}</Text>
              </TouchableOpacity>
            </View>

            {/* Language selector (always visible) */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconWrap}>
                  <Ionicons name="language" size={15} color={COLORS.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('profile.language')}</Text>
              </View>
              <View style={styles.langRow}>
                {LANGUAGES.map(lang => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langBtn, { backgroundColor: theme.surface, borderColor: theme.border }, activeLang === lang.code && styles.langBtnActive]}
                    onPress={() => handleLanguageChange(lang.code)}
                    activeOpacity={0.8}
                  >
                    {activeLang === lang.code
                      ? <Ionicons name="checkmark-circle" size={15} color={COLORS.white} />
                      : <View style={styles.langDot} />
                    }
                    <Text style={[styles.langText, activeLang === lang.code && styles.langTextActive]}>
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* App info */}
            <View style={styles.section}>
              <View style={[styles.appInfoCard, { backgroundColor: theme.surface }]}>
                <View style={styles.appInfoLeft}>
                  <View style={styles.appInfoIconWrap}>
                    <Ionicons name="leaf" size={20} color={COLORS.primary} />
                  </View>
                  <View>
                    <Text style={[styles.appInfoName, { color: theme.text }]}>Kisan Mitra</Text>
                    <Text style={[styles.appInfoVersion, { color: theme.textSecondary }]}>Version 1.0.0</Text>
                  </View>
                </View>
                <View style={styles.appInfoBadge}>
                  <Text style={styles.appInfoBadgeText}>Latest</Text>
                </View>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── Profile Card ──
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  editBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F0FBF1', borderWidth: 1, borderColor: '#C8E6C9',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarOuter: { position: 'relative', width: 68, height: 68 },
  avatarGrad: {
    width: 68, height: 68, borderRadius: 34,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImage: { width: 68, height: 68, borderRadius: 34 },
  avatarText: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  verifiedBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.secondary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  heroInfo: { flex: 1, gap: 4 },
  heroName: { fontSize: 17, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
  heroLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  heroLocation: { fontSize: 11, color: '#6B7280', fontWeight: '500', flex: 1 },
  heroBio: { fontSize: 11, color: COLORS.textSecondary, fontStyle: 'italic', lineHeight: 16 },
  heroPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    alignSelf: 'flex-start', backgroundColor: '#F0FBF1',
    borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#C8E6C9', marginTop: 2,
  },
  heroPillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80' },
  heroPillText: { fontSize: 10, color: COLORS.primary, fontWeight: '600' },

  // Mobile strip
  mobileStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 8,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  mobileStripText: { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  mobileVerifiedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#F0FBF1', borderRadius: 100,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  mobileVerifiedText: { fontSize: 10, color: '#16A34A', fontWeight: '600' },

  // ── Guest ──
  guestCard: {
    marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 3,
  },
  guestGrad: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  guestAvatarWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  guestTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  guestSubtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },

  // ── Auth Buttons ──
  authSection: {
    paddingHorizontal: SPACING.md, marginTop: SPACING.lg, gap: SPACING.sm,
  },
  loginBtn: { borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOW.md },
  loginBtnGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md,
  },
  loginBtnText: { fontSize: FONT_SIZE.md, fontWeight: '800', color: COLORS.white },
  registerBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.md, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryBg,
  },
  registerBtnText: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.primary },

  // ── Section ──
  section: { paddingHorizontal: SPACING.md, marginTop: SPACING.lg },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: SPACING.sm, marginBottom: SPACING.sm,
  },
  sectionIconWrap: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, letterSpacing: -0.1 },

  // ── Language ──
  langRow: { flexDirection: 'row', gap: SPACING.sm },
  langBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 5,
    paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.md,
    backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  langBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.lightGray },
  langText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary },
  langTextActive: { color: COLORS.white },

  // ── Menu ──
  menuCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    overflow: 'hidden', ...SHADOW.md,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, gap: SPACING.md,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  menuIconWrap: {
    width: 40, height: 40, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text, letterSpacing: -0.1 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  menuBadge: {
    borderRadius: RADIUS.full, minWidth: 20, height: 20,
    paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center',
  },
  menuBadgeText: { fontSize: 10, color: COLORS.white, fontWeight: '800' },
  menuChevronWrap: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center',
  },

  // ── App Info ──
  appInfoCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    padding: SPACING.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between', ...SHADOW.sm,
  },
  appInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  appInfoIconWrap: {
    width: 40, height: 40, borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center',
  },
  appInfoName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  appInfoVersion: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  appInfoBadge: {
    backgroundColor: '#E8F5E9', borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
  },
  appInfoBadgeText: { fontSize: FONT_SIZE.xs, color: COLORS.primary, fontWeight: '700' },

  // ── Social Profile Button ──
  socialProfileBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginHorizontal: SPACING.md, marginTop: SPACING.sm,
    borderRadius: RADIUS.md, padding: SPACING.md,
    borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  socialProfileIconWrap: {
    width: 40, height: 40, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  socialProfileInfo: { flex: 1 },
  socialProfileTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', letterSpacing: -0.1 },
  socialProfileSub: { fontSize: FONT_SIZE.xs, marginTop: 2, fontWeight: '500' },

  // ── Logout ──
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: '#FFF5F5', borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1.5, borderColor: '#FECACA',
  },
  logoutIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center',
  },
  logoutText: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.red },
});
