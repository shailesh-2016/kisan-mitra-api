/**
 * PageHeader — Premium reusable header for all inner screens.
 *
 * Layout:  [BackBtn]  [Icon + Title + Subtitle]  [RightElement]
 *
 * Usage:
 *   <PageHeader title="Weather" onBack={() => router.back()} />
 *   <PageHeader title="Machines" subtitle="Track usage" onBack={...} rightElement={<Btn/>} />
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  iconName?: string;
  iconColor?: string;
  iconBg?: string;
}

export default function PageHeader({
  title,
  subtitle,
  onBack,
  rightElement,
  iconName,
  iconColor = COLORS.primary,
  iconBg = '#E8F5E9',
}: PageHeaderProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
      {/* ── Left: back button ── */}
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={20} color={theme.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.btnPlaceholder} />
        )}
      </View>

      {/* ── Center: icon + title + subtitle ── */}
      <View style={styles.center}>
        {iconName ? (
          <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
            <Ionicons name={iconName as any} size={18} color={iconColor} />
          </View>
        ) : null}
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>

      {/* ── Right: action button or spacer ── */}
      <View style={styles.right}>
        {rightElement ?? <View style={styles.btnPlaceholder} />}
      </View>
    </View>
  );
}

export const PAGE_HEADER_H = Platform.OS === 'ios' ? 64 : 60;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: PAGE_HEADER_H,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Left ──
  left: {
    width: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  btnPlaceholder: {
    width: 40,
    height: 40,
  },

  // ── Center ──
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    gap: 3,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0,
  },

  // ── Right ──
  right: {
    width: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
