import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Linking,
  Animated, TextInput, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../../constants/theme';
import { fetchByMarket } from '../../services/mandiApi';
import { translateCrop, translateLabel, LANG_OPTIONS, type Lang } from '../../services/mandiTranslations';
import i18n from '../../i18n';
import MandiLoader from '../../components/MandiLoader';
import PageHeader from '../../components/PageHeader';
import { useTheme } from '../../context/ThemeContext';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface MandiRecord {
  commodity: string; variety: string; market: string;
  district: string; state: string;
  minPrice: number; maxPrice: number; modalPrice: number; pricePerKg: number;
  arrivalDate: string; emoji: string; category: string;
}

// Grouped: one commodity → multiple variety rows
interface CropGroup {
  commodity: string;
  emoji: string;
  category: string;
  varieties: MandiRecord[];   // all rows for this commodity
  bestModal: number;          // highest modal price across varieties
  bestPerKg: number;
  minOfMin: number;
  maxOfMax: number;
}

const CATS = ['all', 'vegetables', 'fruits', 'grains', 'pulses'] as const;
type Cat = typeof CATS[number];
const CAT_ICONS: Record<string, string> = {
  all: '🌿', vegetables: '🥕', fruits: '🍎', grains: '🌾', pulses: '🫘',
};

// ── Group records by commodity name ──────────────────────────────────────────
function groupByCommodity(records: MandiRecord[]): CropGroup[] {
  const map: Record<string, CropGroup> = {};
  for (const r of records) {
    const key = r.commodity.toLowerCase().trim();
    if (!map[key]) {
      map[key] = {
        commodity: r.commodity,
        emoji:     r.emoji,
        category:  r.category,
        varieties: [],
        bestModal: 0,
        bestPerKg: 0,
        minOfMin:  Infinity,
        maxOfMax:  0,
      };
    }
    map[key].varieties.push(r);
    if (r.modalPrice > map[key].bestModal) {
      map[key].bestModal = r.modalPrice;
      map[key].bestPerKg = r.pricePerKg;
    }
    if (r.minPrice < map[key].minOfMin) map[key].minOfMin = r.minPrice;
    if (r.maxPrice > map[key].maxOfMax) map[key].maxOfMax = r.maxPrice;
  }
  return Object.values(map);
}

