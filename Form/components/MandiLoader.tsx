/**
 * MandiLoader — Premium animated loading screen for the Mandi/Market screen.
 * Features: pulsing logo, staggered crop emoji wave, animated progress bar,
 * and a rotating ring — all using React Native Animated (no external deps).
 * Dark mode aware via ThemeContext.
 */
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const { width: W } = Dimensions.get('window');

const CROPS = ['🌾', '🍅', '🥕', '🫘', '🌽', '🍎', '🧅', '🥔'];

interface MandiLoaderProps {
  message?: string;
  subMessage?: string;
}

export default function MandiLoader({
  message = 'Finding nearby mandis...',
  subMessage = 'Calculating distances',
}: MandiLoaderProps) {
  const { theme } = useTheme();

  // ── Pulse for the center icon ──
  const pulse    = useRef(new Animated.Value(1)).current;
  // ── Rotation for the outer ring ──
  const spin     = useRef(new Animated.Value(0)).current;
  // ── Progress bar ──
  const progress = useRef(new Animated.Value(0)).current;
  // ── Staggered crop emojis ──
  const cropAnims = useRef(CROPS.map(() => new Animated.Value(0))).current;
  // ── Fade in the whole card ──
  const fadeIn   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeIn, {
      toValue: 1, duration: 400, useNativeDriver: true,
    }).start();

    // Pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    // Spin loop
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1, duration: 2200,
        easing: Easing.linear, useNativeDriver: true,
      })
    ).start();

    // Progress bar — goes to 85% then holds
    Animated.timing(progress, {
      toValue: 0.85, duration: 3500,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();

    // Staggered crop wave
    const stagger = Animated.stagger(
      90,
      cropAnims.map(a =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(a, { toValue: -10, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            Animated.timing(a, { toValue: 0,   duration: 350, easing: Easing.in(Easing.quad),  useNativeDriver: true }),
            Animated.delay(400),
          ])
        )
      )
    );
    stagger.start();

    return () => {
      pulse.stopAnimation();
      spin.stopAnimation();
      progress.stopAnimation();
      cropAnims.forEach(a => a.stopAnimation());
    };
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeIn, backgroundColor: theme.background }]}>

      {/* ── Center icon with ring ── */}
      <View style={styles.iconArea}>
        {/* Outer spinning ring */}
        <Animated.View style={[
          styles.ring,
          {
            borderColor: theme.primary,
            borderTopColor: 'transparent',
            borderRightColor: theme.primaryLight,
            transform: [{ rotate }],
          },
        ]} />

        {/* Inner pulsing icon */}
        <Animated.View style={[
          styles.iconCircle,
          { backgroundColor: theme.primaryBg, transform: [{ scale: pulse }] },
        ]}>
          <Ionicons name="storefront" size={36} color={theme.primary} />
        </Animated.View>
      </View>

      {/* ── Title ── */}
      <Text style={[styles.title, { color: theme.text }]}>{message}</Text>
      <Text style={[styles.sub, { color: theme.textSecondary }]}>{subMessage}</Text>

      {/* ── Progress bar ── */}
      <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
        <Animated.View style={[styles.barFill, { width: barWidth, backgroundColor: theme.primary }]}>
          {/* Shimmer overlay */}
          <View style={styles.barShimmer} />
        </Animated.View>
      </View>

      {/* ── Crop emoji wave ── */}
      <View style={styles.cropRow}>
        {CROPS.map((emoji, i) => (
          <Animated.Text
            key={i}
            style={[styles.cropEmoji, { transform: [{ translateY: cropAnims[i] }] }]}
          >
            {emoji}
          </Animated.Text>
        ))}
      </View>

      {/* ── Dots ── */}
      <DotsLoader />
    </Animated.View>
  );
}

// ── Animated dots ─────────────────────────────────────────────────────────────
function DotsLoader() {
  const { theme } = useTheme();
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0.3))).current;

  useEffect(() => {
    Animated.loop(
      Animated.stagger(200, dots.map(d =>
        Animated.sequence([
          Animated.timing(d, { toValue: 1,   duration: 300, useNativeDriver: true }),
          Animated.timing(d, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(300),
        ])
      ))
    ).start();
    return () => dots.forEach(d => d.stopAnimation());
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((d, i) => (
        <Animated.View
          key={i}
          style={[styles.dot, { opacity: d, backgroundColor: theme.primary }]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 0,
  },

  // Icon area
  iconArea: {
    width: 110,
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  ring: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  // Text
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  sub: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 28,
  },

  // Progress bar
  barTrack: {
    width: W - 80,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 32,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  barShimmer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 3,
  },

  // Crop emojis
  cropRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  cropEmoji: {
    fontSize: 22,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
