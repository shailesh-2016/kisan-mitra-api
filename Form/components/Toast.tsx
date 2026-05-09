import React, { useEffect, useRef, useCallback } from 'react';
import { Animated, Text, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width: SW } = Dimensions.get('window');

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
  type: ToastType;
  text1: string;
  text2?: string;
  visibilityTime?: number;
}

// Accent colors stay the same in both modes — they're brand/status colors
const TOAST_ACCENT: Record<ToastType, { accent: string; icon: string; iconBgLight: string; iconBgDark: string }> = {
  success: { accent: '#2E7D32', icon: 'checkmark-circle',  iconBgLight: '#E8F5E9', iconBgDark: '#1A2E1B' },
  error:   { accent: '#C62828', icon: 'close-circle',       iconBgLight: '#FFEBEE', iconBgDark: '#2A1515' },
  info:    { accent: '#1565C0', icon: 'information-circle', iconBgLight: '#E3F2FD', iconBgDark: '#0D1B2E' },
  warning: { accent: '#E65100', icon: 'warning',            iconBgLight: '#FFF3E0', iconBgDark: '#2A1800' },
};

let showToastFn: ((config: ToastConfig) => void) | null = null;

export const Toast = {
  show: (config: ToastConfig) => { if (showToastFn) showToastFn(config); },
};

export function ToastProvider() {
  const { theme, isDark } = useTheme();
  const [config, setConfig] = React.useState<ToastConfig | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.92)).current;
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -120, duration: 280, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 0,    duration: 280, useNativeDriver: true }),
      Animated.timing(scale,      { toValue: 0.92, duration: 280, useNativeDriver: true }),
    ]).start(() => setConfig(null));
  }, [opacity, scale, translateY]);

  useEffect(() => {
    showToastFn = (cfg) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      translateY.setValue(-120);
      opacity.setValue(0);
      scale.setValue(0.92);
      setConfig(cfg);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 22, bounciness: 5 }),
        Animated.timing(opacity,    { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scale,      { toValue: 1, useNativeDriver: true, speed: 22, bounciness: 5 }),
      ]).start();
      timerRef.current = setTimeout(dismiss, cfg.visibilityTime ?? 2800);
    };
    return () => { showToastFn = null; if (timerRef.current) clearTimeout(timerRef.current); };
  }, [dismiss, opacity, scale, translateY]);

  if (!config) return null;

  const meta    = TOAST_ACCENT[config.type];
  const iconBg  = isDark ? meta.iconBgDark : meta.iconBgLight;

  return (
    <Animated.View style={[ts.wrapper, { opacity, transform: [{ translateY }, { scale }] }]}>
      <View style={[
        ts.toast,
        {
          backgroundColor: theme.surfaceElevated,
          borderLeftColor: meta.accent,
          // Stronger shadow in dark mode for contrast
          shadowOpacity: isDark ? 0.4 : 0.13,
        },
      ]}>
        <View style={[ts.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={meta.icon as any} size={22} color={meta.accent} />
        </View>
        <View style={ts.texts}>
          <Text style={[ts.text1, { color: theme.text }]} numberOfLines={1}>{config.text1}</Text>
          {config.text2 ? (
            <Text style={[ts.text2, { color: theme.textSecondary }]} numberOfLines={2}>{config.text2}</Text>
          ) : null}
        </View>
        <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={16} color={theme.textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const ts = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    zIndex: 99999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 10,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
  text1: { fontSize: 14, fontWeight: '700', letterSpacing: -0.1 },
  text2: { fontSize: 12, marginTop: 2, lineHeight: 16 },
});
