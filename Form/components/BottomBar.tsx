import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Platform, Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');
const BAR_H = 64;
const H_PAD = 16;
const TAB_W = (SCREEN_W - H_PAD * 2) / 5;

// Tab definitions — labels come from i18n keys
const TABS = [
  { name: 'index',    route: '/(tabs)',          iconOn: 'home',         iconOff: 'home-outline',        labelKey: 'tabs.home'    },
  { name: 'farmers',  route: '/(tabs)/farmers',  iconOn: 'people',       iconOff: 'people-outline',      labelKey: 'tabs.farmers' },
  { name: 'aidoctor', route: '/(tabs)/aidoctor', iconOn: 'medkit',       iconOff: 'medkit-outline',      labelKey: 'tabs.aiDoctor'},
  { name: 'bazaar',   route: '/(tabs)/bazaar',   iconOn: 'storefront',   iconOff: 'storefront-outline',  labelKey: 'tabs.bazaar'  },
  { name: 'profile',  route: '/(tabs)/profile',  iconOn: 'person',       iconOff: 'person-outline',      labelKey: 'tabs.profile' },
];

export default function BottomBar() {
  const router   = useRouter();
  const segments = useSegments();          // ['(tabs)', 'market'] etc.
  const insets   = useSafeAreaInsets();
  const { t }    = useTranslation();
  const { theme, isDark } = useTheme();

  // Derive active index from segments reliably
  const activeIndex = (() => {
    const seg = segments[segments.length - 1] ?? '';
    const idx = TABS.findIndex((tab) => tab.name === seg);
    return idx >= 0 ? idx : 0;
  })();

  // Animated pill position
  const slideAnim = useRef(new Animated.Value(activeIndex * TAB_W)).current;
  // Per-tab scale for bounce
  const scaleAnims = useRef(TABS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    // Slide pill
    Animated.spring(slideAnim, {
      toValue: activeIndex * TAB_W,
      useNativeDriver: true,
      damping: 20,
      stiffness: 220,
      mass: 0.7,
    }).start();

    // Bounce active icon
    Animated.sequence([
      Animated.timing(scaleAnims[activeIndex], {
        toValue: 0.82,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[activeIndex], {
        toValue: 1,
        useNativeDriver: true,
        damping: 8,
        stiffness: 280,
      }),
    ]).start();
  }, [activeIndex]);

  const bottomPad = insets.bottom > 0 ? insets.bottom : 12;

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: bottomPad, height: BAR_H + bottomPad + 8 },
      ]}
      pointerEvents="box-none"
    >
      <BlurView
        intensity={80}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.bar, { borderColor: theme.border }]}
      >
        {/* Frosted glass overlay — needed for Android where BlurView can appear transparent */}
        <View style={[
          styles.blurOverlay,
          { backgroundColor: isDark ? 'rgba(28, 31, 42, 0.82)' : 'rgba(255, 255, 255, 0.72)' }
        ]} />
        {/* ── Sliding pill indicator ── */}
        <Animated.View
          style={[
            styles.pill,
            { width: TAB_W, transform: [{ translateX: slideAnim }], backgroundColor: theme.primaryBg },
          ]}
        />

        {/* ── Tab items ── */}
        {TABS.map((tab, i) => {
          const focused = i === activeIndex;
          return (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tab, { width: TAB_W }]}
              onPress={() => router.push(tab.route as any)}
              activeOpacity={0.75}
            >
              <Animated.View style={{ transform: [{ scale: scaleAnims[i] }] }}>
                <Ionicons
                  name={(focused ? tab.iconOn : tab.iconOff) as any}
                  size={22}
                  color={focused ? COLORS.primary : '#9CA3AF'}
                />
              </Animated.View>
              <Text
                style={[styles.label, { color: focused ? COLORS.primary : theme.textSecondary }, focused && styles.labelActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: H_PAD,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 22,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    // Premium shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 18,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
  },
  // Sliding green highlight pill
  pill: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    borderRadius: 14,
    backgroundColor: '#EDF7EE',
    zIndex: 0,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    zIndex: 1,
    height: '100%',
    paddingVertical: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
