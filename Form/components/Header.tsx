import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import {
  fetchCurrentWeather,
  owmIconToIonicons,
  owmIconToColor,
  conditionToI18nKey,
} from '../services/weatherApi';

// ── Simple in-memory cache so we don't re-fetch on every render ───────────────
let _weatherCache: WeatherData | null = null;
let _cacheAt = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 min

interface WeatherData {
  temp: number;
  humidity: number;
  windSpeed: number;
  conditionKey: string;
  iconCode: string;
  cityName: string;
}

interface HeaderProps {
  name?: string;
  location?: string;
  unreadCount?: number;
}

export default function Header({
  name = '',
  location,
  unreadCount = 0,
}: HeaderProps) {
  const router = useRouter();
  const { t }  = useTranslation();
  const { theme } = useTheme();

  const [weather, setWeather] = useState<WeatherData | null>(_weatherCache);
  const [loading, setLoading] = useState(!_weatherCache);

  // Pulse animation for loading skeleton
  const pulse = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    if (!loading) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1,   duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [loading]);

  useEffect(() => {
    // Use cache if fresh
    if (_weatherCache && Date.now() - _cacheAt < CACHE_TTL) {
      setWeather(_weatherCache);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCurrentWeather('Ahmedabad');
        if (cancelled) return;
        const w: WeatherData = {
          temp:         Math.round(data.main.temp),
          humidity:     data.main.humidity,
          windSpeed:    Math.round(data.wind.speed * 3.6),
          conditionKey: conditionToI18nKey(data.weather[0].icon),
          iconCode:     data.weather[0].icon,
          cityName:     `${data.name}, ${data.sys.country}`,
        };
        _weatherCache = w;
        _cacheAt      = Date.now();
        setWeather(w);
      } catch {
        // silently fail — keep showing skeleton or stale data
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Derive icon name and color from live data
  const iconName  = weather ? owmIconToIonicons(weather.iconCode) : 'sunny';
  const iconColor = weather ? owmIconToColor(weather.iconCode)    : '#CA8A04';
  const iconBg    = weather?.iconCode.startsWith('01') ? '#FEF9C3'
                  : weather?.iconCode.startsWith('02') ? '#FEF3C7'
                  : weather?.iconCode.startsWith('09') || weather?.iconCode.startsWith('10') ? '#EFF6FF'
                  : weather?.iconCode.startsWith('11') ? '#EDE9FE'
                  : '#F0F9FF';

  const condLabel = weather
    ? t(`weather.${weather.conditionKey}`, { defaultValue: weather.conditionKey })
    : '—';

  return (
    <View style={[styles.container, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
      {/* ── Row 1: Logo+Greeting LEFT | Actions RIGHT ── */}
      <View style={styles.row1}>

        {/* Left: leaf icon + app name + greeting + location stacked */}
        <View style={styles.leftBlock}>
          {/* Brand line */}
          <View style={styles.brandRow}>
            <View style={styles.brandIcon}>
              <Ionicons name="leaf" size={13} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>KisanSathi</Text>
          </View>
          {/* Greeting */}
          <Text style={[styles.greeting, { color: theme.text }]}>{t('home.greeting', { name })}</Text>
          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={11} color={COLORS.primary} />
            <Text style={[styles.location, { color: theme.textSecondary }]}>
              {location ?? (weather?.cityName || t('home.location'))}
            </Text>
          </View>
        </View>

        {/* Right: actions + avatar */}
        <View style={styles.rightBlock}>
          <View style={styles.actions}>
            {/* Assistant pill */}
            <TouchableOpacity style={styles.assistantPill} activeOpacity={0.85}>
              <Ionicons name="sparkles" size={12} color={COLORS.primary} />
              <Text style={styles.assistantTxt}>AI</Text>
            </TouchableOpacity>

            {/* Notification */}
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
              onPress={() => router.push('/notifications')}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={19} color="#374151" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Avatar below actions */}
          <TouchableOpacity style={styles.avatar} activeOpacity={0.8}>
            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
            <View style={styles.onlineDot} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Row 2: Weather strip ── */}
      {loading ? (
        /* Skeleton while loading */
        <Animated.View style={[styles.weatherStrip, { backgroundColor: theme.inputBg, borderColor: theme.border }, { opacity: pulse }]}>
          <View style={styles.skeletonItem}>
            <View style={[styles.weatherIconWrap, styles.skeletonBox]} />
            <View style={styles.skeletonText}>
              <View style={styles.skeletonLine1} />
              <View style={styles.skeletonLine2} />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.skeletonItem}>
            <View style={[styles.weatherIconWrap, styles.skeletonBox]} />
            <View style={styles.skeletonText}>
              <View style={styles.skeletonLine1} />
              <View style={styles.skeletonLine2} />
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.skeletonItem}>
            <View style={[styles.weatherIconWrap, styles.skeletonBox]} />
            <View style={styles.skeletonText}>
              <View style={styles.skeletonLine1} />
              <View style={styles.skeletonLine2} />
            </View>
          </View>
        </Animated.View>
      ) : (
        <TouchableOpacity
          style={[styles.weatherStrip, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
          onPress={() => router.push('/weather' as any)}
          activeOpacity={0.88}
        >
          {/* Temperature */}
          <View style={styles.weatherItem}>
            <View style={[styles.weatherIconWrap, { backgroundColor: iconBg }]}>
              <Ionicons name={iconName as any} size={16} color={iconColor} />
            </View>
            <View>
              <Text style={[styles.weatherVal, { color: theme.text }]}>
                {weather ? `${weather.temp}°C` : '—'}
              </Text>
              <Text style={[styles.weatherLbl, { color: theme.textSecondary }]}>{condLabel}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Humidity */}
          <View style={styles.weatherItem}>
            <View style={[styles.weatherIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="water" size={14} color="#3B82F6" />
            </View>
            <View>
              <Text style={[styles.weatherVal, { color: theme.text }]}>
                {weather ? `${weather.humidity}%` : '—'}
              </Text>
              <Text style={[styles.weatherLbl, { color: theme.textSecondary }]}>{t('weather.humidity')}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Wind */}
          <View style={styles.weatherItem}>
            <View style={[styles.weatherIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="leaf" size={14} color="#16A34A" />
            </View>
            <View>
              <Text style={[styles.weatherVal, { color: theme.text }]}>
                {weather ? `${weather.windSpeed} km/h` : '—'}
              </Text>
              <Text style={[styles.weatherLbl, { color: theme.textSecondary }]}>{t('weather.wind')}</Text>
            </View>
          </View>

          {/* Tap indicator */}
          <Ionicons name="chevron-forward" size={14} color="#D1D5DB" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: SPACING.sm + 2,
    paddingBottom: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },

  // ── Row 1: left block + right block ──
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  // Left: brand + greeting + location
  leftBlock: {
    flex: 1,
    gap: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  brandIcon: {
    width: 22, height: 22, borderRadius: 7,
    backgroundColor: '#F0FBF1',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  appName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  location: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Right: actions + avatar
  rightBlock: {
    alignItems: 'flex-end',
    gap: 8,
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  assistantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FBF1',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  assistantTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 3, right: 3,
    minWidth: 14, height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5, borderColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 8, color: '#FFFFFF', fontWeight: '800',
  },
  avatar: {
    width: 38, height: 38,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#BBF7D0',
    position: 'relative',
  },
  avatarText: {
    fontSize: 15, fontWeight: '800', color: COLORS.primary,
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 9, height: 9, borderRadius: 5,
    backgroundColor: '#4ADE80',
    borderWidth: 2, borderColor: '#FFFFFF',
  },

  // Unused row2 kept for compat
  row2: {},

  // Row 3 — weather strip
  weatherStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  weatherIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  weatherLbl: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 4,
  },
  // Skeleton
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
  },
  skeletonBox: {
    backgroundColor: '#E5E7EB',
  },
  skeletonText: {
    gap: 5,
  },
  skeletonLine1: {
    width: 36,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
  },
  skeletonLine2: {
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
});
