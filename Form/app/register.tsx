import React, { useState } from 'react';
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
import KisanLogo from '../components/KisanLogo';
import { authAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';

// ── Reusable Field ────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, icon, iconColor = COLORS.primary, keyboardType = 'default', maxLength }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; icon: string; iconColor?: string;
  keyboardType?: any; maxLength?: number;
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
          keyboardType={keyboardType} maxLength={maxLength}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        />
        {value.length > 0 && <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />}
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
    paddingHorizontal: SPACING.sm, paddingVertical: 12,
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
  const [mobile, setMobile]   = useState('');
  const [village, setVillage] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = name.trim().length > 1 && mobile.length === 10 && village.trim().length > 1;
  const { theme, isDark } = useTheme();

  const handleRegister = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await authAPI.register(name, mobile, village);
      router.push({ pathname: '/otp', params: { mobile } } as any);
    } catch (err: any) {
      alert(err.message || 'Registration failed');
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
              <Text style={s.title}>{t('auth.registerTitle')}</Text>
              <Text style={s.subtitle}>{t('auth.registerSubtitle')}</Text>
              <View style={s.stepRow}>
                {['👤','📱','🏡'].map((e, i) => (
                  <View key={i} style={s.stepItem}>
                    <View style={s.stepCircle}><Text style={{ fontSize: 14 }}>{e}</Text></View>
                    {i < 2 && <View style={s.stepLine} />}
                  </View>
                ))}
              </View>
            </View>
            <Text style={s.titleEmoji}>🌾</Text>
          </LinearGradient>

          {/* Form */}
          <View style={[s.card, { backgroundColor: theme.surface }]}>
            <Field
              label={t('auth.fullName')} value={name} onChange={setName}
              placeholder={t('auth.namePlaceholder')} icon="person" iconColor={COLORS.primary}
            />
            <Field
              label={t('auth.mobileNumber')} value={mobile}
              onChange={v => setMobile(v.replace(/\D/g,'').slice(0,10))}
              placeholder="98765 43210" icon="call" iconColor="#1565C0"
              keyboardType="phone-pad" maxLength={10}
            />
            <Field
              label={t('auth.village')} value={village} onChange={setVillage}
              placeholder={t('auth.villagePlaceholder')} icon="location" iconColor="#F57F17"
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
                {loading
                  ? <Text style={s.btnText}>{t('auth.loading')}</Text>
                  : <><Ionicons name="person-add" size={18} color={COLORS.white} /><Text style={s.btnText}>{t('auth.register')}</Text></>
                }
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={s.linkBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={s.linkText}>{t('auth.haveAccount')}</Text>
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
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.md },
  stepRow: { flexDirection: 'row', alignItems: 'center' },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  stepLine: { width: 20, height: 1.5, backgroundColor: COLORS.border },
  titleEmoji: { fontSize: 48, marginLeft: SPACING.sm },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.md, ...SHADOW.md },
  btn: { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.md, ...SHADOW.md },
  btnDisabled: { opacity: 0.55 },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md + 2 },
  btnText: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.white },
  linkBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  linkText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '700' },
  terms: { fontSize: 10, color: COLORS.textSecondary, textAlign: 'center', paddingHorizontal: SPACING.lg },
});
