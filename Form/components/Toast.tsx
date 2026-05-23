/**
 * Toast.tsx — Premium Global Toast System
 * Features: glassmorphism, gradient backgrounds, haptic feedback,
 * spam prevention, slide+spring animation, dark mode support.
 */
import React, { useEffect, useRef, useCallback } from 'react';
import {
  Animated, Text, StyleSheet, View,
  TouchableOpacity, Dimensions, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

const { width: SW } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
  type: ToastType;
  text1: string;
  text2?: string;
  visibilityTime?: number;
}

// ── Per-type design tokens ─────────────────────────────────────────────────────
const TOAST_META: Record<
  ToastType,
  {
    icon: string;
    gradLight: [string, string];
    gradDark:  [string, string];
    iconColor: string;
    iconBgLight: string;
    iconBgDark:  string;
    accent: string;
    borderLight: string;
    borderDark:  string;
    haptic: 'success' | 'warning' | 'error';
    defaultDuration: number;
  }
> = {
  success: {
    icon: 'checkmark-circle',
    gradLight:   ['#FFFFFF', '#F0FBF1'],
    gradDark:    ['#1A2E1B', '#132213'],
    iconColor:   '#16A34A',
    iconBgLight: '#DCFCE7',
    iconBgDark:  '#14532D',
    accent:      '#16A34A',
    borderLight: '#BBF7D0',
    borderDark:  '#166534',
    haptic: 'success',
    defaultDuration: 3000,
  },
  error: {
    icon: 'close-circle',
    gradLight:   ['#FFFFFF', '#FFF1F2'],
    gradDark:    ['#2A1515', '#1C0A0A'],
    iconColor:   '#DC2626',
    iconBgLight: '#FEE2E2',
    iconBgDark:  '#450A0A',
    accent:      '#DC2626',
    borderLight: '#FECACA',
    borderDark:  '#7F1D1D',
    haptic: 'error',
    defaultDuration: 4000,
  },
  warning: {
    icon: 'warning',
    gradLight:   ['#FFFFFF', '#FFFBEB'],
    gradDark:    ['#2A1800', '#1C1000'],
    iconColor:   '#D97706',
    iconBgLight: '#FEF3C7',
    iconBgDark:  '#451A03',
    accent:      '#D97706',
    borderLight: '#FDE68A',
    borderDark:  '#78350F',
    haptic: 'warning',
    defaultDuration: 3500,
  },
  info: {
    icon: 'information-circle',
    gradLight:   ['#FFFFFF', '#EFF6FF'],
    gradDark:    ['#0D1B2E', '#091220'],
    iconColor:   '#2563EB',
    iconBgLight: '#DBEAFE',
    iconBgDark:  '#1E3A5F',
    accent:      '#2563EB',
    borderLight: '#BFDBFE',
    borderDark:  '#1E40AF',
    haptic: 'success',
    defaultDuration: 3000,
  },
};

// ── Spam prevention — debounce identical toasts ────────────────────────────────
let lastToastKey  = '';
let lastToastTime = 0;
const SPAM_INTERVAL_MS = 1200;

// ── Singleton bridge ───────────────────────────────────────────────────────────
let showToastFn: ((config: ToastConfig) => void) | null = null;

export const Toast = {
  show: (config: ToastConfig) => {
    const key = `${config.type}:${config.text1}`;
    const now = Date.now();
    if (key === lastToastKey && now - lastToastTime < SPAM_INTERVAL_MS) return;
    lastToastKey  = key;
    lastToastTime = now;
    if (showToastFn) showToastFn(config);
  },
};

// ── ToastProvider ──────────────────────────────────────────────────────────────
export function ToastProvider() {
  const { isDark } = useTheme();
  const [config, setConfig] = React.useState<ToastConfig | null>(null);

  // Animations
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.88)).current;
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -140, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 0,    duration: 260, useNativeDriver: true }),
      Animated.spring(scale,      { toValue: 0.88, useNativeDriver: true, speed: 18, bounciness: 0 }),
    ]).start(() => setConfig(null));
  }, [opacity, scale, translateY]);

  useEffect(() => {
    showToastFn = (cfg) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      // Trigger haptic
      const meta = TOAST_META[cfg.type];
      try {
        if (meta.haptic === 'success') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        } else if (meta.haptic === 'error') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
        }
      } catch {}

      // Reset values before animating in
      translateY.setValue(-140);
      opacity.setValue(0);
      scale.setValue(0.88);
      setConfig(cfg);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0, useNativeDriver: true,
          speed: 20, bounciness: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1, duration: 220, useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1, useNativeDriver: true,
          speed: 20, bounciness: 8,
        }),
      ]).start();

      const duration = cfg.visibilityTime ?? meta.defaultDuration;
      timerRef.current = setTimeout(dismiss, duration);
    };

    return () => {
      showToastFn = null;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dismiss, opacity, scale, translateY]);

  if (!config) return null;

  const meta    = TOAST_META[config.type];
  const grad    = isDark ? meta.gradDark    : meta.gradLight;
  const iconBg  = isDark ? meta.iconBgDark  : meta.iconBgLight;
  const border  = isDark ? meta.borderDark  : meta.borderLight;
  const titleColor = isDark ? '#F9FAFB' : '#111827';
  const subColor   = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <Animated.View
      style={[
        ts.wrapper,
        { opacity, transform: [{ translateY }, { scale }] },
      ]}
      pointerEvents="box-none"
    >
      <LinearGradient
        colors={grad as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          ts.toast,
          {
            borderColor: border,
            // Left accent strip colour via borderLeftColor
            borderLeftColor: meta.accent,
            // Elevation shadow tinted with accent colour on Android
            shadowColor: meta.accent,
          },
        ]}
      >
        {/* Accent left strip */}
        <View style={[ts.accentStrip, { backgroundColor: meta.accent }]} />

        {/* Icon */}
        <View style={[ts.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={meta.icon as any} size={24} color={meta.iconColor} />
        </View>

        {/* Text */}
        <View style={ts.texts}>
          <Text style={[ts.text1, { color: titleColor }]} numberOfLines={1}>
            {config.text1}
          </Text>
          {config.text2 ? (
            <Text style={[ts.text2, { color: subColor }]} numberOfLines={2}>
              {config.text2}
            </Text>
          ) : null}
        </View>

        {/* Close */}
        <TouchableOpacity
          onPress={dismiss}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[ts.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const ts = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 42,
    left: 14,
    right: 14,
    zIndex: 999999,
    // Ensure it renders above everything
    elevation: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    // Premium shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 12,
    paddingVertical: 13,
    paddingRight: 12,
    paddingLeft: 0,
    gap: 10,
  },
  accentStrip: {
    width: 4,
    alignSelf: 'stretch',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    marginRight: 2,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  text1: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
    lineHeight: 19,
  },
  text2: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
