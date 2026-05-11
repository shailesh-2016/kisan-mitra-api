import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, KeyboardAvoidingView, Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const OTP_LENGTH = 6;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  topSection: {
    paddingHorizontal: SPACING.md, paddingTop: SPACING.md,
    paddingBottom: SPACING.xl + 8, borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32, overflow: 'hidden', alignItems: 'center',
    shadowColor: '#0A3D1F', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 14, elevation: 9,
  },
  blob1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.04)', top: -50, right: -30 },
  blob2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(249,168,37,0.07)', bottom: 0, left: 30 },
  backBtn: {
    position: 'absolute', top: SPACING.sm, left: SPACING.md,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  otpIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', marginBottom: SPACING.md, marginTop: SPACING.sm },
  topTitle: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.white, letterSpacing: -0.5, marginBottom: 4 },
  topSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: SPACING.md },
  mobilePill: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  mobileNum: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.white, letterSpacing: 0.5 },
  changeNum: { fontSize: FONT_SIZE.xs, color: COLORS.secondary, fontWeight: '700' },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, margin: SPACING.md, marginTop: -SPACING.lg, padding: SPACING.lg, ...SHADOW.lg },
  otpHint: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.lg, fontWeight: '500' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  otpBox: { width: 46, height: 56, borderRadius: RADIUS.md, borderWidth: 2, borderColor: COLORS.border, backgroundColor: COLORS.background, textAlign: 'center', fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.text },
  otpBoxFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryBg, color: COLORS.primary },
  otpBoxActive: { borderColor: COLORS.secondary, borderWidth: 2.5 },
  progressBar: { height: 3, backgroundColor: COLORS.lightGray, borderRadius: 2, marginBottom: SPACING.lg, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  btn: { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.md, ...SHADOW.md },
  btnDisabled: { opacity: 0.55 },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md + 2 },
  btnText: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.white },
  resendRow: { alignItems: 'center', paddingVertical: SPACING.sm },
  resendTimer: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: '500' },
  resendLink: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '700' },
});

export default function OtpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { mobile } = useLocalSearchParams<{ mobile: string }>();
  const { setUser } = useAuth();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendSec, setResendSec] = useState(30);
  const hiddenInputRef = useRef<TextInput>(null);
  const { theme } = useTheme();

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => hiddenInputRef.current?.focus(), 500);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (resendSec <= 0) return;
    const timer = setInterval(() => setResendSec(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendSec]);

  const handleVerifyWithOtp = async (otpStr: string) => {
    if (otpStr.length < OTP_LENGTH) return;
    setLoading(true);
    try {
      const data = await authAPI.verifyOtp(mobile, otpStr);
      if (data?.user) {
        const u = data.user;
        setUser({
          id:           u._id || u.id,
          name:         u.name         || '',
          mobile:       u.mobile       || '',
          village:      u.village      || '',
          district:     u.district     || '',
          state:        u.state        || '',
          bio:          u.bio          || '',
          profileImage: u.profileImage || '',
          language:     u.language     || 'gu',
        });
      }
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      alert(err.message || 'Invalid OTP');
      setOtp('');
      hiddenInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp('');
    setResendSec(30);
    hiddenInputRef.current?.focus();
    try {
      await authAPI.sendOtp(mobile);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filled = otp.length;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A3D1F" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >

        {/* Top gradient section */}
        <LinearGradient colors={['#0A3D1F','#1B5E20','#2E7D32']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.topSection}>
          <View style={s.blob1} /><View style={s.blob2} />

          <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={18} color={COLORS.white} />
          </TouchableOpacity>

          <View style={s.otpIconWrap}>
            <Text style={{ fontSize: 40 }}>📱</Text>
          </View>
          <Text style={s.topTitle}>{t('auth.verifyTitle')}</Text>
          <Text style={s.topSub}>{t('auth.verifySubtitle')}</Text>
          <View style={s.mobilePill}>
            <Text style={s.mobileNum}>+91 {mobile}</Text>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={s.changeNum}>{t('auth.changeNumber')}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* OTP Card */}
        <View style={[s.card, { backgroundColor: theme.surface }]}>
          <Text style={[s.otpHint, { color: theme.textSecondary }]}>{t('auth.otpHint')}</Text>

          {/* Hidden input for autofill */}
          <TextInput
            ref={hiddenInputRef}
            value={otp}
            onChangeText={v => {
              const cleaned = v.replace(/\D/g, '').slice(0, OTP_LENGTH);
              setOtp(cleaned);
              if (cleaned.length === OTP_LENGTH) {
                setTimeout(() => handleVerifyWithOtp(cleaned), 300);
              }
            }}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            autoFocus
          />

          {/* OTP boxes display */}
          <TouchableOpacity 
            style={s.otpRow} 
            activeOpacity={1} 
            onPress={() => hiddenInputRef.current?.focus()}
          >
            {Array(OTP_LENGTH).fill(0).map((_, idx) => {
              const digit = otp[idx] || '';
              const isActive = idx === otp.length;
              const isFilled = !!digit;
              return (
                <View
                  key={idx}
                  style={[
                    s.otpBox,
                    { 
                      backgroundColor: theme.inputBg, 
                      borderColor: theme.border,
                      justifyContent: 'center',
                      alignItems: 'center'
                    },
                    isFilled && s.otpBoxFilled,
                    isActive && s.otpBoxActive,
                  ]}
                >
                  <Text style={[
                    { fontSize: FONT_SIZE.xl, fontWeight: '800' },
                    { color: isFilled ? COLORS.primary : theme.text }
                  ]}>
                    {digit}
                  </Text>
                </View>
              );
            })}
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={[s.progressBar, { backgroundColor: theme.border }]}>
            <View style={[s.progressFill, { width: `${(filled / OTP_LENGTH) * 100}%` }]} />
          </View>

          {/* Verify button */}
          <TouchableOpacity
            style={[s.btn, filled < OTP_LENGTH && s.btnDisabled]}
            onPress={() => handleVerifyWithOtp(otp)}
            activeOpacity={0.85}
            disabled={filled < OTP_LENGTH || loading}
          >
            <LinearGradient
              colors={filled === OTP_LENGTH ? ['#1B5E20','#43A047'] : ['#9E9E9E','#BDBDBD']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.btnGrad}
            >
              {loading
                ? <Text style={s.btnText}>{t('auth.loading')}</Text>
                : <>
                    <Ionicons name="shield-checkmark" size={18} color={COLORS.white} />
                    <Text style={s.btnText}>{t('auth.verify')}</Text>
                  </>
              }
            </LinearGradient>
          </TouchableOpacity>

          {/* Resend */}
          <View style={s.resendRow}>
            {resendSec > 0
              ? <Text style={[s.resendTimer, { color: theme.textSecondary }]}>{t('auth.resendIn', { sec: resendSec })}</Text>
              : <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                  <Text style={s.resendLink}>{t('auth.resendOtp')}</Text>
                </TouchableOpacity>
            }
          </View>
        </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
