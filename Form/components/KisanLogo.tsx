import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface KisanLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  light?: boolean;
}

const SIZE_MAP = {
  sm: { icon: 20, ring: 32, text: 14, sub: 9 },
  md: { icon: 26, ring: 42, text: 18, sub: 10 },
  lg: { icon: 34, ring: 54, text: 24, sub: 12 },
};

export default function KisanLogo({ size = 'md', variant = 'full', light = false }: KisanLogoProps) {
  const { theme } = useTheme();
  const s = SIZE_MAP[size];

  return (
    <View style={styles.container}>
      {/* Icon mark */}
      <View style={[styles.iconMark, { width: s.ring, height: s.ring, borderRadius: s.ring / 2 }]}>
        {/* Sun arc */}
        <View style={[styles.sunArc, { width: s.ring * 0.55, height: s.ring * 0.28, borderRadius: s.ring * 0.28 }]} />
        {/* Leaf */}
        <Ionicons name="leaf" size={s.icon} color={COLORS.white} style={styles.leafIcon} />
        {/* Yellow dot accent */}
        <View style={[styles.dot, {
          width: s.ring * 0.18, height: s.ring * 0.18,
          borderRadius: s.ring * 0.09,
          top: s.ring * 0.08, right: s.ring * 0.1,
        }]} />
      </View>

      {/* Text */}
      {variant === 'full' && (
        <View>
          <Text style={[styles.brandName, {
            fontSize: s.text,
            color: light ? COLORS.white : theme.primary,
          }]}>
            Kisan Mitra
          </Text>
          <Text style={[styles.tagline, {
            fontSize: s.sub,
            color: light ? 'rgba(255,255,255,0.72)' : theme.textSecondary,
          }]}>
            Smart Farming
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconMark: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sunArc: {
    position: 'absolute',
    top: -6,
    backgroundColor: COLORS.secondary,
    opacity: 0.85,
  },
  leafIcon: {
    zIndex: 2,
  },
  dot: {
    position: 'absolute',
    backgroundColor: COLORS.secondary,
    zIndex: 3,
  },
  brandName: {
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  tagline: {
    fontWeight: '500',
    letterSpacing: 0.2,
    marginTop: 1,
  },
});
