import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import KisanLogo from '../components/KisanLogo';
import { authAPI } from '../services/api';
import { toastService } from '../services/toastService';
import { useGoogleLogin } from '../services/googleAuth';

WebBrowser.maybeCompleteAuthSession();

// Removed native GoogleSignin getter to strictly use Firebase Auth + Expo Auth Session

export default function LoginScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { theme, isDark } = useTheme();
  const { setUser } = useAuth();

  const { login: promptGoogleLogin, loading: googleLoading } = useGoogleLogin(
    (u) => {
      setUser({
        id:             u._id || u.id,
        name:           u.name         || '',
        email:          u.email        || '',
        village:        u.village      || '',
        district:       u.district     || '',
        state:          u.state        || '',
        bio:            u.bio          || '',
        profileImage:   u.profileImage || '',
        coverImage:     u.coverImage   || '',
        language:       u.language     || 'gu',
        farmSize:       u.farmSize     || '',
        cropsGrown:     u.cropsGrown   || '',
        experience:     u.experience   || '',
        followersCount: Array.isArray(u.followers) ? u.followers.length : (u.followersCount || 0),
        followingCount: Array.isArray(u.following) ? u.following.length : (u.followingCount || 0),
      });
      toastService.loginSuccess();
      router.replace('/(tabs)' as any);
    },
    (err) => {
      setErrorMsg(err.message || 'Google Login Failed');
      toastService.error(err.message || 'Google Login Failed');
    }
  );

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID',
  });

  // Handle Facebook Auth Response
  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { authentication } = fbResponse;
      if (authentication?.accessToken) {
         setLoading(true);
         fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${authentication.accessToken}`)
         .then(res => res.json())
         .then(data => {
           const email = data.email || `${data.id}@facebook.com`;
           const picture = data.picture?.data?.url || '';
           return authAPI.facebookLogin(email, data.name, picture, data.id);
         })
         .then(res => { 
           setLoading(false);
           if (res.success && res.user) {
             const u = res.user;
             setUser({
               id:             u._id || u.id,
               name:           u.name         || '',
               email:          u.email        || '',
               village:        u.village      || '',
               district:       u.district     || '',
               state:          u.state        || '',
               bio:            u.bio          || '',
               profileImage:   u.profileImage || '',
               coverImage:     u.coverImage   || '',
               language:       u.language     || 'gu',
               farmSize:       u.farmSize     || '',
               cropsGrown:     u.cropsGrown   || '',
               experience:     u.experience   || '',
               followersCount: Array.isArray(u.followers) ? u.followers.length : (u.followersCount || 0),
               followingCount: Array.isArray(u.following) ? u.following.length : (u.followingCount || 0),
             });
             router.replace('/(tabs)' as any); 
           }
         })
         .catch(err => {
           setLoading(false);
           setErrorMsg(err.message || 'Facebook Login Failed');
           toastService.error(err.message || 'Facebook Login Failed');
         });
      }
    }
  }, [fbResponse]);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter email and password');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authAPI.login(email, password);
      if (res.success && res.user) {
        const u = res.user;
        setUser({
          id:             u._id || u.id,
          name:           u.name         || '',
          email:          u.email        || '',
          village:        u.village      || '',
          district:       u.district     || '',
          state:          u.state        || '',
          bio:            u.bio          || '',
          profileImage:   u.profileImage || '',
          coverImage:     u.coverImage   || '',
          language:       u.language     || 'gu',
          farmSize:       u.farmSize     || '',
          cropsGrown:     u.cropsGrown   || '',
          experience:     u.experience   || '',
          followersCount: Array.isArray(u.followers) ? u.followers.length : (u.followersCount || 0),
          followingCount: Array.isArray(u.following) ? u.following.length : (u.followingCount || 0),
        });
        toastService.loginSuccess();
        router.replace('/(tabs)' as any);
      }
    } catch (err: any) {
      // If email not verified
      if (err.message && err.message.includes('not verified')) {
         router.push({ pathname: '/otp', params: { email, mode: 'verify' } } as any);
      } else {
         setErrorMsg(err.message || 'Login failed');
         toastService.invalidCredentials();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      setErrorMsg('');
      if (provider === 'google') {
        await promptGoogleLogin();
      } else {
        await fbPromptAsync();
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Social login failed');
      toastService.error(err.message || 'Social login failed');
    }
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
            <Text style={s.skipText}>{t('auth.skip', 'Skip')}</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Hero illustration area */}
          <View style={s.heroArea}>
            <LinearGradient colors={['#E8F5E9','#C8E6C9','#A5D6A7']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroBg}>
              <View style={s.heroBlob1} />
              <View style={s.heroBlob2} />
              <View style={s.illustration}>
                <Text style={s.illustEmoji}>🔐</Text>
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
            <Text style={s.tagline}>{t('auth.loginTagline', 'Welcome back! Please login to your account.')}</Text>
          </View>

          {/* Card */}
          <View style={[s.card, { backgroundColor: theme.surface }]}>
            {errorMsg ? (
              <Text style={s.errorText}>{errorMsg}</Text>
            ) : null}

            {/* Email Input */}
            <Text style={[s.inputLabel, { color: theme.textSecondary }]}>Email</Text>
            <View style={[s.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }, focusedField === 'email' && [s.inputWrapFocused, { backgroundColor: theme.surface }]]}>
              <Ionicons name="mail-outline" size={20} color={focusedField === 'email' ? COLORS.primary : '#9CA3AF'} />
              <TextInput
                style={[s.input, { color: theme.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="farmer@example.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
              />
            </View>

            {/* Password Input */}
            <Text style={[s.inputLabel, { color: theme.textSecondary, marginTop: SPACING.sm }]}>Password</Text>
            <View style={[s.inputWrap, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }, focusedField === 'password' && [s.inputWrapFocused, { backgroundColor: theme.surface }]]}>
              <Ionicons name="lock-closed-outline" size={20} color={focusedField === 'password' ? COLORS.primary : '#9CA3AF'} />
              <TextInput
                style={[s.input, { color: theme.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="********"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
              />
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity style={s.forgotBtn} onPress={() => router.push('/forgot-password' as any)}>
              <Text style={s.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[s.btn, (!email || !password) && s.btnDisabled]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={!email || !password || loading}
            >
              <LinearGradient
                colors={email && password ? ['#1B5E20','#2E7D32','#43A047'] : ['#9E9E9E','#BDBDBD']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.btnGrad}
              >
                {loading ? <ActivityIndicator color="#fff" /> : (
                   <>
                    <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
                    <Text style={s.btnText}>{t('auth.login', 'Login')}</Text>
                   </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.dividerRow}>
              <View style={s.dividerLine} />
              <Text style={s.dividerText}>OR</Text>
              <View style={s.dividerLine} />
            </View>

            {/* Social Buttons */}
            <View style={s.socialStack}>
               <TouchableOpacity 
                  style={[s.socialBtnStack, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]} 
                  onPress={() => handleSocialLogin('google')}
                  disabled={loading || googleLoading}
               >
                  {googleLoading ? <ActivityIndicator color={theme.text} /> : <Ionicons name="logo-google" size={22} color="#DB4437" />}
                  <Text style={[s.socialBtnTextStack, { color: theme.text }]}>{t('auth.google', 'Continue with Google')}</Text>
               </TouchableOpacity>

               <TouchableOpacity 
                  style={[s.socialBtnStack, { backgroundColor: '#1877F2', borderWidth: 1, borderColor: '#1877F2' }]} 
                  onPress={() => handleSocialLogin('facebook')}
                  disabled={loading}
               >
                  <Ionicons name="logo-facebook" size={22} color="#fff" />
                  <Text style={[s.socialBtnTextStack, { color: '#fff' }]}>{t('auth.facebook', 'Continue with Facebook')}</Text>
               </TouchableOpacity>
            </View>

            {/* Register link */}
            <TouchableOpacity style={s.linkBtn} onPress={() => router.push('/register' as any)} activeOpacity={0.7}>
              <Text style={s.linkText}>{t('auth.noAccount', 'Don\'t have an account? Create Account')}</Text>
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
    marginTop: SPACING.sm, marginBottom: SPACING.md,
    borderRadius: RADIUS.lg, overflow: 'hidden', height: 160,
    ...SHADOW.sm,
  },
  heroBg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroBlob1: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.3)', top: -30, right: -20 },
  heroBlob2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', bottom: -10, left: 20 },
  illustration: { alignItems: 'center', gap: SPACING.sm },
  illustEmoji: { fontSize: 48 },
  illustRow: { flexDirection: 'row', gap: SPACING.md },
  illustEmojiSm: { fontSize: 24 },

  logoSection: { alignItems: 'center', marginBottom: SPACING.md, gap: SPACING.xs },
  tagline: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: '500', textAlign: 'center' },

  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOW.md,
  },
  
  errorText: {
    color: '#D32F2F', fontSize: FONT_SIZE.sm, marginBottom: SPACING.sm,
    textAlign: 'center', fontWeight: '500'
  },

  inputLabel: {
    fontSize: FONT_SIZE.xs, fontWeight: '700', marginBottom: 5, letterSpacing: 0.2
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    paddingHorizontal: SPACING.md, paddingVertical: 10,
    marginBottom: SPACING.sm, gap: SPACING.sm,
  },
  inputWrapFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.white },
  input: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.text, padding: 0 },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.md },
  forgotText: { color: COLORS.primary, fontSize: FONT_SIZE.sm, fontWeight: '600' },

  btn: { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.lg, ...SHADOW.md },
  btnDisabled: { opacity: 0.6 },
  btnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.md },
  btnText: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.white },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  dividerText: { fontSize: FONT_SIZE.xs, color: '#9E9E9E', fontWeight: '600' },

  socialStack: { gap: SPACING.md, marginBottom: SPACING.lg },
  socialBtnStack: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: RADIUS.md, gap: SPACING.sm,
    ...SHADOW.sm,
  },
  socialBtnTextStack: { fontSize: FONT_SIZE.md, fontWeight: '700' },

  linkBtn: { alignItems: 'center', paddingVertical: SPACING.xs },
  linkText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '700' },

  bottomDeco: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  decoLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  decoText: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: '600' },
});
