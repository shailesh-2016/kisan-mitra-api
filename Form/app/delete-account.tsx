import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, StatusBar, ActivityIndicator, KeyboardAvoidingView,
  Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const UI_TEXTS: Record<string, any> = {
  en: {
    headerTitle: 'Delete Account',
    step1Label: 'Warning',
    step2Label: 'Confirm',
    step3Label: 'Verify OTP',
    warningTitle: 'Delete Your Account?',
    warningSubPrefix: 'This action is ',
    warningSubWord: 'permanent',
    warningSubSuffix: ' and cannot be undone.',
    lossTitle: 'What will be permanently deleted:',
    losses: [
      { icon: 'person', label: 'Your profile and personal data' },
      { icon: 'construct', label: 'All machines and usage entries' },
      { icon: 'calculator', label: 'All profit calculation history' },
      { icon: 'alarm', label: 'All reminders and notifications' },
      { icon: 'shield-checkmark', label: 'Account access forever' }
    ],
    toDeleteBadge: 'To Delete',
    proceedBtn: 'I understand, proceed',
    cancelBtn: 'Cancel — Keep my account',
    confirmTitle: 'Type to Confirm',
    confirmSubPrefix: 'To confirm deletion, type ',
    confirmSubWord: 'DELETE',
    confirmSubSuffix: ' in the box below.',
    confirmPlaceholder: 'Type DELETE here',
    confirmHint: 'Must match exactly: DELETE',
    sendOtpBtn: 'Send Verification OTP',
    otpNote: 'An OTP will be sent to ',
    otpTitle: 'Enter OTP',
    otpSub: 'Enter the 6-digit OTP sent to',
    deleteBtn: 'Permanently Delete Account',
    resendTimerPrefix: 'Resend OTP in ',
    resendBtn: 'Resend OTP',
    toastOtpSent: 'OTP sent to +91',
    toastDeleteSuccess: 'Account deleted successfully',
    toastInvalidOtp: 'Invalid OTP. Try again.',
    toastNewOtp: 'New OTP sent'
  },
  hi: {
    headerTitle: 'खाता हटाएं',
    step1Label: 'चेतावनी',
    step2Label: 'पुष्टि करें',
    step3Label: 'OTP सत्यापित करें',
    warningTitle: 'क्या आप खाता हटाना चाहते हैं?',
    warningSubPrefix: 'यह कार्रवाई ',
    warningSubWord: 'स्थायी',
    warningSubSuffix: ' है और इसे पूर्ववत नहीं किया जा सकता है।',
    lossTitle: 'क्या स्थायी रूप से हटा दिया जाएगा:',
    losses: [
      { icon: 'person', label: 'आपकी प्रोफ़ाइल और व्यक्तिगत डेटा' },
      { icon: 'construct', label: 'सभी मशीनें और उपयोग रिकॉर्ड' },
      { icon: 'calculator', label: 'लाभ गणना का पूरा इतिहास' },
      { icon: 'alarm', label: 'सभी अनुस्मारक और सूचनाएं' },
      { icon: 'shield-checkmark', label: 'खाते का एक्सेस हमेशा के लिए' }
    ],
    toDeleteBadge: 'हटाए जाने के लिए',
    proceedBtn: 'मैं समझ गया, आगे बढ़ें',
    cancelBtn: 'रद्द करें — मेरा खाता रखें',
    confirmTitle: 'पुष्टि करने के लिए लिखें',
    confirmSubPrefix: 'खाता हटाने की पुष्टि के लिए, नीचे दिए गए बॉक्स में ',
    confirmSubWord: 'DELETE',
    confirmSubSuffix: ' लिखें।',
    confirmPlaceholder: 'यहाँ DELETE लिखें',
    confirmHint: 'सटीक रूप से मेल खाना चाहिए: DELETE',
    sendOtpBtn: 'सत्यापन OTP भेजें',
    otpNote: 'OTP इस नंबर पर भेजा जाएगा: ',
    otpTitle: 'OTP दर्ज करें',
    otpSub: 'कृपया इस नंबर पर भेजा गया 6-अंकीय OTP दर्ज करें:',
    deleteBtn: 'खाता स्थायी रूप से हटाएं',
    resendTimerPrefix: 'OTP फिर से भेजें: ',
    resendBtn: 'फिर से OTP भेजें',
    toastOtpSent: 'OTP +91 पर भेजा गया',
    toastDeleteSuccess: 'खाता सफलतापूर्वक हटा दिया गया',
    toastInvalidOtp: 'अमान्य OTP। पुनः प्रयास करें।',
    toastNewOtp: 'नया OTP भेजा गया'
  },
  gu: {
    headerTitle: 'એકાઉન્ટ કાઢી નાખો',
    step1Label: 'ચેતવણી',
    step2Label: 'પુષ્ટિ કરો',
    step3Label: 'OTP ચકાસો',
    warningTitle: 'તમારું એકાઉન્ટ કાઢી નાખવું છે?',
    warningSubPrefix: 'આ ક્રિયા ',
    warningSubWord: 'કાયમી',
    warningSubSuffix: ' છે અને તેને પાછી વાળી શકાતી નથી.',
    lossTitle: 'શું કાયમી ધોરણે ભૂંસી નાખવામાં આવશે:',
    losses: [
      { icon: 'person', label: 'તમારી પ્રોફાઇલ અને વ્યક્તિગત ડેટા' },
      { icon: 'construct', label: 'બધા મશીનો અને વપરાશના રેકોર્ડ' },
      { icon: 'calculator', label: 'બધા નફાની ગણતરીનો ઇતિહાસ' },
      { icon: 'alarm', label: 'બધા રિમાઇન્ડર અને સૂચનાઓ' },
      { icon: 'shield-checkmark', label: 'એકાઉન્ટની ઍક્સેસ કાયમ માટે' }
    ],
    toDeleteBadge: 'રદ કરવા માટે',
    proceedBtn: 'હું સમજી ગયો, આગળ વધો',
    cancelBtn: 'રદ કરો — મારું એકાઉન્ટ રાખો',
    confirmTitle: 'પુષ્ટિ કરવા માટે ટાઇપ કરો',
    confirmSubPrefix: 'કાઢી નાખવાની પુષ્ટિ કરવા માટે, નીચેના બોક્સમાં ',
    confirmSubWord: 'DELETE',
    confirmSubSuffix: ' ટાઇપ કરો.',
    confirmPlaceholder: 'અહીં DELETE ટાઇપ કરો',
    confirmHint: 'ચોકસાઇથી મેળ ખાતો હોવો જોઈએ: DELETE',
    sendOtpBtn: 'ચકાસણી OTP મોકલો',
    otpNote: 'આ નંબર પર OTP મોકલવામાં આવશે: ',
    otpTitle: 'OTP દાખલ કરો',
    otpSub: 'આ નંબર પર મોકલેલો 6-અંકનો OTP દાખલ કરો:',
    deleteBtn: 'કાયમી ધોરણે એકાઉન્ટ કાઢી નાખો',
    resendTimerPrefix: 'ફરીથી OTP મોકલો: ',
    resendBtn: 'OTP ફરીથી મોકલો',
    toastOtpSent: 'OTP +91 પર મોકલાયો',
    toastDeleteSuccess: 'એકાઉન્ટ સફળતાપૂર્વક કાઢી નાખાયું',
    toastInvalidOtp: 'અમાન્ય OTP. ફરી પ્રયાસ કરો.',
    toastNewOtp: 'નવો OTP મોકલાયો'
  }
};

