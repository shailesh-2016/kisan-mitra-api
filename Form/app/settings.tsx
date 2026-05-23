import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Switch, Linking, Share, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { LANGUAGES, changeLanguage } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { toastService } from '../services/toastService';
import { ConfirmModal } from '../components/ConfirmModal';
import { userAPI } from '../services/api';

const APP_VERSION   = '1.0.0';
const APP_PACKAGE   = 'com.KisanPlus.app';
const PRIVACY_URL   = 'https://KisanPlus.app/privacy';
const TERMS_URL     = 'https://KisanPlus.app/terms';
const SUPPORT_EMAIL = 'support@KisanPlus.app';
const PLAY_STORE    = 'https://play.google.com/store/apps/details?id=com.KisanPlus.app';

interface RowProps {
  icon: string; iconBg: string; iconColor: string;
  label: string; sublabel?: string;
  onPress?: () => void; right?: React.ReactNode; isLast?: boolean;
}

function SettingRow({ icon, iconBg, iconColor, label, sublabel, onPress, right, isLast }: RowProps) {
  const { theme } = useTheme();
  return (
    <TouchableOpacity
      style={[s.row, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.borderLight }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[s.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={s.rowText}>
        <Text style={[s.rowLabel, { color: theme.text }]}>{label}</Text>
        {sublabel ? <Text style={[s.rowSub, { color: theme.textSecondary }]}>{sublabel}</Text> : null}
      </View>
      {right ?? (onPress ? (
        <View style={[s.chevronWrap, { backgroundColor: theme.inputBg }]}>
          <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} />
        </View>
      ) : null)}
    </TouchableOpacity>
  );
}

interface ToggleRowProps extends Omit<RowProps, 'right'> {
  value: boolean; onToggle: (v: boolean) => void;
}
function ToggleRow({ value, onToggle, ...rest }: ToggleRowProps) {
  const { theme } = useTheme();
  return (
    <SettingRow
      {...rest}
      right={
        <Switch
          value={value} onValueChange={onToggle}
          trackColor={{ false: theme.switchTrackOff, true: theme.primaryLight + '80' }}
          thumbColor={value ? theme.primary : '#9CA3AF'}
          ios_backgroundColor={theme.switchTrackOff}
        />
      }
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <View style={s.section}>
      <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{title}</Text>
      <View style={[s.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { t, i18n }  = useTranslation();
  const router       = useRouter();
  const { user, isLoggedIn, logout, setUser } = useAuth();
  const { settings, updateSetting } = useSettings();
  const { theme, isDark, setDark }  = useTheme();

  const [loggingOut,    setLoggingOut]    = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [logoutModal,   setLogoutModal]   = useState(false);
  const [clearModal,    setClearModal]    = useState(false);

  const openUrl = (url: string) => Linking.openURL(url).catch(() => {});

  const handleLanguageChange = async (code: string) => {
    await changeLanguage(code);
    toastService.success(t('settings.langChanged'));
  };

  const handleDarkModeToggle = async (v: boolean) => {
    await updateSetting('darkMode', v);
    await setDark(v);
  };

  const handleLogout = async () => {
    setLogoutModal(false);
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
    router.replace('/(tabs)' as any);
  };

  const handleClearCache = async () => {
    setClearModal(false);
    setClearingCache(true);
    try {
      const keys = await AsyncStorage.getAllKeys();
      const safe = ['@kisan_token','@kisan_user','@kisan_settings_v1','@kisan_app_language','@kisan_theme_v1'];
      const toRemove = keys.filter(k => !safe.includes(k));
      if (toRemove.length) await AsyncStorage.multiRemove(toRemove);
      toastService.success(t('settings.cacheCleared'));
    } catch {
      toastService.error(t('settings.cacheFailed'));
    } finally {
      setClearingCache(false);
    }
  };

  const handleShareApp = async () => {
    try { await Share.share({ message: `${t('settings.shareMsg')} ${PLAY_STORE}`, title: 'Kisan Plus' }); } catch {}
  };

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';
  const location = [user?.village, user?.district, user?.state].filter(Boolean).join(', ') || '—';

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>

      {/* Header */}
      <View style={[s.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
          onPress={() => router.back()} activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <View style={[s.headerIconWrap, { backgroundColor: theme.primaryBg }]}>
            <Ionicons name="settings" size={16} color={theme.primary} />
          </View>
          <Text style={[s.headerTitle, { color: theme.text }]}>{t('settings.title')}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces>

        {/* Profile Banner */}
        {isLoggedIn && user ? (
          <LinearGradient
            colors={['#1B5E20','#2E7D32','#43A047']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.profileBanner}
          >
            <View style={s.bannerBlob1} /><View style={s.bannerBlob2} />
            <View style={s.bannerAvatar}>
              <Text style={s.bannerAvatarText}>{initials}</Text>
            </View>
            <View style={s.bannerInfo}>
              <Text style={s.bannerName} numberOfLines={1}>{user.name}</Text>
              <View style={s.bannerLocRow}>
                <Ionicons name="location-sharp" size={11} color="rgba(255,255,255,0.8)" />
                <Text style={s.bannerLoc} numberOfLines={1}>{location}</Text>
              </View>
              {user.bio ? <Text style={s.bannerBio} numberOfLines={1}>{user.bio}</Text> : null}
            </View>
            <TouchableOpacity style={s.bannerEditBtn} onPress={() => router.push('/edit-profile' as any)} activeOpacity={0.8}>
              <Ionicons name="pencil" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          <View style={[s.guestBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[s.guestAvatarWrap, { backgroundColor: theme.primaryBg }]}>
              <Ionicons name="person-circle-outline" size={52} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.guestName, { color: theme.text }]}>{t('profile.guestTitle')}</Text>
              <Text style={[s.guestSub, { color: theme.textSecondary }]}>{t('settings.loginToAccess')}</Text>
            </View>
            <TouchableOpacity style={[s.guestLoginBtn, { backgroundColor: theme.primary }]} onPress={() => router.push('/login' as any)} activeOpacity={0.85}>
              <Text style={s.guestLoginText}>{t('profile.login')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ACCOUNT */}
        <Section title={t('settings.sectionAccount')}>
          <SettingRow icon="person-outline" iconBg="#E8F5E9" iconColor="#2E7D32"
            label={t('settings.editProfile')} sublabel={isLoggedIn ? user?.name : undefined}
            onPress={() => router.push('/edit-profile' as any)} />
          <SettingRow icon="language-outline" iconBg="#E3F2FD" iconColor="#1565C0"
            label={t('settings.changeLanguage')}
            sublabel={LANGUAGES.find(l => l.code === i18n.language)?.label}
            isLast={!isLoggedIn}
            right={
              <View style={s.langPills}>
                {LANGUAGES.map(lang => (
                  <TouchableOpacity key={lang.code}
                    style={[s.langPill, { backgroundColor: theme.inputBg, borderColor: theme.border },
                      i18n.language === lang.code && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                    onPress={() => handleLanguageChange(lang.code)} activeOpacity={0.8}>
                    <Text style={[s.langPillText, { color: theme.textSecondary },
                      i18n.language === lang.code && { color: '#FFFFFF' }]}>
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            }
          />
          {isLoggedIn && (
            <SettingRow icon="log-out-outline" iconBg="#FFEBEE" iconColor="#C62828"
              label={t('profile.logout')} onPress={() => setLogoutModal(true)} isLast
              right={loggingOut ? <ActivityIndicator size="small" color={theme.red} /> : undefined}
            />
          )}
        </Section>

        {/* NOTIFICATIONS */}
        <Section title={t('settings.sectionNotifications')}>
          <ToggleRow icon="cloud-outline" iconBg="#E3F2FD" iconColor="#1565C0"
            label={t('settings.weatherAlerts')} value={settings.weatherAlerts}
            onToggle={v => updateSetting('weatherAlerts', v)} />
          <ToggleRow icon="trending-up-outline" iconBg="#FFF8E1" iconColor="#F57F17"
            label={t('settings.mandiAlerts')} value={settings.mandiAlerts}
            onToggle={v => updateSetting('mandiAlerts', v)} />
          <ToggleRow icon="alarm-outline" iconBg="#F3E5F5" iconColor="#7B1FA2"
            label={t('settings.reminderNotifs')} value={settings.reminderNotifs}
            onToggle={v => updateSetting('reminderNotifs', v)} />
          <ToggleRow icon="volume-high-outline" iconBg="#E8F5E9" iconColor="#2E7D32"
            label={t('settings.sound')} value={settings.soundEnabled}
            onToggle={v => updateSetting('soundEnabled', v)} isLast />
        </Section>

        {/* APP PREFERENCES */}
        <Section title={t('settings.sectionPreferences')}>
          <ToggleRow icon="moon-outline" iconBg="#EDE7F6" iconColor="#512DA8"
            label={t('settings.darkMode')}
            sublabel={isDark ? t('settings.darkModeOn') : t('settings.darkModeOff')}
            value={isDark} onToggle={handleDarkModeToggle} />
          <SettingRow icon="scale-outline" iconBg="#FFF8E1" iconColor="#F57F17"
            label={t('settings.unit')}
            right={
              <View style={[s.unitToggle, { backgroundColor: theme.inputBg }]}>
                {(['kg','quintal'] as const).map(u => (
                  <TouchableOpacity key={u}
                    style={[s.unitBtn, settings.unit === u && [s.unitBtnActive, { backgroundColor: theme.surface }]]}
                    onPress={() => updateSetting('unit', u)} activeOpacity={0.8}>
                    <Text style={[s.unitBtnText, { color: theme.textSecondary },
                      settings.unit === u && { color: theme.primary, fontWeight: '700' }]}>
                      {u === 'kg' ? t('settings.unitKg') : t('settings.unitQuintal')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            }
          />
          <ToggleRow icon="location-outline" iconBg="#FCE4EC" iconColor="#C62828"
            label={t('settings.locationAccess')} sublabel={t('settings.locationSub')}
            value={settings.locationAccess} onToggle={v => updateSetting('locationAccess', v)} isLast />
        </Section>

        {/* DATA & STORAGE */}
        <Section title={t('settings.sectionData')}>
          <SettingRow icon="trash-outline" iconBg="#FFEBEE" iconColor="#C62828"
            label={t('settings.clearCache')} sublabel={t('settings.clearCacheSub')}
            onPress={() => setClearModal(true)}
            right={clearingCache ? <ActivityIndicator size="small" color={theme.primary} /> : undefined} />
          <SettingRow icon="sync-outline" iconBg="#E3F2FD" iconColor="#1565C0"
            label={t('settings.syncData')} sublabel={t('settings.syncDataSub')}
            onPress={() => toastService.info(t('settings.syncStarted'))} isLast />
        </Section>

        {/* SUPPORT */}
        <Section title={t('settings.sectionSupport')}>
          <SettingRow icon="help-circle-outline" iconBg="#E3F2FD" iconColor="#1565C0"
            label={t('settings.helpFaq')} onPress={() => openUrl('https://KisanPlus.app/help')} />
          <SettingRow icon="chatbubble-outline" iconBg="#E8F5E9" iconColor="#2E7D32"
            label={t('settings.contactSupport')} sublabel={SUPPORT_EMAIL}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Kisan Plus Support`).catch(() => {})} />
          <SettingRow icon="bug-outline" iconBg="#FFF8E1" iconColor="#F57F17"
            label={t('settings.reportProblem')}
            onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Bug Report - Kisan Plus v${APP_VERSION}`).catch(() => {})}
            isLast />
        </Section>

        {/* LEGAL */}
        <Section title={t('settings.sectionLegal')}>
          <SettingRow icon="shield-checkmark-outline" iconBg="#E8F5E9" iconColor="#2E7D32"
            label={t('settings.privacyPolicy')}
            onPress={() => router.push('/privacy-policy' as any)} />
          <SettingRow icon="document-text-outline" iconBg="#E3F2FD" iconColor="#1565C0"
            label={t('settings.termsConditions')}
            onPress={() => router.push('/terms-conditions' as any)} isLast />
        </Section>

        {/* ABOUT */}
        <Section title={t('settings.sectionAbout')}>
          <SettingRow icon="leaf" iconBg="#E8F5E9" iconColor="#2E7D32"
            label={t('settings.appVersion')} sublabel={`v${APP_VERSION} (${APP_PACKAGE})`}
            right={
              <View style={[s.versionBadge, { backgroundColor: theme.primaryBg }]}>
                <Text style={[s.versionBadgeText, { color: theme.primary }]}>{t('settings.latest')}</Text>
              </View>
            }
          />
          <SettingRow icon="code-slash-outline" iconBg="#F3E5F5" iconColor="#7B1FA2"
            label={t('settings.developer')} sublabel="Kisan Plus Team" />
          <SettingRow icon="share-social-outline" iconBg="#FFF8E1" iconColor="#F57F17"
            label={t('settings.shareApp')} onPress={handleShareApp} isLast />
        </Section>

        {/* DANGER ZONE */}
        {isLoggedIn && (
          <View style={s.dangerSection}>
            <Text style={[s.dangerTitle, { color: theme.textSecondary }]}>{t('settings.sectionDanger')}</Text>
            <TouchableOpacity
              style={[s.deleteBtn, { borderColor: theme.red + '60', backgroundColor: theme.redBg }]}
              onPress={() => router.push('/delete-account' as any)}
              activeOpacity={0.85}
            >
              <View style={[s.deleteIconWrap, { backgroundColor: theme.red + '20' }]}>
                <Ionicons name="person-remove-outline" size={20} color={theme.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.deleteText, { color: theme.red }]}>{t('settings.deleteAccount')}</Text>
                <Text style={[s.deleteSub, { color: theme.red + 'AA' }]}>{t('settings.deleteAccountSub')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.red} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <ConfirmModal visible={logoutModal} title={t('settings.logoutTitle')} message={t('settings.logoutMsg')}
        confirmText={t('profile.logout')} cancelText={t('machine.cancel')}
        confirmColor={theme.red} icon="log-out-outline" iconColor={theme.red}
        onConfirm={handleLogout} onCancel={() => setLogoutModal(false)} />

      <ConfirmModal visible={clearModal} title={t('settings.clearCacheTitle')} message={t('settings.clearCacheMsg')}
        confirmText={t('settings.clearCache')} cancelText={t('machine.cancel')}
        confirmColor="#E65100" icon="trash-outline" iconColor="#E65100"
        onConfirm={handleClearCache} onCancel={() => setClearModal(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: 12,
    borderBottomWidth: 1, ...SHADOW.sm,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800', letterSpacing: -0.3 },
  profileBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: SPACING.md, marginTop: SPACING.md,
    borderRadius: RADIUS.lg, padding: SPACING.md, overflow: 'hidden', ...SHADOW.md,
  },
  bannerBlob1: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)', top: -40, right: -20 },
  bannerBlob2: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(249,168,37,0.08)', bottom: -10, left: 20 },
  bannerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  bannerAvatarText: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  bannerInfo: { flex: 1, gap: 3 },
  bannerName: { fontSize: FONT_SIZE.md, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.2 },
  bannerLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  bannerLoc: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '500', flex: 1 },
  bannerBio: { fontSize: 10, color: 'rgba(255,255,255,0.65)', fontStyle: 'italic' },
  bannerEditBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  guestBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: SPACING.md, marginTop: SPACING.md, borderRadius: RADIUS.lg, padding: SPACING.md, ...SHADOW.sm, borderWidth: 1 },
  guestAvatarWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  guestName: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  guestSub: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  guestLoginBtn: { borderRadius: RADIUS.sm, paddingHorizontal: 14, paddingVertical: 8 },
  guestLoginText: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: '#FFFFFF' },
  section: { paddingHorizontal: SPACING.md, marginTop: SPACING.lg },
  sectionTitle: { fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm, paddingLeft: 4 },
  card: { borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOW.sm, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: SPACING.md, gap: 12, minHeight: 56 },
  rowIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600', letterSpacing: -0.1 },
  rowSub: { fontSize: FONT_SIZE.xs, fontWeight: '400' },
  chevronWrap: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  langPills: { flexDirection: 'row', gap: 4 },
  langPill: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: RADIUS.sm, borderWidth: 1.5 },
  langPillText: { fontSize: 10, fontWeight: '700' },
  unitToggle: { flexDirection: 'row', gap: 4, borderRadius: RADIUS.sm, padding: 3 },
  unitBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.sm - 2 },
  unitBtnActive: { ...SHADOW.sm },
  unitBtnText: { fontSize: 11, fontWeight: '600' },
  versionBadge: { borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
  versionBadgeText: { fontSize: 10, fontWeight: '700' },
  dangerSection: { paddingHorizontal: SPACING.md, marginTop: SPACING.xl },
  dangerTitle: { fontSize: FONT_SIZE.xs, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: SPACING.sm, paddingLeft: 4 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1.5 },
  deleteIconWrap: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  deleteText: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  deleteSub: { fontSize: FONT_SIZE.xs, marginTop: 2 },
});
