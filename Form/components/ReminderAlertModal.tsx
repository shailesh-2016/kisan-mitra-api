/**
 * ReminderAlertModal.tsx
 * Full-screen premium reminder alert with ring animation, ripple effect,
 * and farmer-friendly messaging. Uses react-native-reanimated.
 */

import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Dimensions, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withDelay, withSpring, Easing, interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { COLORS, FONT_SIZE, RADIUS, SHADOW, SPACING } from '../constants/theme';

const { width: W, height: H } = Dimensions.get('window');

// Priority config
const PRIORITY_CONFIG = {
  high:   { color: '#D32F2F', bg: '#FFEBEE', glow: '#FF5252', size: 100 },
  medium: { color: '#F57F17', bg: '#FFF8E1', glow: '#FFD740', size: 88  },
  low:    { color: '#2E7D32', bg: '#E8F5E9', glow: '#69F0AE', size: 80  },
};

// Task emoji map
const TASK_EMOJIS: Record<string, string> = {
  water: '💧', spray: '🌿', harvest: '🌾', soil: '🪱',
  market: '🏪', pest: '🐛', tractor: '🚜', default: '⏰',
};

function getTaskEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('water') || lower.includes('पानी') || lower.includes('પાણી')) return '💧';
  if (lower.includes('spray') || lower.includes('fertiliz') || lower.includes('खाद') || lower.includes('ખાતર')) return '🌿';
  if (lower.includes('harvest') || lower.includes('कटाई') || lower.includes('કાપ')) return '🌾';
  if (lower.includes('soil') || lower.includes('मिट्टी') || lower.includes('માટી')) return '🪱';
  if (lower.includes('market') || lower.includes('मंडी') || lower.includes('મંડી')) return '🏪';
  if (lower.includes('pest') || lower.includes('कीट') || lower.includes('જીવ')) return '🐛';
  if (lower.includes('tractor') || lower.includes('ट्रैक्टर') || lower.includes('ટ્રેક')) return '🚜';
  return '⏰';
}

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

// ── Ripple Ring ───────────────────────────────────────────────────────────────
function RippleRing({ color, delay, size }: { color: string; delay: number; size: number }) {
  const scale  = useSharedValue(0.6);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withDelay(delay, withRepeat(
      withTiming(2.2, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1, false,
    ));
    opacity.value = withDelay(delay, withRepeat(
      withTiming(0, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1, false,
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[
      rippleStyle.ring,
      { width: size, height: size, borderRadius: size / 2, borderColor: color },
      style,
    ]} />
  );
}

const rippleStyle = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
});

// ── Bell Icon ─────────────────────────────────────────────────────────────────
function AnimatedBell({ emoji, color, bg, size }: {
  emoji: string; color: string; bg: string; size: number;
}) {
  const rotate  = useSharedValue(0);
  const scale   = useSharedValue(1);
  const glow    = useSharedValue(0.4);

  useEffect(() => {
    // Bell ring: shake left-right
    rotate.value = withRepeat(
      withSequence(
        withTiming(-18, { duration: 80 }),
        withTiming(18,  { duration: 80 }),
        withTiming(-14, { duration: 70 }),
        withTiming(14,  { duration: 70 }),
        withTiming(-8,  { duration: 60 }),
        withTiming(8,   { duration: 60 }),
        withTiming(0,   { duration: 60 }),
        withTiming(0,   { duration: 600 }), // pause
      ),
      -1, false,
    );
    // Pulse scale
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 400 }),
        withTiming(1.0,  { duration: 400 }),
      ),
      -1, true,
    );
    // Glow pulse
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 600 }),
        withTiming(0.3, { duration: 600 }),
      ),
      -1, true,
    );
  }, []);

  const bellStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Glow halo */}
      <Animated.View style={[
        bell.glow,
        { width: size + 40, height: size + 40, borderRadius: (size + 40) / 2, backgroundColor: color + '30' },
        glowStyle,
      ]} />
      {/* Icon circle */}
      <Animated.View style={[
        bell.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        bellStyle,
      ]}>
        <Text style={{ fontSize: size * 0.44 }}>{emoji}</Text>
      </Animated.View>
    </View>
  );
}

