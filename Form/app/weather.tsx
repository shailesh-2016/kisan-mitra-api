import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import {
  fetchCurrentWeather, fetchForecast,
  mapHourly, mapDaily,
  owmIconToIonicons, owmIconToColor,
  conditionToGradient, conditionToI18nKey,
  getFarmerInsight,
} from '../services/weatherApi';
import PageHeader from '../components/PageHeader';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CurrentWeather {
  temp: number; feelsLike: number; humidity: number;
  windSpeed: number; visibility: number; rainChance: number;
  condition: string; conditionKey: string; iconCode: string;
  cityName: string; updatedAt: string;
}
interface HourlyItem  { time: string; icon: string; temp: string; color: string; }
interface DailyItem   { dayKey: string; icon: string; color: string; min: string; max: string; rainPct: string; }
interface InsightItem { key: string; icon: string; color: string; bg: string; border: string; priority: string; }
interface AlertItem   { key: string; titleKey: string; descKey: string; icon: string; colors: string[]; severity: string; }

const DEFAULT_CITY = 'Ahmedabad';

// ── Alert severity badge ──────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const cfg: Record<string, { label: string; bg: string }> = {
    critical: { label: '🔴 Critical', bg: 'rgba(255,255,255,0.25)' },
    high:     { label: '🟠 High',     bg: 'rgba(255,255,255,0.2)'  },
    medium:   { label: '🟡 Medium',   bg: 'rgba(255,255,255,0.15)' },
  };
  const c = cfg[severity] || cfg.medium;
  return (
    <View style={[ab.badge, { backgroundColor: c.bg }]}>
      <Text style={ab.txt}>{c.label}</Text>
    </View>
  );
}
const ab = StyleSheet.create({
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  txt:   { fontSize: 9, color: '#FFF', fontWeight: '700' },
});

// ── Insight Card ──────────────────────────────────────────────────────────────
const PRIORITY_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  high:   { label: '🔴 High',   bg: '#FFEBEE', color: '#C62828' },
  medium: { label: '🟡 Medium', bg: '#FFF8E1', color: '#F57F17' },
  low:    { label: '🟢 Low',    bg: '#E8F5E9', color: '#2E7D32' },
};

function InsightCard({ ins, text, anim }: {
  ins: InsightItem; text: string; anim: Animated.Value;
}) {
  const badge = PRIORITY_BADGE[ins.priority] || PRIORITY_BADGE.low;
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0,1], outputRange: [14,0] }) }] }}>
      <View style={[ic.card, { backgroundColor: ins.bg, borderColor: ins.border }]}>
        {/* Left priority bar */}
        <View style={[ic.leftBar, { backgroundColor: ins.color }]} />
        {/* Icon circle */}
        <View style={[ic.iconWrap, { backgroundColor: ins.color + '22' }]}>
          <Ionicons name={ins.icon as any} size={20} color={ins.color} />
        </View>
        {/* Text */}
        <Text style={[ic.text, { color: '#1A1A2E' }]}>{text}</Text>
        {/* Priority badge */}
        <View style={[ic.badge, { backgroundColor: badge.bg }]}>
          <Text style={[ic.badgeTxt, { color: badge.color }]}>{badge.label}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
