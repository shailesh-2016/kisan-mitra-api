import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput,
  TouchableOpacity, StatusBar, ActivityIndicator,
  RefreshControl, Animated, Platform, KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../../constants/theme';
import FloatingMicButton from '../../components/FloatingMicButton';
import MandiLoader from '../../components/MandiLoader';
import {
  fetchStates, fetchNearbyWithDistance, fetchByState, fetchByDistrict,
  groupByMarket, getDistricts,
  reverseGeocode, FALLBACK_STATES,
} from '../../services/mandiApi';
import {
  translateCrop, translateLabel, LANG_OPTIONS, type Lang,
} from '../../services/mandiTranslations';
import i18n from '../../i18n';
import { useTheme } from '../../context/ThemeContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface MandiRecord {
  commodity: string; variety: string; market: string;
  district: string; state: string;
  minPrice: number; maxPrice: number; modalPrice: number; pricePerKg: number;
  arrivalDate: string; emoji: string; category: string;
}
interface MarketGroup {
  market: string; district: string; state: string;
  prices: MandiRecord[];
  distanceKm: number | null;
  distanceLabel: string | null;
}

// ── Bottom-sheet Dropdown ─────────────────────────────────────────────────────
function DropdownSheet({ title, items, selected, onSelect, onClose }: {
  title: string; items: string[]; selected: string;
  onSelect: (v: string) => void; onClose: () => void;
}) {
  const { theme } = useTheme();
  const [q, setQ] = useState('');
  const inputRef = useRef<TextInput>(null);
  const list = q.length > 0
    ? items.filter(i => i.toLowerCase().includes(q.toLowerCase()))
    : items;
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0, useNativeDriver: true,
      damping: 22, stiffness: 180, mass: 0.8,
    }).start(() => {
      // Auto-focus search after animation
      setTimeout(() => inputRef.current?.focus(), 100);
    });
  }, []);

  const close = () => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, {
      toValue: 600, duration: 220, useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <View style={ds.overlay}>
      <TouchableOpacity style={ds.backdrop} onPress={close} activeOpacity={1} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={ds.kavWrapper}
      >
        <Animated.View style={[ds.sheet, { backgroundColor: theme.surface, transform: [{ translateY: slideAnim }] }]}>
          {/* Drag handle */}
          <View style={ds.handleWrap}>
            <View style={[ds.handle, { backgroundColor: theme.border }]} />
          </View>

          {/* Header */}
          <View style={ds.titleRow}>
            <View style={ds.titleLeft}>
              <Ionicons
                name={title.toLowerCase().includes('state') ? 'map-outline' : 'business-outline'}
                size={20} color={theme.primary}
              />
              <Text style={[ds.title, { color: theme.text }]}>{title}</Text>
            </View>
            <TouchableOpacity onPress={close} style={[ds.closeBtn, { backgroundColor: theme.inputBg }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View style={[ds.searchRow, { backgroundColor: theme.inputBg, borderColor: selected ? theme.primary : theme.border }]}>
            <Ionicons name="search-outline" size={16} color={theme.primary} />
            <TextInput
              ref={inputRef}
              style={[ds.searchInput, { color: theme.text }]}
              placeholder={`Search ${title.toLowerCase()}...`}
              value={q}
              onChangeText={setQ}
              placeholderTextColor={theme.textMuted}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {q.length > 0 && Platform.OS === 'android' && (
              <TouchableOpacity onPress={() => setQ('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Count badge */}
          <View style={ds.countRow}>
            <Text style={[ds.countTxt, { color: theme.textMuted }]}>
              {list.length} {list.length === 1 ? 'result' : 'results'}
            </Text>
            {selected ? (
              <View style={[ds.selectedBadge, { backgroundColor: theme.primaryBg }]}>
                <Ionicons name="checkmark-circle" size={12} color={theme.primary} />
                <Text style={[ds.selectedBadgeTxt, { color: theme.primary }]}>{selected}</Text>
              </View>
            ) : null}
          </View>

          {/* List */}
          <ScrollView
            style={ds.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {list.map(item => {
              const isSelected = item === selected;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    ds.item,
                    { borderBottomColor: theme.borderLight },
                    isSelected && { backgroundColor: theme.primaryBg },
                  ]}
                  onPress={() => { onSelect(item); close(); }}
                  activeOpacity={0.65}
                >
                  <View style={ds.itemLeft}>
                    <View style={[ds.itemDot, { backgroundColor: isSelected ? theme.primary : theme.border }]} />
                    <Text style={[
                      ds.itemTxt,
                      { color: theme.text },
                      isSelected && { color: theme.primary, fontWeight: '700' },
                    ]}>
                      {item}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={[ds.checkCircle, { backgroundColor: theme.primary }]}>
                      <Ionicons name="checkmark" size={13} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
            {list.length === 0 && (
              <View style={ds.noResultWrap}>
                <Ionicons name="search-outline" size={40} color={theme.border} />
                <Text style={[ds.noResult, { color: theme.text }]}>No results for "{q}"</Text>
                <Text style={[ds.noResultSub, { color: theme.textMuted }]}>Try a different spelling</Text>
              </View>
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
const ds = StyleSheet.create({
  overlay:      { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 },
  backdrop:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  kavWrapper:   { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet:        {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingHorizontal: 20, paddingBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 20, elevation: 20,
  },
  handleWrap:   { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB' },
  titleRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  titleLeft:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title:        { fontSize: 18, fontWeight: '800', color: '#111827', letterSpacing: -0.3 },
  closeBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  searchRow:    {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F9FAFB', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 13,
    marginBottom: 8, borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  searchInput:  { flex: 1, fontSize: 15, color: '#111827', padding: 0 },
  countRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, paddingHorizontal: 2 },
  countTxt:     { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  selectedBadge:{ flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  selectedBadgeTxt: { fontSize: 11, fontWeight: '700' },
  list:         { maxHeight: 480 },
  item:         {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 16, paddingHorizontal: 4,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
    minHeight: 52,
  },
  itemLeft:     { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  itemDot:      { width: 8, height: 8, borderRadius: 4 },
  itemTxt:      { fontSize: 15, color: '#374151', fontWeight: '500', flex: 1 },
  checkCircle:  { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  noResultWrap: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  noResult:     { fontSize: 15, color: '#374151', fontWeight: '600' },
  noResultSub:  { fontSize: 13, color: '#9CA3AF' },
});

// ── Mandi Card ────────────────────────────────────────────────────────────────
function MandiCard({ group, lang, onPress }: {
  group: MarketGroup; lang: Lang; onPress: () => void;
}) {
  const { theme } = useTheme();
  const preview  = group.prices.slice(0, 3);
  const topPrice = [...group.prices].sort((a, b) => b.modalPrice - a.modalPrice)[0];
  const isClose  = group.distanceKm != null && group.distanceKm < 30;
  const tl       = (s: string) => translateLabel(s, lang);

  return (
    <TouchableOpacity
      style={[mdc.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress} activeOpacity={0.88}
    >
      {/* Top row */}
      <View style={mdc.top}>
        <View style={[mdc.iconBox, isClose && mdc.iconBoxClose]}>
          <Ionicons name="storefront" size={20} color={isClose ? '#fff' : theme.primary} />
        </View>
        <View style={mdc.info}>
          <Text style={[mdc.name, { color: theme.text }]} numberOfLines={1}>{group.market}</Text>
          <View style={mdc.locRow}>
            <Ionicons name="location-outline" size={11} color={theme.textMuted} />
            <Text style={[mdc.loc, { color: theme.textMuted }]} numberOfLines={1}>
              {group.district}{group.state ? `, ${group.state}` : ''}
            </Text>
          </View>
        </View>
        <View style={mdc.right}>
          {group.distanceLabel ? (
            <View style={[mdc.distBadge, { backgroundColor: theme.primaryBg, borderColor: theme.primary + '40' }, isClose && mdc.distBadgeClose]}>
              <Ionicons name="navigate" size={9} color={isClose ? '#fff' : theme.primary} />
              <Text style={[mdc.distTxt, { color: theme.primary }, isClose && { color: '#fff' }]}>
                {group.distanceLabel}
              </Text>
            </View>
          ) : (
            <View style={[mdc.countBadge, { backgroundColor: theme.primaryBg, borderColor: theme.primary + '40' }]}>
              <Text style={[mdc.countTxt, { color: theme.primary }]}>{group.prices.length} crops</Text>
            </View>
          )}
          {group.distanceLabel && (
            <Text style={[mdc.cropCount, { color: theme.textMuted }]}>{group.prices.length} crops</Text>
          )}
        </View>
      </View>

      {/* Crop chips */}
      {preview.length > 0 && (
        <View style={mdc.chips}>
          {preview.map((p, i) => (
            <View key={i} style={[mdc.chip, { backgroundColor: theme.inputBg, borderColor: theme.borderLight }]}>
              <Text style={mdc.chipEmoji}>{p.emoji}</Text>
              <View style={mdc.chipText}>
                <Text style={[mdc.chipName, { color: theme.text }]} numberOfLines={1}>
                  {translateCrop(p.commodity, lang)}
                </Text>
                <Text style={[mdc.chipPrice, { color: theme.primary }]}>₹{p.pricePerKg}/kg</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      {topPrice && (
        <View style={[mdc.footer, { borderTopColor: theme.borderLight }]}>
          <Text style={[mdc.footerTxt, { color: theme.textSecondary }]} numberOfLines={1}>
            🏆 {tl('Best')}: {topPrice.emoji} {translateCrop(topPrice.commodity, lang)} — ₹{topPrice.modalPrice.toLocaleString('en-IN')}/qtl
          </Text>
          <View style={[mdc.arrowBtn, { backgroundColor: theme.primaryBg }]}>
            <Ionicons name="chevron-forward" size={13} color={theme.primary} />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
const mdc = StyleSheet.create({
  card:          { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3, borderWidth: 1, borderColor: '#F0F0F0' },
  top:           { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  iconBox:       { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F0FBF1', alignItems: 'center', justifyContent: 'center' },
  iconBoxClose:  { backgroundColor: COLORS.primary },
  info:          { flex: 1 },
  name:          { fontSize: 15, fontWeight: '800', color: '#111827', letterSpacing: -0.2 },
  locRow:        { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 },
  loc:           { fontSize: 11, color: '#9CA3AF', fontWeight: '500', flex: 1 },
  right:         { alignItems: 'flex-end', gap: 4 },
  countBadge:    { backgroundColor: '#F0FBF1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#C8E6C9' },
  countTxt:      { fontSize: 10, color: COLORS.primary, fontWeight: '700' },
  distBadge:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FBF1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#C8E6C9' },
  distBadgeClose:{ backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  distTxt:       { fontSize: 10, color: COLORS.primary, fontWeight: '700' },
  cropCount:     { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  chips:         { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip:          { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  chipEmoji:     { fontSize: 16 },
  chipText:      { flex: 1 },
  chipName:      { fontSize: 11, color: '#374151', fontWeight: '600' },
  chipPrice:     { fontSize: 11, color: COLORS.primary, fontWeight: '800', marginTop: 1 },
  footer:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
  footerTxt:     { fontSize: 11, color: '#6B7280', fontWeight: '500', flex: 1 },
  arrowBtn:      { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F0FBF1', alignItems: 'center', justifyContent: 'center' },
});

// ── Skeleton Card (while filtering) ──────────────────────────────────────────
function SkeletonCard() {
  const { theme } = useTheme();
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, []);
  return (
    <Animated.View style={[sk.card, { opacity: anim, backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={sk.top}>
        <View style={[sk.icon, { backgroundColor: theme.border }]} />
        <View style={sk.info}>
          <View style={[sk.line1, { backgroundColor: theme.border }]} />
          <View style={[sk.line2, { backgroundColor: theme.borderLight }]} />
        </View>
        <View style={[sk.badge, { backgroundColor: theme.border }]} />
      </View>
      <View style={sk.chips}>
        <View style={[sk.chip, { backgroundColor: theme.inputBg }]} />
        <View style={[sk.chip, { backgroundColor: theme.inputBg }]} />
        <View style={[sk.chip, { backgroundColor: theme.inputBg }]} />
      </View>
    </Animated.View>
  );
}
const sk = StyleSheet.create({
  card:  { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  top:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  icon:  { width: 44, height: 44, borderRadius: 14, backgroundColor: '#E5E7EB' },
  info:  { flex: 1, gap: 8 },
  line1: { height: 14, borderRadius: 7, backgroundColor: '#E5E7EB', width: '70%' },
  line2: { height: 10, borderRadius: 5, backgroundColor: '#F3F4F6', width: '45%' },
  badge: { width: 60, height: 24, borderRadius: 12, backgroundColor: '#E5E7EB' },
  chips: { flexDirection: 'row', gap: 8 },
  chip:  { flex: 1, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MarketScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [selectedState,    setSelectedState]    = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [states,           setStates]           = useState<string[]>([]);
  const [districts,        setDistricts]        = useState<string[]>([]);
  const [mandiData,        setMandiData]        = useState<MandiRecord[]>([]);
  const [nearbyGroups,     setNearbyGroups]     = useState<MarketGroup[]>([]);
  const [nearbyInfo,       setNearbyInfo]       = useState({ district: '', state: '' });
  const [nearbyRadius,     setNearbyRadius]     = useState(150);
  const [userCoords,       setUserCoords]       = useState<{ lat: number; lng: number } | null>(null);
  const [loading,          setLoading]          = useState(false);   // filter loading
  const [nearbyLoading,    setNearbyLoading]    = useState(true);    // initial GPS load
  const [refreshing,       setRefreshing]       = useState(false);
  const [search,           setSearch]           = useState('');
  const [openDropdown,     setOpenDropdown]     = useState<'state' | 'district' | null>(null);
  const [dataSource,       setDataSource]       = useState('');
  const [locationDenied,   setLocationDenied]   = useState(false);
  const [lang,             setLang]             = useState<Lang>((i18n.language as Lang) || 'gu');

  const tl = useCallback((s: string) => translateLabel(s, lang), [lang]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fadeIn   = useCallback(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
  }, [fadeAnim]);

  useEffect(() => { loadStates(); loadNearby(); }, []);

  async function loadNearby() {
    setNearbyLoading(true);
    try {
      let userLat = 23.0225, userLng = 72.5714;
      let district = 'Ahmedabad', state = 'Gujarat';

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          userLat = loc.coords.latitude; userLng = loc.coords.longitude;
          const geo = await reverseGeocode(userLat, userLng);
          if (geo.state)    state    = geo.state;
          if (geo.district) district = geo.district;
        } catch {}
      } else { setLocationDenied(true); }

      const knownStates  = await fetchStates().then(r => r.data).catch(() => FALLBACK_STATES);
      const sLower       = state.toLowerCase();
      const matchedState = knownStates.find((s: string) =>
        s.toLowerCase() === sLower || s.toLowerCase().includes(sLower) || sLower.includes(s.toLowerCase())
      ) || 'Gujarat';

      // Pass user's district so nearby function prioritizes it
      const result = await fetchNearbyWithDistance(userLat, userLng, matchedState, district);
      const groups = (result.groups || []) as MarketGroup[];

      // Match district name to API district names
      let matchedDistrict = district;
      if (district && groups.length > 0) {
        const apiDistricts = [...new Set(groups.map((g: MarketGroup) => g.district).filter(Boolean))];
        const dLower = district.toLowerCase();
        matchedDistrict = (apiDistricts as string[]).find(d => d.toLowerCase() === dLower)
          || (apiDistricts as string[]).find(d => d.toLowerCase().includes(dLower) || dLower.includes(d.toLowerCase()))
          || district;
      }

      setNearbyInfo({ district: matchedDistrict, state: matchedState });
      setNearbyGroups(groups);
      setDataSource(result.source || '');
      fadeIn();
    } catch (err) {
      console.warn('[Market] loadNearby error:', err);
      setNearbyGroups([]);
      setNearbyInfo({ district: 'Gujarat', state: 'Gujarat' });
    } finally { setNearbyLoading(false); }
  }

  async function loadStates() {
    try { const res = await fetchStates(); setStates(res.data || FALLBACK_STATES); }
    catch { setStates(FALLBACK_STATES); }
  }

  const onStateSelect = useCallback(async (state: string) => {
    setSelectedState(state); setSelectedDistrict(''); setMandiData([]); setDistricts([]);
    setLoading(true);
    // Small delay so skeleton renders before cached data arrives instantly
    await new Promise(r => setTimeout(r, 80));
    try {
      const res = await fetchByState(state);
      setMandiData(res.data || []); setDataSource(res.source || '');
      setDistricts(getDistricts(res.data || [])); fadeIn();
    } finally { setLoading(false); }
  }, [fadeIn]);

  const onDistrictSelect = useCallback(async (district: string) => {
    setSelectedDistrict(district); setMandiData([]);
    setLoading(true);
    // Small delay so skeleton renders before cached data arrives instantly
    await new Promise(r => setTimeout(r, 80));
    try {
      const res = await fetchByDistrict(selectedState, district);
      setMandiData(res.data || []); setDataSource(res.source || ''); fadeIn();
    } finally { setLoading(false); }
  }, [selectedState, fadeIn]);

  const clearFilters = useCallback(() => {
    setSelectedState(''); setSelectedDistrict(''); setMandiData([]); setDistricts([]); setSearch('');
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (selectedDistrict && selectedState) {
        const res = await fetchByDistrict(selectedState, selectedDistrict);
        setMandiData(res.data || []); setDataSource(res.source || ''); fadeIn();
      } else if (selectedState) {
        const res = await fetchByState(selectedState);
        setMandiData(res.data || []); setDataSource(res.source || '');
        setDistricts(getDistricts(res.data || [])); fadeIn();
      } else {
        await loadNearby();
      }
    } finally {
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedState, selectedDistrict, fadeIn]);

  const openMandi = useCallback((group: MarketGroup) => {
    router.push({ pathname: '/mandi/[id]', params: { id: group.market, district: group.district, state: group.state } });
  }, [router]);

  // ── Derived display data ──────────────────────────────────────────────────
  const hasFilters   = !!(selectedState || selectedDistrict);
  const filterGroups = hasFilters ? (groupByMarket(mandiData, selectedDistrict) as MarketGroup[]) : [];
  const activeGroups = hasFilters ? filterGroups : nearbyGroups;

  const filteredGroups = activeGroups.filter(mg =>
    !search ||
    mg.market.toLowerCase().includes(search.toLowerCase()) ||
    mg.district.toLowerCase().includes(search.toLowerCase()) ||
    mg.prices.some(p => p.commodity.toLowerCase().includes(search.toLowerCase()))
  );

  const locationLabel = selectedDistrict
    ? `${selectedDistrict}, ${selectedState}`
    : selectedState || (nearbyInfo.district
      ? `${nearbyInfo.district}, ${nearbyInfo.state}`
      : 'Detecting...');

  // Show full-screen loader only on first GPS load
  if (nearbyLoading) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />
        <MandiLoader
          message="📍 Finding nearby mandis..."
          subMessage="Calculating distances from your location"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      {/* ── Header ── */}
      <View style={[s.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
        <View style={s.headerTop}>
          <View style={s.headerLeft}>
            <View style={[s.headerIconBox, { backgroundColor: theme.primaryBg, borderColor: theme.primary + '40' }]}>
              <Ionicons name="storefront" size={20} color={theme.primary} />
            </View>
            <View>
              <Text style={[s.headerTitle, { color: theme.text }]}>{t('market.title')}</Text>
              <View style={s.locRow}>
                <Ionicons name="location-sharp" size={11} color={theme.primary} />
                <Text style={[s.locTxt, { color: theme.textSecondary }]} numberOfLines={1}>{locationLabel}</Text>
              </View>
            </View>
          </View>
          <View style={s.headerRight}>
            {/* Live/Cached badge */}
            <View style={[s.sourceBadge, { backgroundColor: dataSource === 'live' ? theme.primaryBg : theme.secondaryBg }]}>
              <View style={[s.sourceDot, { backgroundColor: dataSource === 'live' ? '#22C55E' : '#F59E0B' }]} />
              <Text style={[s.sourceTxt, { color: dataSource === 'live' ? theme.primary : '#D97706' }]}>
                {dataSource === 'live' ? 'Live' : 'Cached'}
              </Text>
            </View>
            {/* Language toggle */}
            <View style={s.langRow}>
              {LANG_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.code}
                  style={[s.langBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }, lang === opt.code && s.langBtnActive]}
                  onPress={() => setLang(opt.code)} activeOpacity={0.8}>
                  <Text style={[s.langTxt, { color: theme.textSecondary }, lang === opt.code && s.langTxtActive]}>
                    {opt.native}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* ── Search bar ── */}
        <View style={[s.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={16} color={theme.textMuted} />
          <TextInput
            style={[s.searchInput, { color: theme.text }]}
            placeholder={tl('Search mandi or crop...')}
            value={search} onChangeText={setSearch}
            placeholderTextColor={theme.textMuted} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Filter row ── */}
        <View style={s.filterRow}>
          {/* State selector */}
          <TouchableOpacity
            style={[s.filterChip, { backgroundColor: selectedState ? theme.primary : theme.primaryBg, borderColor: theme.primary }]}
            onPress={() => setOpenDropdown('state')}
            activeOpacity={0.75}
          >
            <Ionicons name="map-outline" size={14} color={selectedState ? '#fff' : theme.primary} />
            <Text style={[s.filterChipTxt, { color: selectedState ? '#fff' : theme.primary }]} numberOfLines={1}>
              {selectedState || tl('State')}
            </Text>
            <Ionicons name={openDropdown === 'state' ? 'chevron-up' : 'chevron-down'} size={13}
              color={selectedState ? 'rgba(255,255,255,0.8)' : theme.primary} />
          </TouchableOpacity>

          {/* District selector — show even without state for better UX */}
          <TouchableOpacity
            style={[
              s.filterChip,
              { backgroundColor: selectedDistrict ? theme.primary : theme.primaryBg, borderColor: theme.primary },
              !selectedState && { opacity: 0.5 },
            ]}
            onPress={() => {
              if (!selectedState) return;
              if (districts.length > 0) setOpenDropdown('district');
            }}
            activeOpacity={0.75}
            disabled={!selectedState}
          >
            {loading && selectedState && !selectedDistrict
              ? <ActivityIndicator size={13} color={selectedDistrict ? '#fff' : theme.primary} />
              : <Ionicons name="business-outline" size={14} color={selectedDistrict ? '#fff' : theme.primary} />
            }
            <Text style={[s.filterChipTxt, { color: selectedDistrict ? '#fff' : theme.primary }]} numberOfLines={1}>
              {selectedDistrict || tl('District')}
            </Text>
            <Ionicons name={openDropdown === 'district' ? 'chevron-up' : 'chevron-down'} size={13}
              color={selectedDistrict ? 'rgba(255,255,255,0.8)' : theme.primary} />
          </TouchableOpacity>

          {/* Clear button */}
          {hasFilters && (
            <TouchableOpacity style={s.clearChip} onPress={clearFilters} activeOpacity={0.75}>
              <Ionicons name="close-circle" size={15} color="#EF4444" />
              <Text style={s.clearChipTxt}>Clear</Text>
            </TouchableOpacity>
          )}

          {/* Count badge */}
          <View style={[s.countBadge, { backgroundColor: theme.inputBg }]}>
            <Text style={[s.countBadgeTxt, { color: theme.text }]}>{filteredGroups.length}</Text>
          </View>
        </View>
      </View>

      {/* ── Content ── */}
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
          }>

          {/* Info banner */}
          <View style={[s.infoBanner, { backgroundColor: theme.primaryBg, borderColor: theme.primary + '40' }]}>
            <Ionicons name={hasFilters ? 'filter' : 'navigate-circle'}
              size={16} color={theme.primary} />
            <Text style={[s.infoBannerTxt, { color: theme.primary }]}>
              {loading
                ? `Loading ${selectedDistrict || selectedState || 'mandis'}...`
                : `${filteredGroups.length} mandis${hasFilters ? ` in ${selectedDistrict || selectedState}` : ` near ${nearbyInfo.district}`}`}
              {!loading && ` · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
            </Text>
            {loading && <ActivityIndicator size={12} color={theme.primary} style={{ marginLeft: 4 }} />}
          </View>

          {/* Skeleton while filter loading */}
          {loading ? (
            <>
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </>
          ) : filteredGroups.length === 0 ? (
            <View style={s.empty}>
              <View style={[s.emptyIcon, { backgroundColor: theme.inputBg }]}>
                <Ionicons name="storefront-outline" size={36} color={theme.textMuted} />
              </View>
              <Text style={[s.emptyTitle, { color: theme.text }]}>No mandis found</Text>
              <Text style={[s.emptySub, { color: theme.textSecondary }]}>
                {hasFilters ? 'Try a different state or district' : 'Check your internet connection'}
              </Text>
              {hasFilters && (
                <TouchableOpacity style={[s.clearBtn, { backgroundColor: theme.primaryBg, borderColor: theme.primary }]} onPress={clearFilters} activeOpacity={0.8}>
                  <Text style={[s.clearBtnTxt, { color: theme.primary }]}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredGroups.map(group => (
              <MandiCard key={group.market} group={group} lang={lang}
                onPress={() => openMandi(group)} />
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Dropdowns */}
      {openDropdown === 'state' && (
        <DropdownSheet title="Select State" items={states} selected={selectedState}
          onSelect={onStateSelect} onClose={() => setOpenDropdown(null)} />
      )}
      {openDropdown === 'district' && (
        <DropdownSheet title="Select District" items={districts} selected={selectedDistrict}
          onSelect={onDistrictSelect} onClose={() => setOpenDropdown(null)} />
      )}

      <FloatingMicButton />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },

  // ── Header ──
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIconBox: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: '#F0FBF1',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  headerTitle: {
    fontSize: 17, fontWeight: '800', color: '#111827', letterSpacing: -0.3,
  },
  locRow: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2,
  },
  locTxt: {
    fontSize: 11, color: '#6B7280', fontWeight: '500', maxWidth: 160,
  },
  headerRight: {
    alignItems: 'flex-end', gap: 6,
  },
  sourceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  sourceDot: { width: 6, height: 6, borderRadius: 3 },
  sourceTxt: { fontSize: 11, fontWeight: '700' },
  langRow: { flexDirection: 'row', gap: 4 },
  langBtn: {
    paddingHorizontal: 9, paddingVertical: 5,
    borderRadius: 20, backgroundColor: '#F3F4F6',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  langBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langTxt: { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  langTxtActive: { color: '#fff' },

  // ── Search ──
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F9FAFB', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 11,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827', padding: 0 },

  // ── Filter row ──
  filterRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'nowrap',
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 22, borderWidth: 1.5,
    minHeight: 42,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  filterChipLoading: {
    backgroundColor: '#F9FAFB', borderColor: '#E5E7EB',
  },
  filterChipTxt: {
    fontSize: 13, fontWeight: '700', flex: 1, maxWidth: 100,
  },
  filterChipTxtActive: { color: '#fff' },
  clearChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 22, backgroundColor: '#FEF2F2',
    borderWidth: 1.5, borderColor: '#FECACA',
    minHeight: 42,
  },
  clearChipTxt: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
  countBadge: {
    marginLeft: 'auto' as any,
    backgroundColor: '#F3F4F6', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  countBadgeTxt: { fontSize: 12, fontWeight: '700', color: '#374151' },

  // ── Content ──
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12 },

  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F0FBF1', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 14, borderWidth: 1, borderColor: '#C8E6C9',
  },
  infoBannerTxt: { fontSize: 12, color: '#16A34A', fontWeight: '600', flex: 1 },

  // ── Empty ──
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#374151' },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 32 },
  clearBtn: {
    marginTop: 4, backgroundColor: '#F0FBF1', borderRadius: 20,
    paddingHorizontal: 24, paddingVertical: 10,
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  clearBtnTxt: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
});
