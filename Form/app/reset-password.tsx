import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { authAPI } from '../services/api';
import { toastService } from '../services/toastService';
import { useTheme } from '../context/ThemeContext';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { theme, isDark } = useTheme();

  const handleResetPassword = async () => {
    if (!password || !confirmPassword || loading) return;
    
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await authAPI.resetPassword(email, otp, password);
      toastService.success('Password reset successfully. You can now login.');
      router.replace('/login');
    } catch (err: any) {
      setErrorMsg(err.message || 'Reset failed');
      toastService.error(err.message || 'Reset failed');
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
              <Text style={{ fontSize: 40 }}>🔒</Text>
            </View>
            <Text style={[s.title, { color: theme.text }]}>Set New Password</Text>
            <Text style={[s.subtitle, { color: theme.textSecondary }]}>
              Please enter your new password below.
            </Text>
          </View>

          {/* Form */}
          <View style={[s.card, { backgroundColor: theme.surface }]}>
            {errorMsg ? <Text style={s.errorText}>{errorMsg}</Text> : null}

            <Text style={[s.label, { color: theme.textSecondary }]}>New Password</Text>
            <View style={[s.row, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
              <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
              <TextInput
                style={[s.input, { color: theme.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 8 characters"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
            </View>

            <Text style={[s.label, { color: theme.textSecondary, marginTop: SPACING.sm }]}>Confirm Password</Text>
            <View style={[s.row, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
              <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
              <TextInput
                style={[s.input, { color: theme.text }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[s.btn, (!password || !confirmPassword) && s.btnDisabled]}
              onPress={handleResetPassword} activeOpacity={0.85}
              disabled={!password || !confirmPassword || loading}
            >
              <LinearGradient
                colors={password && confirmPassword ? ['#1B5E20','#2E7D32','#43A047'] : ['#9E9E9E','#BDBDBD']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btnGrad}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="checkmark-done" size={18} color={COLORS.white} />
                    <Text style={s.btnText}>Reset Password</Text>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm, paddingVertical: 12, borderWidth: 1.5, borderColor: COLORS.border, marginBottom: SPACING.md },
  input: { flex: 1, fontSize: FONT_SIZE.md, padding: 0 },
  btn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.sm, ...SHADOW.md },
  btnDisabled: { opacity: 0.55 },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: 14 },
  btnText: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.white },
});
