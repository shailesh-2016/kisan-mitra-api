import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Dimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_MARGIN = SPACING.md;
const CARD_GAP    = SPACING.sm;
const CARD_W      = SCREEN_W - CARD_MARGIN * 2;

// ── Premium slide definitions ─────────────────────────────────────────────────
// Each slide has a deep base gradient + a lighter accent gradient for the icon panel
const SLIDE_META = [
  {
    id: '1',
    tagKey:   'slider.s1Tag',
    titleKey: 'slider.s1Title',
    subKey:   'slider.s1Sub',
    btnKey:   'slider.s1Btn',
    icon:       'leaf'         as const,
    accentIcon: 'sunny'        as const,
    // Deep forest green — matches header
    grad:       ['#052E16', '#065F46', '#047857'] as [string, string, string],
    // Icon panel — slightly lighter
    panelGrad:  ['#065F46', '#059669'] as [string, string],
    tagColor:   '#FCD34D',
    tagBg:      'rgba(252,211,77,0.15)',
    tagBorder:  'rgba(252,211,77,0.3)',
    accentLine: '#4ADE80',
    dotColor:   '#4ADE80',
  },
  {
    id: '2',
    tagKey:   'slider.s2Tag',
    titleKey: 'slider.s2Title',
    subKey:   'slider.s2Sub',
    btnKey:   'slider.s2Btn',
    icon:       'trending-up'  as const,
    accentIcon: 'stats-chart'  as const,
    // Deep navy blue
    grad:       ['#0C1445', '#1E3A8A', '#1D4ED8'] as [string, string, string],
    panelGrad:  ['#1E3A8A', '#2563EB'] as [string, string],
    tagColor:   '#93C5FD',
    tagBg:      'rgba(147,197,253,0.15)',
    tagBorder:  'rgba(147,197,253,0.3)',
    accentLine: '#60A5FA',
    dotColor:   '#60A5FA',
  },
  {
    id: '3',
    tagKey:   'slider.s3Tag',
    titleKey: 'slider.s3Title',
    subKey:   'slider.s3Sub',
    btnKey:   'slider.s3Btn',
    icon:       'shield-checkmark' as const,
    accentIcon: 'document-text'    as const,
    // Deep amber/gold
    grad:       ['#451A03', '#92400E', '#B45309'] as [string, string, string],
    panelGrad:  ['#92400E', '#D97706'] as [string, string],
    tagColor:   '#FCD34D',
    tagBg:      'rgba(252,211,77,0.15)',
    tagBorder:  'rgba(252,211,77,0.3)',
    accentLine: '#FCD34D',
    dotColor:   '#FCD34D',
  },
  {
    id: '4',
    tagKey:   'slider.s4Tag',
    titleKey: 'slider.s4Title',
    subKey:   'slider.s4Sub',
    btnKey:   'slider.s4Btn',
    icon:       'medkit' as const,
    accentIcon: 'scan'   as const,
    // Deep crimson
    grad:       ['#450A0A', '#991B1B', '#DC2626'] as [string, string, string],
    panelGrad:  ['#991B1B', '#EF4444'] as [string, string],
    tagColor:   '#FCA5A5',
    tagBg:      'rgba(252,165,165,0.15)',
    tagBorder:  'rgba(252,165,165,0.3)',
    accentLine: '#FCA5A5',
    dotColor:   '#FCA5A5',
  },
];