const ic = StyleSheet.create({
  card:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: SPACING.md, marginBottom: 10, borderRadius: 16, paddingVertical: 14, paddingRight: 12, paddingLeft: 0, borderWidth: 1.5, overflow: 'hidden' },
  leftBar:  { width: 4, alignSelf: 'stretch', borderTopLeftRadius: 16, borderBottomLeftRadius: 16, marginRight: 2 },
  iconWrap: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  text:     { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: '600', lineHeight: 20 },
  badge:    { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  badgeTxt: { fontSize: 9, fontWeight: '800' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function WeatherScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [current,  setCurrent]  = useState<CurrentWeather | null>(null);
  const [hourly,   setHourly]   = useState<HourlyItem[]>([]);
  const [daily,    setDaily]    = useState<DailyItem[]>([]);
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [alerts,   setAlerts]   = useState<AlertItem[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [gradient, setGradient] = useState<string[]>(['#0D47A1','#1565C0','#1976D2','#42A5F5']);

  // Staggered animation for insight cards
  const insightAnims = useRef([0,1,2,3].map(() => new Animated.Value(0))).current;

  const animateInsights = useCallback(() => {
    insightAnims.forEach(a => a.setValue(0));
    Animated.stagger(80, insightAnims.map(a =>
      Animated.spring(a, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 4 })
    )).start();
  }, [insightAnims]);

  // ── Fallback static data ──────────────────────────────────────────────────
  const useFallback = useCallback(() => {
    const fallbackData = {
      temp: 34, humidity: 62, windSpeed: 14, rainChance: 10, iconCode: '01d',
    };
    setCurrent({
      temp: 34, feelsLike: 37, humidity: 62, windSpeed: 14,
      visibility: 8, rainChance: 10, condition: 'Clear Sky',
      conditionKey: 'sunny', iconCode: '01d',
      cityName: 'Ahmedabad, IN',
      updatedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    });
    setGradient(['#0D47A1','#1565C0','#1976D2','#42A5F5']);
    setHourly([
      { time: 'Now',  icon: 'sunny',        temp: '34°', color: '#F9A825' },
      { time: '1 PM', icon: 'sunny',        temp: '35°', color: '#F9A825' },
      { time: '2 PM', icon: 'partly-sunny', temp: '35°', color: '#FB8C00' },
      { time: '3 PM', icon: 'cloud',        temp: '33°', color: '#78909C' },
      { time: '4 PM', icon: 'rainy',        temp: '30°', color: '#1565C0' },
      { time: '5 PM', icon: 'thunderstorm', temp: '28°', color: '#4527A0' },
      { time: '6 PM', icon: 'rainy',        temp: '27°', color: '#1565C0' },
      { time: '7 PM', icon: 'cloudy-night', temp: '26°', color: '#37474F' },
    ]);
    setDaily([
      { dayKey: 'days.mon', icon: 'sunny',        min: '26°', max: '36°', color: '#F9A825', rainPct: '5%'  },
      { dayKey: 'days.tue', icon: 'partly-sunny', min: '25°', max: '34°', color: '#FB8C00', rainPct: '20%' },
      { dayKey: 'days.wed', icon: 'rainy',        min: '23°', max: '30°', color: '#1565C0', rainPct: '80%' },
      { dayKey: 'days.thu', icon: 'thunderstorm', min: '22°', max: '28°', color: '#4527A0', rainPct: '90%' },
      { dayKey: 'days.fri', icon: 'cloud',        min: '24°', max: '31°', color: '#78909C', rainPct: '30%' },
      { dayKey: 'days.sat', icon: 'partly-sunny', min: '25°', max: '33°', color: '#FB8C00', rainPct: '15%' },
      { dayKey: 'days.sun', icon: 'sunny',        min: '27°', max: '37°', color: '#F9A825', rainPct: '5%'  },
    ]);
    const { insights: ins, alerts: alts } = getFarmerInsight(fallbackData);
    setInsights(ins);
    setAlerts(alts);
    setTimeout(animateInsights, 300);
  }, [animateInsights]);

  // ── Load live data ────────────────────────────────────────────────────────
  const loadWeather = useCallback(async () => {
    setLoading(true);
    try {
      const [cur, fore] = await Promise.all([
        fetchCurrentWeather(DEFAULT_CITY),
        fetchForecast(DEFAULT_CITY),
      ]);
      const iconCode   = cur.weather[0].icon;
      const windSpeed  = Math.round(cur.wind.speed * 3.6);
      const rainChance = Math.round((fore.list[0]?.pop || 0) * 100);

      setCurrent({
        temp:        Math.round(cur.main.temp),
        feelsLike:   Math.round(cur.main.feels_like),
        humidity:    cur.main.humidity,
        windSpeed,
        visibility:  Math.round((cur.visibility || 0) / 1000),
        rainChance,
        condition:   cur.weather[0].description,
        conditionKey: conditionToI18nKey(iconCode),
        iconCode,
        cityName:    `${cur.name}, ${cur.sys.country}`,
        updatedAt:   new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      });
      setGradient(conditionToGradient(iconCode));
      setHourly(mapHourly(fore.list));
      setDaily(mapDaily(fore.list));

      const { insights: ins, alerts: alts } = getFarmerInsight({
        temp: cur.main.temp,
        humidity: cur.main.humidity,
        windSpeed,
        rainChance,
        iconCode,
      });
      setInsights(ins);
      setAlerts(alts);
      setTimeout(animateInsights, 400);
    } catch (e: any) {
      console.error('[Weather] error:', e.message);
      useFallback();
    } finally {
      setLoading(false);
    }
  }, [useFallback, animateInsights]);

  useEffect(() => { loadWeather(); }, [loadWeather]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />
        <LinearGradient colors={['#0D47A1','#1565C0','#42A5F5']} style={s.loadingScreen}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={s.loadingTxt}>{t('weather.loading')}</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!current) return null;

  const heroIcon  = owmIconToIonicons(current.iconCode);
  const heroColor = owmIconToColor(current.iconCode);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />
      <PageHeader
        title={t('weather.title')}
        subtitle={current.cityName}
        onBack={() => router.back()}
        iconName="partly-sunny"
        iconColor="#1D4ED8"
        iconBg="#EFF6FF"
        rightElement={
          <TouchableOpacity style={s.refreshBtn} onPress={loadWeather} activeOpacity={0.8}>
            <Ionicons name="refresh" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} style={s.scroll}
        contentContainerStyle={s.scrollContent}>

        {/* ── Hero Card ── */}
        <LinearGradient colors={gradient as any}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroCard}>
          <View style={s.blob1} /><View style={s.blob2} />

          <View style={s.heroTop}>
            <View style={{ flex: 1 }}>
              <Text style={s.heroCondition}>{t(`weather.${current.conditionKey}`)}</Text>
              <Text style={s.heroDate}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Text>
            </View>
            <View style={s.heroIconWrap}>
              <Ionicons name={heroIcon as any} size={56} color={heroColor} />
            </View>
          </View>

          <Text style={s.heroTemp}>{current.temp}°<Text style={s.heroTempUnit}>C</Text></Text>
          <Text style={s.heroFeels}>{t('weather.feelsLike')} {current.feelsLike}°C</Text>

          <View style={s.heroStats}>
            {[
              { icon: 'water',  val: `${current.humidity}%`,       lbl: t('weather.humidity')   },
              { icon: 'leaf',   val: `${current.windSpeed} km/h`,  lbl: t('weather.wind')       },
              { icon: 'rainy',  val: `${current.rainChance}%`,     lbl: t('weather.rainChance') },
              { icon: 'eye',    val: `${current.visibility} km`,   lbl: t('weather.visibility') },
            ].map((stat, i, arr) => (
              <React.Fragment key={i}>
                <View style={s.heroStat}>
                  <Ionicons name={stat.icon as any} size={15} color="rgba(255,255,255,0.8)" />
                  <Text style={s.heroStatVal}>{stat.val}</Text>
                  <Text style={s.heroStatLbl}>{stat.lbl}</Text>
                </View>
                {i < arr.length - 1 && <View style={s.heroStatDiv} />}
              </React.Fragment>
            ))}
          </View>
          <Text style={s.heroUpdated}>🔄 {t('weather.updated')} · {current.updatedAt}</Text>
        </LinearGradient>

        {/* ── Hourly Forecast ── */}
        {hourly.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: '#1565C0' }]} />
              <Text style={[s.sectionTitle, { color: theme.text }]}>{t('weather.hourlyForecast')}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.hourlyContent}>
              {hourly.map((h, i) => (
                <View key={i} style={[s.hourlyCard, { backgroundColor: theme.surface, borderColor: theme.border }, i === 0 && s.hourlyCardActive]}>
                  <Text style={[s.hourlyTime, { color: theme.textSecondary }, i === 0 && { color: 'rgba(255,255,255,0.8)' }]}>{h.time}</Text>
                  <View style={[s.hourlyIconWrap, { backgroundColor: i === 0 ? 'rgba(255,255,255,0.2)' : h.color + '20' }]}>
                    <Ionicons name={h.icon as any} size={22} color={i === 0 ? '#FFF' : h.color} />
                  </View>
                  <Text style={[s.hourlyTemp, { color: theme.text }, i === 0 && { color: '#FFF' }]}>{h.temp}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── 7-Day Forecast ── */}
        {daily.length > 0 && (
          <>
            <View style={s.sectionHeader}>
              <View style={[s.sectionDot, { backgroundColor: COLORS.primary }]} />
              <Text style={[s.sectionTitle, { color: theme.text }]}>{t('weather.weekForecast')}</Text>
            </View>
            <View style={[s.weekCard, { backgroundColor: theme.surface }]}>
              {daily.map((w, i) => (
                <View key={i} style={[s.weekRow, i < daily.length - 1 && [s.weekRowBorder, { borderBottomColor: theme.borderLight }]]}>
                  <Text style={[s.weekDay, { color: theme.text }]}>{t(`weather.${w.dayKey}`)}</Text>
                  <View style={[s.weekIconWrap, { backgroundColor: w.color + '18' }]}>
                    <Ionicons name={w.icon as any} size={20} color={w.color} />
                  </View>
                  <View style={s.weekRain}>
                    <Ionicons name="rainy-outline" size={11} color="#1565C0" />
                    <Text style={s.weekRainText}>{w.rainPct}</Text>
                  </View>
                  <View style={s.weekTemps}>
                    <Text style={s.weekMin}>{w.min}</Text>
                    <View style={s.weekTempBar}>
                      <View style={[s.weekTempFill, { backgroundColor: w.color }]} />
                    </View>
                    <Text style={s.weekMax}>{w.max}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Farmer Insights ── */}
        <View style={s.sectionHeader}>
          <View style={[s.sectionDot, { backgroundColor: COLORS.secondary }]} />
          <Text style={[s.sectionTitle, { color: theme.text }]}>{t('weather.farmerInsight')}</Text>
          <View style={s.sectionBadge}>
            <Text style={s.sectionBadgeTxt}>{insights.length} tips</Text>
          </View>
        </View>
        {insights.length === 0 ? (
          <View style={[s.noAlertCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={s.noAlertIcon}>
              <Ionicons name="leaf" size={22} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.noAlertTitle}>{t('weather.insights.allNormal')}</Text>
            </View>
          </View>
        ) : (
          insights.map((ins, i) => (
            <InsightCard
              key={ins.key + i}
              ins={ins}
              text={t(`weather.insights.${ins.key}`, { defaultValue: ins.key })}
              anim={insightAnims[Math.min(i, insightAnims.length - 1)]}
            />
          ))
        )}

        {/* ── Alerts ── */}
        <View style={s.sectionHeader}>
          <View style={[s.sectionDot, { backgroundColor: COLORS.red }]} />
          <Text style={[s.sectionTitle, { color: theme.text }]}>{t('weather.alerts')}</Text>
          {alerts.length > 0 && (
            <View style={s.alertCountBadge}>
              <Text style={s.alertCountTxt}>{alerts.length}</Text>
            </View>
          )}
        </View>

        {alerts.length === 0 ? (
          <View style={[s.noAlertCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={s.noAlertIcon}>
              <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.noAlertTitle}>{t('weather.noAlerts')}</Text>
              <Text style={[s.noAlertSub, { color: theme.textSecondary }]}>{t(`weather.${current.conditionKey}`)}</Text>
            </View>
          </View>
        ) : (
          alerts.map((alert, i) => (
            <View key={alert.key} style={s.alertCard}>
              <LinearGradient colors={alert.colors as any}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.alertGrad}>
                <View style={s.alertIconWrap}>
                  <Ionicons name={alert.icon as any} size={24} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.alertTitleRow}>
                    <Text style={s.alertTitle}>{t(`weather.${alert.titleKey}`)}</Text>
                    <SeverityBadge severity={alert.severity} />
                  </View>
                  <Text style={s.alertDesc}>{t(`weather.${alert.descKey}`)}</Text>
                </View>
              </LinearGradient>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingTxt: { fontSize: FONT_SIZE.md, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  refreshBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F0FBF1', borderWidth: 1, borderColor: '#C8E6C9',
    alignItems: 'center', justifyContent: 'center',
  },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  // Hero
  heroCard: { margin: SPACING.md, borderRadius: 24, padding: SPACING.lg, overflow: 'hidden', ...SHADOW.lg },
  blob1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)', top: -70, right: -50 },
  blob2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: 20 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  heroCondition: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: '#FFF', letterSpacing: -0.2, textTransform: 'capitalize' },
  heroDate: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.7)', marginTop: 3 },
  heroIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  heroTemp: { fontSize: 72, fontWeight: '800', color: '#FFF', letterSpacing: -4, lineHeight: 80 },
  heroTempUnit: { fontSize: 32, fontWeight: '600', letterSpacing: 0 },
  heroFeels: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.7)', marginBottom: SPACING.lg },
  heroStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: RADIUS.md, paddingVertical: SPACING.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: SPACING.sm },
  heroStat: { flex: 1, alignItems: 'center', gap: 3 },
  heroStatDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 4 },
  heroStatVal: { fontSize: FONT_SIZE.sm, fontWeight: '800', color: '#FFF' },
  heroStatLbl: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '500', textAlign: 'center' },
  heroUpdated: { fontSize: 10, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginTop: 4 },

  // Section header
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: SPACING.md, marginTop: SPACING.lg, marginBottom: SPACING.sm },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '800', color: COLORS.text, letterSpacing: -0.2, flex: 1 },
  sectionBadge: { backgroundColor: COLORS.secondaryBg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  sectionBadgeTxt: { fontSize: 10, color: COLORS.secondary, fontWeight: '700' },
  alertCountBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.red, alignItems: 'center', justifyContent: 'center' },
  alertCountTxt: { fontSize: 10, color: '#FFF', fontWeight: '800' },

  // Hourly
  hourlyContent: { paddingHorizontal: SPACING.md, gap: SPACING.sm },
  hourlyCard: { alignItems: 'center', gap: 6, backgroundColor: '#FFF', borderRadius: RADIUS.md, paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm + 2, minWidth: 64, ...SHADOW.sm, borderWidth: 1.5, borderColor: COLORS.border },
  hourlyCardActive: { backgroundColor: '#0D47A1', borderColor: '#0D47A1' },
  hourlyTime: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.textSecondary },
  hourlyIconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  hourlyTemp: { fontSize: FONT_SIZE.md, fontWeight: '800', color: COLORS.text },

  // Weekly
  weekCard: { marginHorizontal: SPACING.md, backgroundColor: '#FFF', borderRadius: 18, overflow: 'hidden', ...SHADOW.md },
  weekRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm + 2, paddingHorizontal: SPACING.md, gap: SPACING.sm },
  weekRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  weekDay: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.text, width: 36 },
  weekIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  weekRain: { flexDirection: 'row', alignItems: 'center', gap: 2, width: 36 },
  weekRainText: { fontSize: 10, color: '#1565C0', fontWeight: '600' },
  weekTemps: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  weekMin: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: '600', width: 28, textAlign: 'right' },
  weekMax: { fontSize: FONT_SIZE.xs, color: COLORS.text, fontWeight: '800', width: 28 },
  weekTempBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: COLORS.lightGray, overflow: 'hidden' },
  weekTempFill: { height: '100%', width: '60%', borderRadius: 2 },

  // Alerts
  alertCard: { marginHorizontal: SPACING.md, marginBottom: 10, borderRadius: 18, overflow: 'hidden', ...SHADOW.md },
  alertGrad: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  alertIconWrap: { width: 48, height: 48, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  alertTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  alertTitle: { fontSize: FONT_SIZE.md, fontWeight: '800', color: '#FFF', letterSpacing: -0.2, flex: 1 },
  alertDesc: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.8)', lineHeight: 17 },

  // No alert
  noAlertCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: SPACING.md, backgroundColor: '#FFF', borderRadius: 16, padding: SPACING.md, borderWidth: 1.5, borderColor: '#C8E6C9', ...SHADOW.sm },
  noAlertIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  noAlertTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.primary },
  noAlertSub: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
});