const bell = StyleSheet.create({
  glow: { position: 'absolute' },
  circle: {
    alignItems: 'center', justifyContent: 'center',
    ...SHADOW.lg,
  },
});

// ── Main Modal ────────────────────────────────────────────────────────────────
export interface ReminderAlertProps {
  visible: boolean;
  taskName: string;
  time: string;
  priority?: 'high' | 'medium' | 'low';
  onComplete: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

export default function ReminderAlertModal({
  visible, taskName, time, priority = 'medium',
  onComplete, onSnooze, onDismiss,
}: ReminderAlertProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();

  const cfg   = PRIORITY_CONFIG[priority];
  const emoji = getTaskEmoji(taskName);

  // Modal entrance animation
  const modalY   = useSharedValue(H);
  const modalOp  = useSharedValue(0);
  const cardScale = useSharedValue(0.85);

  useEffect(() => {
    if (visible) {
      // Haptic feedback
      Haptics.notificationAsync(
        priority === 'high'
          ? Haptics.NotificationFeedbackType.Warning
          : Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});

      modalOp.value  = withTiming(1, { duration: 300 });
      modalY.value   = withSpring(0, { damping: 18, stiffness: 120 });
      cardScale.value = withSpring(1, { damping: 14, stiffness: 100 });
    } else {
      modalOp.value  = withTiming(0, { duration: 200 });
      modalY.value   = withTiming(H, { duration: 250 });
      cardScale.value = withTiming(0.85, { duration: 200 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({ opacity: modalOp.value }));
  const cardStyle    = useAnimatedStyle(() => ({
    transform: [{ translateY: modalY.value }, { scale: cardScale.value }],
  }));

  // Button press animation
  function usePressAnim() {
    const s = useSharedValue(1);
    const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
    const onIn  = () => { s.value = withSpring(0.94, { damping: 10 }); };
    const onOut = () => { s.value = withSpring(1.0,  { damping: 10 }); };
    return { style, onIn, onOut };
  }

  const completeAnim = usePressAnim();
  const snoozeAnim   = usePressAnim();
  const dismissAnim  = usePressAnim();

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} statusBarTranslucent>
      {/* Blurred backdrop */}
      <Animated.View style={[StyleSheet.absoluteFill, overlayStyle]}>
        <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)' }]} />
      </Animated.View>

      {/* Card */}
      <Animated.View style={[m.container, cardStyle]}>
        <LinearGradient
          colors={isDark
            ? ['#1A2E1A', '#0D1F0D', '#1A2E1A']
            : ['#FFFFFF', '#F0FBF1', '#FFFFFF']}
          style={m.card}
        >
          {/* Priority indicator bar */}
          <View style={[m.priorityBar, { backgroundColor: cfg.color }]} />

          {/* Ripple rings + Bell */}
          <View style={m.bellArea}>
            <RippleRing color={cfg.glow} delay={0}    size={cfg.size + 60} />
            <RippleRing color={cfg.glow} delay={600}  size={cfg.size + 60} />
            <RippleRing color={cfg.glow} delay={1200} size={cfg.size + 60} />
            <AnimatedBell emoji={emoji} color={cfg.color} bg={cfg.bg} size={cfg.size} />
          </View>

          {/* Header label */}
          <View style={[m.headerBadge, { backgroundColor: cfg.bg }]}>
            <Ionicons name="alarm" size={13} color={cfg.color} />
            <Text style={[m.headerBadgeTxt, { color: cfg.color }]}>
              {t('reminder.title').toUpperCase()}
            </Text>
          </View>

          {/* Big title */}
          <Text style={[m.bigTitle, { color: isDark ? '#fff' : COLORS.text }]}>
            {t('reminder.alertTitle')}
          </Text>

          {/* Task message */}
          <View style={[m.taskBox, { backgroundColor: isDark ? '#1F3320' : cfg.bg, borderColor: cfg.color + '40' }]}>
            <Text style={[m.taskEmoji]}>{emoji}</Text>
            <Text style={[m.taskName, { color: isDark ? '#E8F5E9' : COLORS.text }]} numberOfLines={3}>
              {taskName}
            </Text>
          </View>

          {/* Time */}
          <View style={m.timeRow}>
            <Ionicons name="time-outline" size={16} color={cfg.color} />
            <Text style={[m.timeTxt, { color: cfg.color }]}>{formatTime12(time)}</Text>
          </View>

          {/* Divider */}
          <View style={[m.divider, { backgroundColor: isDark ? '#2E4A2E' : '#E8F5E9' }]} />

          {/* Action buttons */}
          <View style={m.btnRow}>
            {/* Dismiss */}
            <Animated.View style={[m.btnWrap, dismissAnim.style]}>
              <TouchableOpacity
                style={[m.btn, m.btnDismiss, { borderColor: isDark ? '#3A3A3A' : '#E5E7EB' }]}
                onPress={onDismiss}
                onPressIn={dismissAnim.onIn}
                onPressOut={dismissAnim.onOut}
                activeOpacity={1}
              >
                <Ionicons name="close-outline" size={18} color={isDark ? '#9CA3AF' : COLORS.textSecondary} />
                <Text style={[m.btnTxt, { color: isDark ? '#9CA3AF' : COLORS.textSecondary }]}>
                  {t('reminder.dismiss')}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Snooze */}
            <Animated.View style={[m.btnWrap, snoozeAnim.style]}>
              <TouchableOpacity
                style={[m.btn, m.btnSnooze, { backgroundColor: isDark ? '#2A2A1A' : '#FFF8E1', borderColor: '#F57F17' + '60' }]}
                onPress={onSnooze}
                onPressIn={snoozeAnim.onIn}
                onPressOut={snoozeAnim.onOut}
                activeOpacity={1}
              >
                <Ionicons name="moon-outline" size={18} color="#F57F17" />
                <Text style={[m.btnTxt, { color: '#F57F17' }]}>{t('reminder.snooze')}</Text>
                <Text style={[m.btnSub, { color: '#F57F17' + 'AA' }]}>{t('reminder.snoozeMin')}</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Complete */}
            <Animated.View style={[m.btnWrap, completeAnim.style]}>
              <TouchableOpacity
                style={[m.btn, m.btnComplete]}
                onPress={onComplete}
                onPressIn={completeAnim.onIn}
                onPressOut={completeAnim.onOut}
                activeOpacity={1}
              >
                <LinearGradient colors={['#1B5E20', '#43A047']} style={m.btnGrad}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                  <Text style={[m.btnTxt, { color: '#FFF' }]}>{t('reminder.complete')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Farmer tip */}
          <Text style={[m.tip, { color: isDark ? '#6B7280' : COLORS.textSecondary }]}>
            🌾 {t('reminder.alertTip')}
          </Text>
        </LinearGradient>
      </Animated.View>
    </Modal>
  );
}

const m = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    paddingBottom: 24,
    ...SHADOW.lg,
  },
  priorityBar: {
    height: 4,
    borderRadius: 2,
    marginHorizontal: 40,
    marginTop: 12,
    marginBottom: 4,
  },
  bellArea: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginTop: 8,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'center',
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 10,
  },
  headerBadgeTxt: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  bigTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
    paddingHorizontal: 24,
    marginBottom: 16,
    lineHeight: 28,
  },
  taskBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  taskEmoji: { fontSize: 32 },
  taskName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 16,
  },
  timeTxt: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  btnWrap: { flex: 1 },
  btn: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
  },
  btnDismiss: { borderColor: '#E5E7EB' },
  btnSnooze:  {},
  btnComplete: { borderColor: 'transparent' },
  btnGrad: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
  },
  btnTxt: { fontSize: 13, fontWeight: '800', textAlign: 'center' },
  btnSub: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  tip: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
  },
});
