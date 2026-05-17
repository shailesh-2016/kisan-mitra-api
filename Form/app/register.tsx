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
import KisanLogo from '../components/KisanLogo';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

// ── Reusable Field ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, icon, iconColor = COLORS.primary, keyboardType = 'default', secureTextEntry = false, autoCapitalize = 'none' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; icon: string; iconColor?: string;
  keyboardType?: any; secureTextEntry?: boolean; autoCapitalize?: any;
}) {
  const [focused, setFocused] = useState(false);
  const { theme } = useTheme();
  
  return (
    <View style={f.wrap}>
      <Text style={[f.label, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[f.row, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }, focused && [f.rowFocused, { backgroundColor: theme.surface }]]}>
        <View style={[f.iconWrap, { backgroundColor: iconColor + '18' }]}>
          <Ionicons name={icon as any} size={16} color={iconColor} />
        </View>
        <TextInput
          style={[f.input, { color: theme.text }]} value={value} onChangeText={onChange}
          placeholder={placeholder} placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType} secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
        {value.length > 0 && !secureTextEntry && <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />}
      </View>
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { marginBottom: SPACING.md },
  label: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 5, letterSpacing: 0.2 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm, paddingVertical: 10,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  rowFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.white },
  iconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.text, padding: 0 },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isValid = name.trim().length > 1 && email.includes('@') && password.length >= 8 && password === confirmPassword;
  const { theme, isDark } = useTheme();

  const handleRegister = async () => {
    if (!isValid || loading) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
       const res = await authAPI.register(name, email, password, '');
       if (res.success) {
          router.push({ pathname: '/otp', params: { email, mode: 'verify' } } as any);
       }
    } catch (err: any) {
       setErrorMsg(err.message || 'Registration failed');
    } finally {
       setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={[s.backBtn, { backgroundColor: theme.surface }]} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={18} color={COLORS.text} />
            </TouchableOpacity>
            <KisanLogo size="sm" variant="full" />
          </View>

          {/* Title banner */}
          <LinearGradient colors={['#E8F5E9','#F1F8E9']} style={s.titleCard}>
            <View style={s.titleBlob} />
            <View style={s.titleLeft}>
              <Text style={s.title}>{t('auth.registerTitle', 'Create Account')}</Text>
              <Text style={s.subtitle}>{t('auth.registerSubtitle', 'Join the smart farming community')}</Text>
            </View>
            <Text style={s.titleEmoji}>🌾</Text>
          </LinearGradient>

          {/* Form */}
          <View style={[s.card, { backgroundColor: theme.surface }]}>
            {errorMsg ? <Text style={s.errorText}>{errorMsg}</Text> : null}

            <Field
              label={t('auth.fullName', 'Full Name')} value={name} onChange={setName}
              placeholder="Ramesh Patel" icon="person" iconColor={COLORS.primary} autoCapitalize="words"
            />
            <Field
              label="Email Address" value={email} onChange={setEmail}
              placeholder="farmer@example.com" icon="mail" iconColor="#1565C0"
              keyboardType="email-address"
            />
            <Field
              label="Password" value={password} onChange={setPassword}
              placeholder="Minimum 8 characters" icon="lock-closed" iconColor="#F57F17"
              secureTextEntry
            />
            <Field
              label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword}
              placeholder="Re-enter your password" icon="lock-closed" iconColor="#D32F2F"
              secureTextEntry
            />

            <TouchableOpacity
              style={[s.btn, !isValid && s.btnDisabled]}
              onPress={handleRegister} activeOpacity={0.85}
              disabled={!isValid || loading}
            >
              <LinearGradient
                colors={isValid ? ['#1B5E20','#2E7D32','#43A047'] : ['#9E9E9E','#BDBDBD']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btnGrad}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="person-add" size={18} color={COLORS.white} />
                    <Text style={s.btnText}>{t('auth.register', 'Register')}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={s.linkBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={s.linkText}>{t('auth.haveAccount', 'Already have an account? Login')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.terms}>By registering, you agree to our Terms & Privacy Policy</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.md, paddingBottom: SPACING.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  titleCard: { borderRadius: RADIUS.lg, padding: SPACING.lg, flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, overflow: 'hidden', ...SHADOW.sm },
  titleBlob: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(46,125,50,0.08)', top: -30, right: -20 },
  titleLeft: { flex: 1 },
  title: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 4 },
  titleEmoji: { fontSize: 48, marginLeft: SPACING.sm },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.md },
  
  errorText: {
    color: '#D32F2F', fontSize: FONT_SIZE.sm, marginBottom: SPACING.md,
    textAlign: 'center', fontWeight: '500'
  },

  btn: { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.md, ...SHADOW.md, marginTop: SPACING.sm },
  btnDisabled: { opacity: 0.55 },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: 14 },
  btnText: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.white },
  linkBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  linkText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '700' },
  terms: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SPACING.lg },
});