// ── Map HTML ──────────────────────────────────────────────────────────────────
function buildMapHtml(lat: number, lng: number, label: string) {
  const safe = label.replace(/'/g, "\\'");
  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html,body,#map{margin:0;padding:0;width:100%;height:100%;}</style>
</head><body><div id="map"></div>
<script>
var map=L.map('map',{zoomControl:true}).setView([${lat},${lng}],13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OSM'}).addTo(map);
var icon=L.divIcon({html:'<div style="background:#2E7D32;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>',iconSize:[28,28],iconAnchor:[14,28],className:''});
L.marker([${lat},${lng}],{icon:icon}).addTo(map).bindPopup('<b>${safe}</b><br>Mandi').openPopup();
</script></body></html>`;
}

async function geocodeMandi(market: string, district: string, state: string) {
  try {
    for (const q of [
      `${market}, ${district}, ${state}, India`,
      `${district}, ${state}, India`,
    ]) {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'KisanMitraApp/1.0' } }
      );
      const j = await r.json();
      if (j[0]) return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) };
    }
  } catch {}
  return null;
}

// ── Expandable Crop Card ──────────────────────────────────────────────────────
function CropCard({ group, lang }: { group: CropGroup; lang: Lang }) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const hasMultiple = group.varieties.length > 1;
  const isHigh = group.bestModal > group.minOfMin + (group.maxOfMax - group.minOfMin) * 0.5;
  const tl = (s: string) => translateLabel(s, lang);

  const toggle = () => {
    if (!hasMultiple) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  };

  return (
    <View style={[cc.card, { backgroundColor: theme.surface }]}>
      <View style={[cc.accent, { backgroundColor: isHigh ? theme.primary : theme.red }]} />
      <TouchableOpacity style={cc.mainRow} onPress={toggle} activeOpacity={hasMultiple ? 0.75 : 1}>
        <View style={cc.emojiBox}>
          <Text style={cc.emoji}>{group.emoji}</Text>
        </View>
        <View style={cc.nameCol}>
          <Text style={[cc.name, { color: theme.text }]}>{translateCrop(group.commodity, lang)}</Text>
          {lang !== 'en' && (
            <Text style={[cc.nameEn, { color: theme.textMuted }]}>{group.commodity}</Text>
          )}
          <Text style={[cc.cat, { color: theme.textMuted }]}>{tl(group.category)}</Text>
          {hasMultiple && (
            <View style={[cc.varBadge, { backgroundColor: theme.primaryBg }]}>
              <Text style={[cc.varBadgeTxt, { color: theme.primary }]}>{group.varieties.length} {tl('varieties')}</Text>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={10} color={theme.primary} />
            </View>
          )}
        </View>
        <View style={cc.priceCol}>
          <Text style={[cc.priceKg, { color: isHigh ? theme.primary : theme.red }]}>
            ₹{group.bestPerKg}/kg
          </Text>
          <Text style={[cc.priceQtl, { color: theme.textMuted }]}>₹{group.bestModal.toLocaleString('en-IN')}/qtl</Text>
          <View style={[cc.rangeChip, { backgroundColor: theme.inputBg }]}>
            <Text style={[cc.rangeTxt, { color: theme.textMuted }]}>₹{group.minOfMin}–{group.maxOfMax}</Text>
          </View>
        </View>
        <View style={[cc.trendBox, { backgroundColor: isHigh ? theme.primaryBg : theme.redBg }]}>
          <Ionicons name={isHigh ? 'trending-up' : 'trending-down'} size={14}
            color={isHigh ? theme.primary : theme.red} />
        </View>
      </TouchableOpacity>

      {expanded && hasMultiple && (
        <View style={[cc.varList, { borderTopColor: theme.borderLight }]}>
          <View style={[cc.varHeader, { backgroundColor: theme.inputBg }]}>
            <Text style={[cc.varHeaderTxt, { flex: 2, color: theme.textSecondary }]}>{tl('Variety')}</Text>
            <Text style={[cc.varHeaderTxt, { flex: 1, textAlign: 'right', color: theme.textSecondary }]}>{tl('Min')}</Text>
            <Text style={[cc.varHeaderTxt, { flex: 1, textAlign: 'right', color: theme.textSecondary }]}>{tl('Max')}</Text>
            <Text style={[cc.varHeaderTxt, { flex: 1.2, textAlign: 'right', color: theme.textSecondary }]}>{tl('Modal')}</Text>
          </View>
          {group.varieties
            .sort((a, b) => b.modalPrice - a.modalPrice)
            .map((v, i) => {
              const vHigh = v.modalPrice > v.minPrice + (v.maxPrice - v.minPrice) * 0.5;
              return (
                <View key={i} style={[cc.varRow, i % 2 === 0 && { backgroundColor: theme.inputBg + '80' }]}>
                  <View style={cc.varNameCol}>
                    <Text style={[cc.varName, { color: theme.text }]} numberOfLines={1}>{v.variety || tl('General')}</Text>
                    <Text style={[cc.varPerKg, { color: theme.textSecondary }]}>₹{v.pricePerKg}/kg</Text>
                  </View>
                  <Text style={[cc.varPrice, { color: theme.textSecondary }]}>₹{v.minPrice}</Text>
                  <Text style={[cc.varPrice, { color: theme.textSecondary }]}>₹{v.maxPrice}</Text>
                  <Text style={[cc.varModal, { color: vHigh ? theme.primary : theme.red }]}>
                    ₹{v.modalPrice.toLocaleString('en-IN')}
                  </Text>
                </View>
              );
            })}
        </View>
      )}
    </View>
  );
}

const cc = StyleSheet.create({
  card:        { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 10, overflow: 'hidden', ...SHADOW.sm },
  accent:      { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  mainRow:     { flexDirection: 'row', alignItems: 'center', paddingLeft: 4 },
  emojiBox:    { width: 52, height: 56, alignItems: 'center', justifyContent: 'center' },
  emoji:       { fontSize: 26 },
  nameCol:     { flex: 1, paddingVertical: 12, paddingRight: 4 },
  name:        { fontSize: 14, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.2 },
  nameEn:      { fontSize: 10, color: '#90A4AE', marginTop: 1 },
  cat:         { fontSize: 10, color: '#90A4AE', marginTop: 2, textTransform: 'capitalize' },
  varBadge:    { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4, backgroundColor: COLORS.primaryBg, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  varBadgeTxt: { fontSize: 9, color: COLORS.primary, fontWeight: '700' },
  priceCol:    { alignItems: 'flex-end', paddingRight: 8, paddingVertical: 10, gap: 2 },
  priceKg:     { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  priceQtl:    { fontSize: 10, color: '#78909C', fontWeight: '600' },
  rangeChip:   { backgroundColor: '#F4F6F8', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  rangeTxt:    { fontSize: 9, color: '#90A4AE', fontWeight: '600' },
  trendBox:    { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },

  // Variety table
  varList:      { borderTopWidth: 1, borderTopColor: '#F0F4F8', marginLeft: 4 },
  varHeader:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAF8', paddingHorizontal: 12, paddingVertical: 6 },
  varHeaderTxt: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 },
  varRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9 },
  varRowAlt:    { backgroundColor: '#FAFCFA' },
  varNameCol:   { flex: 2 },
  varName:      { fontSize: 12, fontWeight: '600', color: COLORS.text },
  varPerKg:     { fontSize: 10, color: COLORS.textSecondary, marginTop: 1 },
  varPrice:     { flex: 1, fontSize: 11, color: COLORS.textSecondary, textAlign: 'right', fontWeight: '500' },
  varModal:     { flex: 1.2, fontSize: 12, fontWeight: '800', textAlign: 'right' },
});

export default function MandiDetailScreen() {
  const router = useRouter();
  const { id, district, state } = useLocalSearchParams<{ id: string; district: string; state: string }>();
  const { theme, isDark } = useTheme();

  const [prices,     setPrices]     = useState<MandiRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCat,  setActiveCat]  = useState<Cat>('all');
  const [sortBy,     setSortBy]     = useState<'price' | 'name'>('price');
  const [search,     setSearch]     = useState('');
  const [mapCoords,  setMapCoords]  = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [showMap,    setShowMap]    = useState(false);
  const [lang,       setLang]       = useState<Lang>((i18n.language as Lang) || 'gu');

  const tl = useCallback((s: string) => translateLabel(s, lang), [lang]);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ── Fetch ONLY this mandi's crops — complete, no record missed ────────────
  const loadPrices = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const res = await fetchByMarket(
        state    || 'Gujarat',
        district || '',
        id as string
      );
      // fetchByMarket already does strict market filtering + full pagination
      setPrices((res.data as MandiRecord[]) || []);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    } catch (e) {
      console.error('[MandiDetail]', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, district, state, fadeAnim]);

  const loadMap = useCallback(async () => {
    setMapLoading(true);
    const coords = await geocodeMandi(id as string, district || '', state || '');
    setMapCoords(coords);
    setMapLoading(false);
  }, [id, district, state]);

  useEffect(() => { loadPrices(); loadMap(); }, [loadPrices, loadMap]);

  // ── Group by commodity, then filter + sort ─────────────────────────────────
  const allGroups = useMemo(() => groupByCommodity(prices), [prices]);

  const filteredGroups = useMemo(() => {
    let groups = allGroups;
    if (activeCat !== 'all') groups = groups.filter(g => g.category === activeCat);
    if (search) {
      const q = search.toLowerCase();
      groups = groups.filter(g =>
        g.commodity.toLowerCase().includes(q) ||
        g.varieties.some(v => v.variety.toLowerCase().includes(q))
      );
    }
    return [...groups].sort((a, b) =>
      sortBy === 'price'
        ? b.bestModal - a.bestModal
        : a.commodity.localeCompare(b.commodity)
    );
  }, [allGroups, activeCat, search, sortBy]);

  // Stats
  const upCount  = prices.filter(r => r.modalPrice > r.minPrice + (r.maxPrice - r.minPrice) * 0.5).length;
  const downCount = prices.length - upCount;
  const avgPrice  = prices.length
    ? Math.round(prices.reduce((s, r) => s + r.modalPrice, 0) / prices.length)
    : 0;

  const openDirections = () => {
    const url = mapCoords
      ? `https://www.google.com/maps/search/?api=1&query=${mapCoords.lat},${mapCoords.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${id}, ${district}, ${state}`)}`;
    Linking.openURL(url);
  };

  const shareInfo = () => {
    const top3 = [...prices].sort((a, b) => b.modalPrice - a.modalPrice).slice(0, 3);
    const msg = `${id} Mandi Prices (${district}, ${state})\n` +
      top3.map(p => `${p.emoji} ${p.commodity}: ₹${p.pricePerKg}/kg`).join('\n') +
      `\n\nSource: data.gov.in`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(msg)}`);
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      {/* ── Header ── */}
      <PageHeader
        title={id as string || 'Mandi'}
        subtitle={`${district}${state ? `, ${state}` : ''}`}
        onBack={() => router.back()}
        iconName="storefront"
        iconColor={theme.primary}
        iconBg={theme.primaryBg}
        rightElement={
          <TouchableOpacity
            style={[s.shareIconBtn, { backgroundColor: theme.primaryBg, borderColor: theme.primary + '40' }]}
            onPress={shareInfo} activeOpacity={0.8}>
            <Ionicons name="share-social-outline" size={18} color={theme.primary} />
          </TouchableOpacity>
        }
      />

      {/* ── Stats strip ── */}
      {!loading && (
        <View style={[s.statsStrip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {[
            { val: allGroups.length,                        lbl: tl('Crops'),     color: theme.text,    bg: theme.primaryBg  },
            { val: upCount,                                 lbl: tl('Rising ↑'),  color: '#16A34A',     bg: theme.primaryBg  },
            { val: downCount,                               lbl: tl('Falling ↓'), color: theme.red,     bg: theme.redBg      },
            { val: `₹${avgPrice.toLocaleString('en-IN')}`, lbl: tl('Avg/qtl'),   color: '#D97706',     bg: theme.secondaryBg},
          ].map((st, i) => (
            <React.Fragment key={i}>
              {i > 0 && <View style={[s.statDiv, { backgroundColor: theme.border }]} />}
              <View style={[s.statItem, { backgroundColor: st.bg }]}>
                <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
                <Text style={[s.statLbl, { color: theme.textMuted }]}>{st.lbl}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      )}

      {/* Language toggle */}
      <View style={s.langBar}>
        {LANG_OPTIONS.map(opt => (
          <TouchableOpacity key={opt.code}
            style={[s.langBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }, lang === opt.code && s.langBtnActive]}
            onPress={() => setLang(opt.code)} activeOpacity={0.8}>
            <Text style={[s.langTxt, { color: theme.textSecondary }, lang === opt.code && s.langTxtActive]}>
              {opt.native}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ flex: 1 }} />
        <View style={[s.liveChip, { backgroundColor: theme.primaryBg, borderColor: theme.primary + '40' }]}>
          <View style={s.liveDot} />
          <Text style={[s.liveTxt, { color: theme.primary }]}>Live</Text>
        </View>
      </View>

      {/* ── Map toggle ── */}
      <TouchableOpacity style={[s.mapToggle, { backgroundColor: theme.primaryBg, borderColor: theme.primary + '40' }]} onPress={() => setShowMap(v => !v)} activeOpacity={0.85}>
        <Ionicons name={showMap ? 'list-outline' : 'map-outline'} size={15} color={theme.primary} />
        <Text style={[s.mapToggleTxt, { color: theme.primary }]}>{tl(showMap ? 'Show Crop List' : 'Show Map Location')}</Text>
        <Ionicons name="chevron-forward" size={13} color={theme.primary} />
      </TouchableOpacity>

      {/* ── Map ── */}
      {showMap && (
        <View style={s.mapContainer}>
          {mapLoading ? (
            <View style={[s.mapLoader, { backgroundColor: theme.inputBg }]}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[s.mapLoaderTxt, { color: theme.textSecondary }]}>Loading map...</Text>
            </View>
          ) : mapCoords ? (
            <WebView
              source={{ html: buildMapHtml(mapCoords.lat, mapCoords.lng, id as string) }}
              style={s.map} scrollEnabled={false} javaScriptEnabled
            />
          ) : (
            <View style={[s.mapLoader, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="map-outline" size={28} color={theme.border} />
              <Text style={[s.mapLoaderTxt, { color: theme.textSecondary }]}>Map unavailable</Text>
              <TouchableOpacity onPress={openDirections} style={[s.openMapsBtn, { backgroundColor: theme.primaryBg, borderColor: theme.primary }]}>
                <Text style={[s.openMapsTxt, { color: theme.primary }]}>Open in Google Maps</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* ── Category Tabs ── */}
      {!showMap && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={s.tabScroll} contentContainerStyle={s.tabContent}>
            {CATS.map(cat => {
              const count = cat === 'all'
                ? allGroups.length
                : allGroups.filter(g => g.category === cat).length;
              return (
                <TouchableOpacity key={cat}
                  style={[s.tab, { backgroundColor: theme.surface, borderColor: theme.border }, activeCat === cat && s.tabActive]}
                  onPress={() => setActiveCat(cat)} activeOpacity={0.8}>
                  <Text style={s.tabEmoji}>{CAT_ICONS[cat]}</Text>
                  <Text style={[s.tabLabel, { color: theme.textSecondary }, activeCat === cat && s.tabLabelActive]}>
                    {tl(cat === 'all' ? 'All' : cat)}
                  </Text>
                  <View style={[s.tabBadge, { backgroundColor: theme.inputBg }, activeCat === cat && s.tabBadgeActive]}>
                    <Text style={[s.tabBadgeTxt, { color: theme.textSecondary }, activeCat === cat && s.tabBadgeTxtActive]}>{count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Search + Sort */}
          <View style={s.controlStrip}>
            <View style={[s.searchMini, { backgroundColor: theme.surface }]}>
              <Ionicons name="search-outline" size={13} color={theme.textMuted} />
              <TextInput
                style={[s.searchMiniInput, { color: theme.text }]}
                placeholder={tl('Search crop or variety...')}
                value={search} onChangeText={setSearch} placeholderTextColor={theme.textMuted} />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={14} color={theme.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={[s.sortBtn, { backgroundColor: theme.primaryBg }]}
              onPress={() => setSortBy(v => v === 'price' ? 'name' : 'price')} activeOpacity={0.8}>
              <Ionicons name="swap-vertical" size={13} color={theme.primary} />
              <Text style={[s.sortTxt, { color: theme.primary }]}>{tl(sortBy === 'price' ? 'Price' : 'Name')}</Text>
            </TouchableOpacity>
            <View style={[s.liveChip, { backgroundColor: theme.primaryBg, borderColor: theme.primary + '40' }]}>
              <View style={s.liveDot} />
              <Text style={[s.liveTxt, { color: theme.primary }]}>Live</Text>
            </View>
          </View>

          {/* Hint */}
          {!loading && allGroups.some(g => g.varieties.length > 1) && (
            <View style={[s.hintBar, { backgroundColor: theme.primaryBg }]}>
              <Ionicons name="information-circle-outline" size={13} color={theme.primary} />
              <Text style={[s.hintTxt, { color: theme.primary }]}>Tap crops with multiple varieties to expand</Text>
            </View>
          )}
        </>
      )}

      {/* ── Crop List ── */}
      {loading ? (
        <MandiLoader
          message={`Loading ${id || 'Mandi'} prices...`}
          subMessage="Fetching all crops, please wait"
        />
      ) : !showMap && (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
            contentContainerStyle={s.content}
            refreshControl={
              <RefreshControl refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadPrices(false); }}
                colors={[theme.primary]} />
            }>
            {filteredGroups.length === 0 ? (
              <View style={s.empty}>
                <Ionicons name="leaf-outline" size={48} color={theme.border} />
                <Text style={[s.emptyTxt, { color: theme.textSecondary }]}>No mandi data available</Text>
                <Text style={[s.emptySub, { color: theme.textSecondary }]}>Try a different category or clear search</Text>
              </View>
            ) : (
              filteredGroups.map(group => (
                <CropCard key={group.commodity} group={group} lang={lang} />
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      )}

      {/* ── Bottom Bar ── */}
      <View style={[s.bottomBar, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity style={[s.dirBtn, { backgroundColor: theme.primaryBg, borderColor: theme.primary }]} onPress={openDirections} activeOpacity={0.85}>
          <Ionicons name="navigate" size={16} color={theme.primary} />
          <Text style={[s.dirTxt, { color: theme.primary }]}>Directions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.shareBtn} onPress={shareInfo} activeOpacity={0.85}>
          <Ionicons name="logo-whatsapp" size={16} color="#FFF" />
          <Text style={s.shareTxt}>Share Prices</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: '#F8FAFC' },
  shareIconBtn:  { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0FBF1', borderWidth: 1, borderColor: '#C8E6C9', alignItems: 'center', justifyContent: 'center' },

  // Stats strip below header
  statsStrip:    { flexDirection: 'row', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 10, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  statItem:      { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2 },
  statVal:       { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  statLbl:       { fontSize: 9, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3 },
  statDiv:       { width: 1, backgroundColor: '#F0F0F0', marginVertical: 6 },

  // Language bar
  langBar:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8 },
  langRow:       { flexDirection: 'row', gap: 3 },
  langBtn:       { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  langBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langTxt:       { fontSize: 10, fontWeight: '700', color: '#6B7280' },
  langTxtActive: { color: '#fff' },
  liveChip:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FBF1', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#C8E6C9' },
  liveDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  liveTxt:       { fontSize: 10, color: '#16A34A', fontWeight: '700' },

  // Unused old styles kept for compat
  header: {}, blob1: {}, blob2: {}, hRow: {}, iconBtn: {}, hMid: {}, hTitle: {}, hLocRow: {}, hLoc: {}, hRight: {}, statsRow: {},

  mapToggle:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 16, marginTop: 10, backgroundColor: COLORS.primaryBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: '#C8E6C9' },
  mapToggleTxt:  { flex: 1, fontSize: 13, fontWeight: '700', color: COLORS.primary },
  mapContainer:  { height: 220, marginHorizontal: 16, marginTop: 8, borderRadius: 16, overflow: 'hidden', ...SHADOW.md },
  map:           { flex: 1 },
  mapLoader:     { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F6F8', gap: 8 },
  mapLoaderTxt:  { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  openMapsBtn:   { backgroundColor: COLORS.primaryBg, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: COLORS.primary },
  openMapsTxt:   { fontSize: 12, color: COLORS.primary, fontWeight: '700' },

  tabScroll:        { marginTop: 10, height: 44, flexGrow: 0, flexShrink: 0 },
  tabContent:       { paddingHorizontal: 14, gap: 8, alignItems: 'center', height: 44 },
  tab:              { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, height: 36, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: COLORS.border },
  tabActive:        { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabEmoji:         { fontSize: 13 },
  tabLabel:         { fontSize: 11, fontWeight: '600', color: COLORS.textSecondary },
  tabLabelActive:   { color: '#FFF' },
  tabBadge:         { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.lightGray, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabBadgeActive:   { backgroundColor: 'rgba(255,255,255,0.25)' },
  tabBadgeTxt:      { fontSize: 9, fontWeight: '800', color: COLORS.textSecondary },
  tabBadgeTxtActive:{ color: '#FFF' },

  controlStrip:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 14, marginTop: 8, marginBottom: 2 },
  searchMini:       { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, ...SHADOW.sm },
  searchMiniInput:  { flex: 1, fontSize: 12, color: COLORS.text, padding: 0 },
  sortBtn:          { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primaryBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  sortTxt:          { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
  liveChip:         { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  liveDot:          { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  liveTxt:          { fontSize: 10, color: COLORS.primary, fontWeight: '800' },

  hintBar:          { flexDirection: 'row', alignItems: 'center', gap: 5, marginHorizontal: 14, marginTop: 6, backgroundColor: '#EEF7EE', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  hintTxt:          { fontSize: 11, color: COLORS.primary, fontWeight: '500' },

  loader:           { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loaderTxt:        { fontSize: 14, color: COLORS.text, fontWeight: '700', textAlign: 'center', paddingHorizontal: 24 },
  loaderSub:        { fontSize: 12, color: COLORS.textSecondary, textAlign: 'center' },
  scroll:           { flex: 1 },
  content:          { paddingHorizontal: 14, paddingTop: 8 },

  empty:            { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTxt:         { fontSize: 15, color: COLORS.textSecondary, fontWeight: '700' },
  emptySub:         { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center' },

  bottomBar:        { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: COLORS.border },
  dirBtn:           { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: COLORS.primaryBg },
  dirTxt:           { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  shareBtn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, backgroundColor: '#25D366' },
  shareTxt:         { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
