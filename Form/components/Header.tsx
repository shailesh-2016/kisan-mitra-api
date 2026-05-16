import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Image, Platform, ScrollView } from 'react-native';
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
  const { theme, isDark, toggleTheme } = useTheme();

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
    <View style={[styles.container, { backgroundColor: theme.headerBg }]}>
      {/* ── Top Bar: Logo & Actions ── */}
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <Image
            source={require('../assets/images/logo/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>Kisan Plus</Text>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]} 
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={18} color={isDark ? "#F59E0B" : "#1A1A2E"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]} 
            onPress={() => router.push('/notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color="#374151" />
            {unreadCount > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileBtn} activeOpacity={0.7}>
            <View style={[styles.avatarWrap, { backgroundColor: theme.primaryBg }]}>
              <Text style={[styles.avatarText, { color: theme.primary }]}>{name.charAt(0).toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Welcome & Weather Summary ── */}
      <View style={styles.heroRow}>
        <View style={styles.welcomeBlock}>
          <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>{t('home.hello', { defaultValue: 'Hello,' })}</Text>
          <Text style={[styles.userName, { color: theme.text }]}>{name || t('home.farmer')}</Text>
          <View style={styles.locPill}>
            <Ionicons name="location" size={10} color={COLORS.primary} />
            <Text style={styles.locText} numberOfLines={1}>{location ?? (weather?.cityName || t('home.location'))}</Text>
          </View>
        </View>

        {/* Weather Card Mini */}
        {!loading && weather && (
          <TouchableOpacity 
            style={[styles.weatherCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push('/weather' as any)}
            activeOpacity={0.9}
          >
            <View style={[styles.weatherIconCirc, { backgroundColor: iconBg }]}>
              <Ionicons name={iconName as any} size={20} color={iconColor} />
            </View>
            <View>
              <Text style={[styles.heroTemp, { color: theme.text }]}>{weather.temp}°C</Text>
              <Text style={styles.heroCond} numberOfLines={1}>{condLabel}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.weatherDetailsRow}>
          {loading ? (
             <View style={styles.skeletonStrip}>
               <View style={[styles.skeletonPill, { backgroundColor: theme.inputBg }]} />
               <View style={[styles.skeletonPill, { backgroundColor: theme.inputBg }]} />
               <View style={[styles.skeletonPill, { backgroundColor: theme.inputBg }]} />
             </View>
          ) : (
            <>
              <View style={[styles.detailPill, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF', borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : '#BFDBFE' }]}>
                <Ionicons name="water" size={12} color="#3B82F6" />
                <Text style={[styles.detailText, { color: isDark ? '#93C5FD' : '#1E3A8A' }]} numberOfLines={1} adjustsFontSizeToFit>{weather?.humidity}%</Text>
              </View>
              <View style={[styles.detailPill, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#F0FDF4', borderColor: isDark ? 'rgba(34, 197, 94, 0.3)' : '#BBF7D0' }]}>
                <Ionicons name="leaf" size={12} color="#22C55E" />
                <Text style={[styles.detailText, { color: isDark ? '#86EFAC' : '#14532D' }]} numberOfLines={1} adjustsFontSizeToFit>{weather?.windSpeed} km/h</Text>
              </View>
              <View style={[styles.detailPill, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#FFFBEB', borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#FDE68A' }]}>
                <Ionicons name="sunny" size={12} color="#F59E0B" />
                <Text style={[styles.detailText, { color: isDark ? '#FCD34D' : '#78350F' }]} numberOfLines={1} adjustsFontSizeToFit>UV Low</Text>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 10 : 15,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 8,
    zIndex: 100,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8F5E9',
    backgroundColor: '#FFFFFF',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.6,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  profileBtn: {
    marginLeft: 2,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(27, 94, 32, 0.1)',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  welcomeBlock: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  locPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 94, 32, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
    maxWidth: 160,
  },
  locText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  weatherIconCirc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTemp: {
    fontSize: 18,
    fontWeight: '800',
  },
  heroCond: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'capitalize',
  },
  bottomRow: {
    marginTop: 4,
  },
  weatherDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailPill: {
    width: '31%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  detailText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0,
    flexShrink: 1,
  },
  skeletonStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  skeletonPill: {
    width: '31%',
    height: 34,
    borderRadius: 12,
    opacity: 0.6,
  },
});
