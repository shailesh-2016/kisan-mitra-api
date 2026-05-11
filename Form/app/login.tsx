import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import KisanLogo from '../components/KisanLogo';
import { authAPI } from '../services/api';

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const { theme, isDark } = useTheme();
  const inputRef = useRef<TextInput>(null);

  const handleSendOtp = () => {
    if (mobile.length < 10 || loading) return;
    setLoading(true);
    // Navigate immediately for instant feedback
    router.push({ pathname: '/otp', params: { mobile, mode: 'login' } } as any);
    
    // Trigger OTP in background
    authAPI.sendOtp(mobile).catch(err => {
      console.log('Background OTP send error:', err.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >

          {/* Skip */}
          <TouchableOpacity style={s.skipBtn} onPress={() => router.replace('/(tabs)' as any)} activeOpacity={0.7}>
            <Text style={s.skipText}>{t('auth.skip')}</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Hero illustration area */}
          <View style={s.heroArea}>
            <LinearGradient colors={['#E8F5E9','#C8E6C9','#A5D6A7']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroBg}>
              <View style={s.heroBlob1} />
              <View style={s.heroBlob2} />
              <View style={s.illustration}>
                <Text style={s.illustEmoji}>🌾</Text>
                <View style={s.illustRow}>
                  <Text style={s.illustEmojiSm}>🚜</Text>
                  <Text style={s.illustEmojiSm}>☀️</Text>
                  <Text style={s.illustEmojiSm}>🌱</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Logo + tagline */}
          <View style={s.logoSection}>
            <KisanLogo size="lg" variant="full" />
            <Text style={s.tagline}>{t('auth.tagline')}</Text>
          </View>

          {/* Card */}
          <View style={[s.card, { backgroundColor: theme.surface }]}>
            <Text style={[s.cardTitle, { color: theme.text }]}>{t('auth.mobileNumber')}</Text>
            <Text style={[s.cardSubtitle, { color: theme.textSecondary }]}>{t('auth.mobilePlaceholder')}</Text>

            <TouchableOpacity
              activeOpacity={1}
              onPress={() => inputRef.current?.focus()}
              style={[s.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }, focused && [s.inputWrapFocused, { backgroundColor: theme.surface }]]}
            >
              <View style={s.countryCode}>
                <Text style={s.countryFlag}>🇮🇳</Text>
                <Text style={[s.countryNum, { color: theme.text }]}>+91</Text>
              </View>
              <View style={s.inputDivider} />
              <TextInput
                ref={inputRef}
                style={[s.input, { color: theme.text }]}
                value={mobile}
                onChangeText={v => setMobile(v.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={10}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleSendOtp}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                textContentType="telephoneNumber"
                autoComplete="tel"
              />
              {mobile.length === 10 && (
                <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
              )}
            </TouchableOpacity>

            {/* Send OTP button */}
            <TouchableOpacity
              style={[s.btn, mobile.length < 10 && s.btnDisabled]}
              onPress={handleSendOtp}
              activeOpacity={0.85}
              disabled={mobile.length < 10}
            >
              <LinearGradient
                colors={mobile.length === 10 ? ['#1B5E20','#2E7D32','#43A047'] : ['#9E9E9E','#BDBDBD']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.btnGrad}
              >
                <Ionicons name="send" size={17} color={COLORS.white} />
                <Text style={s.btnText}>{t('auth.sendOtp')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Register link */}
            <TouchableOpacity style={s.linkBtn} onPress={() => router.push('/register' as any)} activeOpacity={0.7}>
              <Text style={s.linkText}>{t('auth.newUser')}</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom decoration */}
          <View style={s.bottomDeco}>
            <View style={[s.decoLine, { backgroundColor: theme.border }]} />
            <Text style={[s.decoText, { color: theme.textSecondary }]}>Kisan Plus</Text>
            <View style={[s.decoLine, { backgroundColor: theme.border }]} />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.md },

  skipBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    alignSelf: 'flex-end', paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  skipText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: '500' },

  heroArea: {
    marginTop: SPACING.sm, marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg, overflow: 'hidden', height: 180,
    ...SHADOW.sm,
  },
  heroBg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroBlob1: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.3)', top: -30, right: -20 },
  heroBlob2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', bottom: -10, left: 20 },
  illustration: { alignItems: 'center', gap: SPACING.sm },
  illustEmoji: { fontSize: 56 },
  illustRow: { flexDirection: 'row', gap: SPACING.md },
  illustEmojiSm: { fontSize: 28 },

  logoSection: { alignItems: 'center', marginBottom: SPACING.lg, gap: SPACING.sm },
  tagline: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: '500', textAlign: 'center' },

  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOW.md,
  },
  cardTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3, marginBottom: 4 },
  cardSubtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm, paddingVertical: 12,
    marginBottom: SPACING.md, gap: SPACING.sm,
  },
  inputWrapFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.white },
  countryCode: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  countryFlag: { fontSize: 18 },
  countryNum: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  inputDivider: { width: 1, height: 22, backgroundColor: COLORS.border },
  input: { flex: 1, fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text, padding: 0, letterSpacing: 1 },

  btn: { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.md, ...SHADOW.md },
  btnDisabled: { opacity: 0.6 },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md + 2 },
  btnText: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.white },

  linkBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  linkText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '700' },

  bottomDeco: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  decoLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  decoText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: '600' },
});
