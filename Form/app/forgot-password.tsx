import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focused, setFocused] = useState(false);
  const { theme, isDark } = useTheme();

  const handleSendResetOtp = async () => {
    if (!email || loading) return;
    
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await authAPI.forgotPassword(email);
      // Redirect to OTP with mode reset
      router.push({ pathname: '/otp', params: { email, mode: 'reset' } } as any);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={[s.backBtn, { backgroundColor: theme.surface }]} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={18} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Title Area */}
          <View style={s.titleArea}>
            <View style={s.iconWrap}>
              <Text style={{ fontSize: 40 }}>🔑</Text>
            </View>
            <Text style={[s.title, { color: theme.text }]}>Forgot Password</Text>
            <Text style={[s.subtitle, { color: theme.textSecondary }]}>
              Enter your registered email address to receive a password reset OTP.
            </Text>
          </View>

          {/* Form */}
          <View style={[s.card, { backgroundColor: theme.surface }]}>
            {errorMsg ? <Text style={s.errorText}>{errorMsg}</Text> : null}

            <Text style={[s.label, { color: theme.textSecondary }]}>Email Address</Text>
            <View style={[s.row, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }, focused && [s.rowFocused, { backgroundColor: theme.surface }]]}>
              <Ionicons name="mail" size={20} color={focused ? COLORS.primary : '#9CA3AF'} />
              <TextInput
                style={[s.input, { color: theme.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="farmer@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />
            </View>

            <TouchableOpacity
              style={[s.btn, !email && s.btnDisabled]}
              onPress={handleSendResetOtp} activeOpacity={0.85}
              disabled={!email || loading}
            >
              <LinearGradient
                colors={email ? ['#1B5E20','#2E7D32','#43A047'] : ['#9E9E9E','#BDBDBD']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btnGrad}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="send" size={18} color={COLORS.white} />
                    <Text style={s.btnText}>Send Reset OTP</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.md, paddingBottom: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  titleArea: { alignItems: 'center', marginVertical: SPACING.lg },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '800', letterSpacing: -0.5, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZE.md, textAlign: 'center', paddingHorizontal: SPACING.lg },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, ...SHADOW.md },
  errorText: { color: '#D32F2F', fontSize: FONT_SIZE.sm, marginBottom: SPACING.md, textAlign: 'center', fontWeight: '500' },
  label: { fontSize: FONT_SIZE.xs, fontWeight: '700', marginBottom: 5, letterSpacing: 0.2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm, paddingVertical: 12, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: SPACING.lg },
  rowFocused: { borderColor: COLORS.primary },
  input: { flex: 1, fontSize: FONT_SIZE.md, padding: 0 },
  btn: { borderRadius: RADIUS.md, overflow: 'hidden', ...SHADOW.md },
  btnDisabled: { opacity: 0.55 },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: 14 },
  btnText: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.white },
});
