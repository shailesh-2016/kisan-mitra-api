import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

// BottomBar total height: 64 (bar) + 8 (paddingTop) + bottomPad
const BAR_H   = 64;
const BAR_PAD = 8;

export default function FloatingMicButton() {
  const insets    = useSafeAreaInsets();
  const { isDark } = useTheme();
  const bottomPad = insets.bottom > 0 ? insets.bottom : 12;
  const barTotalH = BAR_H + BAR_PAD + bottomPad;

  // Pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // In dark mode, slightly reduce the pulse opacity so it doesn't bleed too much
  const pulseOpacity = isDark ? 0.1 : 0.15;

  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: barTotalH + 12 }]}
      activeOpacity={0.82}
    >
      {/* Animated pulse ring */}
      <Animated.View
        style={[
          styles.pulse,
          { transform: [{ scale: pulseAnim }], opacity: pulseOpacity },
        ]}
        pointerEvents="none"
      />
      <Ionicons name="mic" size={20} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99,
  },
  pulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.secondary,
    opacity: 0.15,
  },
});