export default function KisanSlider() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const scrollRef  = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Dot animations
  const dotAnims = useRef(SLIDE_META.map(() => new Animated.Value(0))).current;
  // Card entrance animation
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    dotAnims.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === activeIndex ? 1 : 0,
        useNativeDriver: false,
        speed: 24,
        bounciness: 4,
      }).start();
    });
    // Subtle entrance on slide change
    cardAnim.setValue(0);
    Animated.timing(cardAnim, {
      toValue: 1, duration: 300, useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeIndex + 1) % SLIDE_META.length;
      scrollRef.current?.scrollTo({ x: next * (CARD_W + CARD_GAP), animated: true });
      setActiveIndex(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeIndex]);

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_W + CARD_GAP));
    if (idx >= 0 && idx < SLIDE_META.length && idx !== activeIndex) setActiveIndex(idx);
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={CARD_W + CARD_GAP}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {SLIDE_META.map((slide, idx) => (
          <LinearGradient
            key={slide.id}
            colors={slide.grad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* ── Decorative geometry ── */}
            {/* Large circle top-right */}
            <View style={styles.geoCircle1} />
            {/* Small circle bottom-left */}
            <View style={styles.geoCircle2} />
            {/* Diagonal accent line */}
            <View style={[styles.accentLine, { backgroundColor: slide.accentLine }]} />

            {/* ── Left: content ── */}
            <View style={styles.content}>
              {/* Tag pill */}
              <View style={[styles.tagPill, {
                backgroundColor: slide.tagBg,
                borderColor: slide.tagBorder,
              }]}>
                <View style={[styles.tagDot, { backgroundColor: slide.tagColor }]} />
                <Text style={[styles.tagText, { color: slide.tagColor }]}>
                  {t(slide.tagKey)}
                </Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>{t(slide.titleKey)}</Text>

              {/* Subtitle */}
              <Text style={styles.subtitle} numberOfLines={2}>
                {t(slide.subKey)}
              </Text>

              {/* CTA */}
              <TouchableOpacity style={styles.cta} activeOpacity={0.82}>
                <Text style={styles.ctaText}>{t(slide.btnKey)}</Text>
                <View style={styles.ctaArrow}>
                  <Ionicons name="arrow-forward" size={10} color="#FFF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* ── Right: icon panel ── */}
            <View style={styles.iconPanel}>
              <LinearGradient
                colors={slide.panelGrad}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconPanelGrad}
              >
                {/* Faded accent icon behind */}
                <View style={styles.accentIconWrap}>
                  <Ionicons name={slide.accentIcon} size={80} color="rgba(255,255,255,0.08)" />
                </View>
                {/* Main icon */}
                <View style={styles.iconCircle}>
                  <Ionicons name={slide.icon} size={32} color="#FFFFFF" />
                </View>
              </LinearGradient>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>

      {/* ── Dot indicators ── */}
      <View style={styles.dotsRow}>
        {SLIDE_META.map((slide, i) => {
          const w  = dotAnims[i].interpolate({ inputRange: [0, 1], outputRange: [5, 22] });
          const op = dotAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.3, 1]  });
          return (
            <TouchableOpacity
              key={slide.id}
              hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
              onPress={() => {
                scrollRef.current?.scrollTo({ x: i * (CARD_W + CARD_GAP), animated: true });
                setActiveIndex(i);
              }}
            >
              <Animated.View
                style={[
                  styles.dot,
                  {
                    width: w,
                    opacity: op,
                    backgroundColor: i === activeIndex
                      ? SLIDE_META[activeIndex].dotColor
                      : theme.border,
                  },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  scrollContent: {
    paddingHorizontal: CARD_MARGIN,
  },

  // ── Card ──
  card: {
    width: CARD_W,
    height: 178,
    borderRadius: 26,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'stretch',
    marginRight: CARD_GAP,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },

  // ── Decorative geometry ──
  geoCircle1: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -70, right: -50,
  },
  geoCircle2: {
    position: 'absolute',
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    bottom: -20, left: 20,
  },
  accentLine: {
    position: 'absolute',
    width: 3, height: '140%',
    top: -20,
    left: '62%',
    opacity: 0.15,
    transform: [{ rotate: '15deg' }],
  },

  // ── Left content ──
  content: {
    flex: 1,
    paddingLeft: 22,
    paddingVertical: 20,
    paddingRight: 8,
    justifyContent: 'center',
    gap: 6,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 2,
  },
  tagDot: {
    width: 5, height: 5, borderRadius: 3,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 16,
    maxWidth: '95%',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  ctaText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  ctaArrow: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Right icon panel ──
  iconPanel: {
    width: 110,
    alignSelf: 'stretch',
  },
  iconPanelGrad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  accentIconWrap: {
    position: 'absolute',
    bottom: -10, right: -10,
  },
  iconCircle: {
    width: 68, height: 68,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Dots ──
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
});