import { userAPI, removeToken, removeUser } from '../services/api';
import { toastService } from '../services/toastService';

// ── Step indicator ────────────────────────────────────────────────────────────
function StepDot({ step, current }: { step: number; current: number }) {
  const { theme } = useTheme();
  const done    = current > step;
  const active  = current === step;
  return (
    <View style={[
      sd.dot,
      { borderColor: active || done ? theme.red : theme.border },
      (active || done) && { backgroundColor: theme.red },
    ]}>
      {done
        ? <Ionicons name="checkmark" size={10} color="#FFF" />
        : <Text style={[sd.num, { color: active ? '#FFF' : theme.textMuted }]}>{step}</Text>
      }
    </View>
  );
}
const sd = StyleSheet.create({
  dot: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  num: { fontSize: 11, fontWeight: '800' },
});

// ── OTP Box ───────────────────────────────────────────────────────────────────
const OTP_LEN = 6;

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function DeleteAccountScreen() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const router   = useRouter();
  const { user, setUser } = useAuth();
  const { theme, isDark } = useTheme();

  // 3 steps: 1=warning, 2=type DELETE, 3=OTP
  const [step,          setStep]          = useState(1);
  const [confirmText,   setConfirmText]   = useState('');
  const [otp,           setOtp]           = useState<string[]>(Array(OTP_LEN).fill(''));
  const [sendingOtp,    setSendingOtp]    = useState(false);
  const [verifying,     setVerifying]     = useState(false);
  const [resendSec,     setResendSec]     = useState(0);
  const [otpSent,       setOtpSent]       = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Shake animation for wrong OTP
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,   duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // Resend countdown
  useEffect(() => {
    if (resendSec <= 0) return;
    const t = setInterval(() => setResendSec(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendSec]);

  // ── Step 2: send OTP when user proceeds ──
  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      await userAPI.requestDeleteOtp();
      setOtpSent(true);
      setResendSec(30);
      setStep(3);
      toastService.info(`${UI_TEXTS[currentLang]?.toastOtpSent} ${user?.email}`);
    } catch (err: any) {
      toastService.error(err.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  // ── OTP input handlers ──
  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    if (digit && idx < OTP_LEN - 1) inputRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // ── Step 3: verify OTP and delete ──
  const handleDeleteConfirm = async () => {
    const otpStr = otp.join('');
    if (otpStr.length < OTP_LEN) return;
    setVerifying(true);
    try {
      await userAPI.deleteAccount(otpStr);
      await removeToken();
      await removeUser();
      setUser(null);
      toastService.success(UI_TEXTS[currentLang]?.toastDeleteSuccess);
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      shake();
      toastService.error(err.message || UI_TEXTS[currentLang]?.toastInvalidOtp);
      setOtp(Array(OTP_LEN).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setOtp(Array(OTP_LEN).fill(''));
    setResendSec(30);
    inputRefs.current[0]?.focus();
    try {
      await userAPI.requestDeleteOtp();
      toastService.info(UI_TEXTS[currentLang]?.toastNewOtp);
    } catch (err: any) {
      toastService.error(err.message);
    }
  };

  const filled = otp.join('').length;
  const confirmValid = confirmText.trim().toUpperCase() === 'DELETE';

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── Header ── */}
        <View style={[s.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
            onPress={() => step > 1 ? setStep(step - 1) : router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
          <View style={s.headerCenter}>
            <View style={[s.headerIconWrap, { backgroundColor: theme.redBg }]}>
              <Ionicons name="person-remove-outline" size={16} color={theme.red} />
            </View>
            <Text style={[s.headerTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.headerTitle}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Step indicator ── */}
        <View style={[s.stepBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          {[1, 2, 3].map((n, i) => (
            <React.Fragment key={n}>
              <StepDot step={n} current={step} />
              {i < 2 && (
                <View style={[s.stepLine, { backgroundColor: step > n ? theme.red : theme.border }]} />
              )}
            </React.Fragment>
          ))}
          <Text style={[s.stepLabel, { color: theme.textSecondary }]}>
            {step === 1 ? UI_TEXTS[currentLang]?.step1Label : step === 2 ? UI_TEXTS[currentLang]?.step2Label : UI_TEXTS[currentLang]?.step3Label}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ══════════════════════════════════════════════════════════════════
              STEP 1 — Warning screen
          ══════════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <View style={s.stepContent}>
              {/* Big warning icon */}
              <View style={[s.warningCircle, { backgroundColor: theme.redBg }]}>
                <Ionicons name="warning" size={52} color={theme.red} />
              </View>

              <Text style={[s.bigTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.warningTitle}</Text>
              <Text style={[s.bigSub, { color: theme.textSecondary }]}>
                {UI_TEXTS[currentLang]?.warningSubPrefix}<Text style={{ color: theme.red, fontWeight: '800' }}>{UI_TEXTS[currentLang]?.warningSubWord}</Text>{UI_TEXTS[currentLang]?.warningSubSuffix}
              </Text>

              {/* What will be deleted */}
              <View style={[s.lossCard, { backgroundColor: theme.surface, borderColor: theme.red + '30' }]}>
                <Text style={[s.lossTitle, { color: theme.red }]}>{UI_TEXTS[currentLang]?.lossTitle}</Text>
                {[
                  { icon: 'person',        label: 'Your profile and personal data' },
                  { icon: 'construct',     label: 'All machines and usage entries' },
                  { icon: 'calculator',    label: 'All profit calculation history' },
                  { icon: 'alarm',         label: 'All reminders and notifications' },
                  { icon: 'shield-checkmark', label: 'Account access forever' },
                ].map((item, i) => (
                  <View key={i} style={s.lossRow}>
                    <View style={[s.lossIconWrap, { backgroundColor: theme.redBg }]}>
                      <Ionicons name={item.icon as any} size={14} color={theme.red} />
                    </View>
                    <Text style={[s.lossText, { color: theme.textSecondary }]}>{item.label}</Text>
                  </View>
                ))}
              </View>

              {/* User info */}
              {user && (
                <View style={[s.userCard, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
                  <View style={[s.userAvatar, { backgroundColor: theme.primaryBg }]}>
                    <Text style={[s.userAvatarTxt, { color: theme.primary }]}>
                      {user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.userName, { color: theme.text }]}>{user.name}</Text>
                    <Text style={[s.userMobile, { color: theme.textSecondary }]}>{user.email}</Text>
                  </View>
                  <View style={[s.deleteBadge, { backgroundColor: theme.redBg }]}>
                    <Text style={[s.deleteBadgeTxt, { color: theme.red }]}>{UI_TEXTS[currentLang]?.toDeleteBadge}</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[s.proceedBtn, { borderColor: theme.red, backgroundColor: theme.redBg }]}
                onPress={() => setStep(2)}
                activeOpacity={0.85}
              >
                <Ionicons name="arrow-forward" size={18} color={theme.red} />
                <Text style={[s.proceedBtnTxt, { color: theme.red }]}>{UI_TEXTS[currentLang]?.proceedBtn}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.cancelLink} onPress={() => router.back()} activeOpacity={0.7}>
                <Text style={[s.cancelLinkTxt, { color: theme.textSecondary }]}>{UI_TEXTS[currentLang]?.cancelBtn}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 2 — Type DELETE to confirm
          ══════════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <View style={s.stepContent}>
              <View style={[s.warningCircle, { backgroundColor: theme.redBg }]}>
                <Ionicons name="text" size={44} color={theme.red} />
              </View>

              <Text style={[s.bigTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.confirmTitle}</Text>
              <Text style={[s.bigSub, { color: theme.textSecondary }]}>
                {UI_TEXTS[currentLang]?.confirmSubPrefix}
                <Text style={[s.deleteWord, { color: theme.red }]}>{UI_TEXTS[currentLang]?.confirmSubWord}</Text>
                {UI_TEXTS[currentLang]?.confirmSubSuffix}
              </Text>

              {/* Confirmation input */}
              <View style={[
                s.confirmInputWrap,
                {
                  backgroundColor: theme.surface,
                  borderColor: confirmValid ? theme.red : theme.border,
                },
              ]}>
                <TextInput
                  style={[s.confirmInput, { color: theme.text }]}
                  value={confirmText}
                  onChangeText={setConfirmText}
                  placeholder={UI_TEXTS[currentLang]?.confirmPlaceholder}
                  placeholderTextColor={theme.textMuted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={10}
                />
                {confirmValid && (
                  <Ionicons name="checkmark-circle" size={22} color={theme.red} />
                )}
              </View>

              {confirmText.length > 0 && !confirmValid && (
                <Text style={[s.confirmHint, { color: theme.textMuted }]}>{UI_TEXTS[currentLang]?.confirmHint}</Text>
              )}

              {/* Send OTP button */}
              <TouchableOpacity
                style={[
                  s.otpBtn,
                  { backgroundColor: confirmValid ? theme.red : theme.inputBg },
                  !confirmValid && { opacity: 0.5 },
                ]}
                onPress={handleSendOtp}
                disabled={!confirmValid || sendingOtp}
                activeOpacity={0.85}
              >
                {sendingOtp ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color={confirmValid ? '#FFF' : theme.textMuted} />
                    <Text style={[s.otpBtnTxt, { color: confirmValid ? '#FFF' : theme.textMuted }]}>{UI_TEXTS[currentLang]?.sendOtpBtn}</Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={[s.otpNote, { color: theme.textSecondary }]}>
                {UI_TEXTS[currentLang]?.otpNote}
                <Text style={{ fontWeight: '700', color: theme.text }}>{user?.email}</Text>
              </Text>

              <TouchableOpacity style={s.cancelLink} onPress={() => router.back()} activeOpacity={0.7}>
                <Text style={[s.cancelLinkTxt, { color: theme.textSecondary }]}>{UI_TEXTS[currentLang]?.cancelBtn}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              STEP 3 — OTP verification
          ══════════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <View style={s.stepContent}>
              <View style={[s.warningCircle, { backgroundColor: theme.redBg }]}>
                <Text style={{ fontSize: 44 }}>📱</Text>
              </View>

              <Text style={[s.bigTitle, { color: theme.text }]}>{UI_TEXTS[currentLang]?.otpTitle}</Text>
              <Text style={[s.bigSub, { color: theme.textSecondary }]}>
                {UI_TEXTS[currentLang]?.otpSub}{'\n'}
                <Text style={{ fontWeight: '800', color: theme.text }}>{user?.email}</Text>
              </Text>

              {/* OTP boxes */}
              <Animated.View style={[s.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={r => { inputRefs.current[idx] = r; }}
                    style={[
                      s.otpBox,
                      {
                        backgroundColor: theme.inputBg,
                        borderColor: digit ? theme.red : theme.border,
                        color: theme.text,
                      },
                      digit && { backgroundColor: theme.redBg },
                      idx === filled && { borderColor: theme.red, borderWidth: 2.5 },
                    ]}
                    value={digit}
                    onChangeText={v => handleOtpChange(v, idx)}
                    onKeyPress={e => handleOtpKeyPress(e, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </Animated.View>

              {/* Progress bar */}
              <View style={[s.progressTrack, { backgroundColor: theme.border }]}>
                <View style={[
                  s.progressFill,
                  { backgroundColor: theme.red, width: `${(filled / OTP_LEN) * 100}%` as any },
                ]} />
              </View>

              {/* Delete button */}
              <TouchableOpacity
                style={[
                  s.deleteConfirmBtn,
                  { backgroundColor: filled === OTP_LEN ? theme.red : theme.inputBg },
                  filled < OTP_LEN && { opacity: 0.5 },
                ]}
                onPress={handleDeleteConfirm}
                disabled={filled < OTP_LEN || verifying}
                activeOpacity={0.85}
              >
                {verifying ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="person-remove" size={18} color={filled === OTP_LEN ? '#FFF' : theme.textMuted} />
                    <Text style={[s.deleteConfirmBtnTxt, { color: filled === OTP_LEN ? '#FFF' : theme.textMuted }]}>{UI_TEXTS[currentLang]?.deleteBtn}</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Resend */}
              <View style={s.resendRow}>
                {resendSec > 0 ? (
                  <Text style={[s.resendTimer, { color: theme.textSecondary }]}>
                    {UI_TEXTS[currentLang]?.resendTimerPrefix}{resendSec}s
                  </Text>
                ) : (
                  <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                    <Text style={[s.resendLink, { color: theme.red }]}>{UI_TEXTS[currentLang]?.resendBtn}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity style={s.cancelLink} onPress={() => router.back()} activeOpacity={0.7}>
                <Text style={[s.cancelLinkTxt, { color: theme.textSecondary }]}>{UI_TEXTS[currentLang]?.cancelBtn}</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1 },

  // Header
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

  // Step bar
  stepBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.lg, paddingVertical: 12,
    borderBottomWidth: 1, gap: 0,
  },
  stepLine: { flex: 1, height: 2, marginHorizontal: 4 },
  stepLabel: {
    position: 'absolute', right: SPACING.md,
    fontSize: FONT_SIZE.xs, fontWeight: '600',
  },

  // Scroll
  scroll: { padding: SPACING.md, paddingBottom: 48 },
  stepContent: { alignItems: 'center', gap: 16 },

  // Warning circle
  warningCircle: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8, marginTop: 8,
  },

  // Titles
  bigTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', textAlign: 'center', letterSpacing: -0.4 },
  bigSub: { fontSize: FONT_SIZE.sm, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },

  // Loss card
  lossCard: {
    width: '100%', borderRadius: RADIUS.md,
    padding: SPACING.md, borderWidth: 1.5, gap: 10,
  },
  lossTitle: { fontSize: FONT_SIZE.sm, fontWeight: '800', marginBottom: 4 },
  lossRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lossIconWrap: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  lossText: { fontSize: FONT_SIZE.sm, fontWeight: '500', flex: 1 },

  // User card
  userCard: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    gap: 12, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1,
  },
  userAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  userAvatarTxt: { fontSize: 16, fontWeight: '800' },
  userName: { fontSize: FONT_SIZE.md, fontWeight: '700' },
  userMobile: { fontSize: FONT_SIZE.xs, marginTop: 2 },
  deleteBadge: { borderRadius: RADIUS.full, paddingHorizontal: 10, paddingVertical: 4 },
  deleteBadgeTxt: { fontSize: 10, fontWeight: '700' },

  // Proceed button (step 1)
  proceedBtn: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    borderRadius: RADIUS.md, paddingVertical: SPACING.md,
    borderWidth: 1.5, marginTop: 4,
  },
  proceedBtnTxt: { fontSize: FONT_SIZE.md, fontWeight: '700' },

  // Confirm input (step 2)
  confirmInputWrap: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    borderRadius: RADIUS.md, borderWidth: 2,
    paddingHorizontal: SPACING.md, paddingVertical: 14,
    gap: 10,
  },
  confirmInput: { flex: 1, fontSize: FONT_SIZE.xl, fontWeight: '800', letterSpacing: 4, padding: 0 },
  confirmHint: { fontSize: FONT_SIZE.xs, alignSelf: 'flex-start' },
  deleteWord: { fontWeight: '800', letterSpacing: 2 },

  // OTP send button (step 2)
  otpBtn: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    borderRadius: RADIUS.md, paddingVertical: SPACING.md + 2,
    marginTop: 4,
  },
  otpBtnTxt: { fontSize: FONT_SIZE.md, fontWeight: '800' },
  otpNote: { fontSize: FONT_SIZE.xs, textAlign: 'center', lineHeight: 18 },

  // OTP boxes (step 3)
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 6 },
  otpBox: {
    flex: 1, height: 56, borderRadius: RADIUS.md,
    borderWidth: 2, textAlign: 'center',
    fontSize: FONT_SIZE.xl, fontWeight: '800',
  },

  // Progress bar
  progressTrack: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },

  // Delete confirm button (step 3)
  deleteConfirmBtn: {
    width: '100%', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    borderRadius: RADIUS.md, paddingVertical: SPACING.md + 2,
    marginTop: 4,
  },
  deleteConfirmBtnTxt: { fontSize: FONT_SIZE.md, fontWeight: '800' },

  // Resend
  resendRow: { alignItems: 'center', paddingVertical: 4 },
  resendTimer: { fontSize: FONT_SIZE.sm, fontWeight: '500' },
  resendLink: { fontSize: FONT_SIZE.sm, fontWeight: '700' },

  // Cancel link
  cancelLink: { paddingVertical: SPACING.sm, marginTop: 4 },
  cancelLinkTxt: { fontSize: FONT_SIZE.sm, fontWeight: '600', textDecorationLine: 'underline' },
});
