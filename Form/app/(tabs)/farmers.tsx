import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, StatusBar, ActivityIndicator, Animated,
  RefreshControl, Image, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { socialAPI } from '../../services/api';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────
interface Farmer {
  _id: string;
  name: string;
  profileImage?: string;
  village?: string;
  district?: string;
  state?: string;
  bio?: string;
  cropsGrown?: string;
  followersCount: number;
  isFollowing: boolean;
}

// ── Mock data — 10 static fallback farmers ────────────────────────────────────
const MOCK_FARMERS: Farmer[] = [
  { _id: '1',  name: 'Ramesh Patel',   village: 'Anand',       district: 'Anand',       state: 'Gujarat', bio: 'Cotton & Wheat farmer for 15 years',    cropsGrown: 'Cotton, Wheat',     followersCount: 248, isFollowing: false },
  { _id: '2',  name: 'Sunita Devi',    village: 'Mehsana',     district: 'Mehsana',     state: 'Gujarat', bio: 'Organic vegetable farming enthusiast',  cropsGrown: 'Tomato, Brinjal',   followersCount: 183, isFollowing: false },
  { _id: '3',  name: 'Bharat Singh',   village: 'Rajkot',      district: 'Rajkot',      state: 'Gujarat', bio: 'Groundnut & Sesame specialist',         cropsGrown: 'Groundnut, Sesame', followersCount: 97,  isFollowing: false },
  { _id: '4',  name: 'Kavita Ben',     village: 'Surat',       district: 'Surat',       state: 'Gujarat', bio: 'Sugarcane and banana grower',           cropsGrown: 'Sugarcane, Banana', followersCount: 312, isFollowing: false },
  { _id: '5',  name: 'Arjun Yadav',    village: 'Vadodara',    district: 'Vadodara',    state: 'Gujarat', bio: 'Dairy + crop farming combination',      cropsGrown: 'Wheat, Maize',      followersCount: 156, isFollowing: false },
  { _id: '6',  name: 'Priya Sharma',   village: 'Gandhinagar', district: 'Gandhinagar', state: 'Gujarat', bio: 'Floriculture and organic herbs',        cropsGrown: 'Flowers, Herbs',    followersCount: 421, isFollowing: false },
  { _id: '7',  name: 'Mohan Lal',      village: 'Junagadh',    district: 'Junagadh',    state: 'Gujarat', bio: 'Mango orchard owner, 20 acres',         cropsGrown: 'Mango, Chiku',      followersCount: 534, isFollowing: false },
  { _id: '8',  name: 'Geeta Kumari',   village: 'Bhavnagar',   district: 'Bhavnagar',   state: 'Gujarat', bio: 'Drip irrigation pioneer in village',    cropsGrown: 'Cotton, Castor',    followersCount: 89,  isFollowing: false },
  { _id: '9',  name: 'Dinesh Verma',   village: 'Amreli',      district: 'Amreli',      state: 'Gujarat', bio: 'Groundnut export quality farmer',       cropsGrown: 'Groundnut, Wheat',  followersCount: 201, isFollowing: false },
  { _id: '10', name: 'Lalita Patel',   village: 'Navsari',     district: 'Navsari',     state: 'Gujarat', bio: 'Chikoo & mango orchard specialist',     cropsGrown: 'Chikoo, Mango',     followersCount: 374, isFollowing: false },
];

const FILTER_CHIPS = [
  { key: 'all',       labelKey: 'farmers.filterAll',       icon: 'people'   },
  { key: 'nearby',    labelKey: 'farmers.filterNearby',    icon: 'navigate' },
  { key: 'organic',   labelKey: 'farmers.filterOrganic',   icon: 'leaf'     },
  { key: 'wheat',     labelKey: 'farmers.filterWheat',     icon: 'nutrition'},
  { key: 'cotton',    labelKey: 'farmers.filterCotton',    icon: 'flower'   },
  { key: 'vegetable', labelKey: 'farmers.filterVegetable', icon: 'basket'   },
];

// ── Follow Button ─────────────────────────────────────────────────────────────
function FollowBtn({ following, onPress }: { following: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 80 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 80 }),
    ]).start();
    onPress();
  };

  if (following) {
    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.85}
          style={fb.followingBtn}
        >
          <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
          <Text style={fb.followingTxt}>Following</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fb.followWrap]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
        <LinearGradient
          colors={['#1B5E20', '#43A047']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={fb.grad}
        >
          <Ionicons name="person-add" size={13} color="#fff" />
          <Text style={fb.followTxt}>Follow</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const fb = StyleSheet.create({
  followWrap: {
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  followingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: '#F0FBF1',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  grad: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  followTxt:    { fontSize: 12, fontWeight: '700', color: '#fff' },
  followingTxt: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
});

// ── Farmer Card ───────────────────────────────────────────────────────────────
function FarmerCard({
  farmer, onFollow, theme,
}: {
  farmer: Farmer;
  onFollow: (id: string) => void;
  theme: any;
}) {
  const location = [farmer.village, farmer.district].filter(Boolean).join(', ') || '—';
  const initials = farmer.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const AVATAR_COLORS: [string, string][] = [
    ['#1B5E20', '#43A047'], ['#0D47A1', '#1976D2'],
    ['#4A148C', '#7B1FA2'], ['#BF360C', '#E64A19'],
    ['#006064', '#00838F'], ['#F57F17', '#F9A825'],
  ];
  const colorIdx = farmer.name.charCodeAt(0) % AVATAR_COLORS.length;

  return (
    <View style={[fc.card, { backgroundColor: theme.surface }]}>
      {/* Avatar */}
      <View style={fc.avatarWrap}>
        {farmer.profileImage ? (
          <Image source={{ uri: farmer.profileImage }} style={fc.avatarImg} />
        ) : (
          <LinearGradient colors={AVATAR_COLORS[colorIdx]} style={fc.avatarGrad}>
            <Text style={fc.avatarTxt}>{initials}</Text>
          </LinearGradient>
        )}
        <View style={fc.onlineDot} />
      </View>

      {/* Info */}
      <View style={fc.info}>
        <View style={fc.nameRow}>
          <Text style={[fc.name, { color: theme.text }]} numberOfLines={1}>{farmer.name}</Text>
          <View style={fc.verifiedBadge}>
            <Ionicons name="checkmark" size={9} color="#fff" />
          </View>
        </View>

        <View style={fc.locRow}>
          <Ionicons name="location-sharp" size={11} color={COLORS.primary} />
          <Text style={[fc.loc, { color: theme.textSecondary }]} numberOfLines={1}>{location}</Text>
        </View>

        {farmer.bio ? (
          <Text style={[fc.bio, { color: theme.textSecondary }]} numberOfLines={1}>{farmer.bio}</Text>
        ) : null}

        {farmer.cropsGrown ? (
          <View style={fc.cropsRow}>
            <Ionicons name="leaf" size={10} color={COLORS.primary} />
            <Text style={[fc.crops, { color: theme.textMuted }]} numberOfLines={1}>{farmer.cropsGrown}</Text>
          </View>
        ) : null}

        <View style={fc.footer}>
          <View style={[fc.followerPill, { backgroundColor: theme.primaryBg }]}>
            <Ionicons name="people" size={11} color={COLORS.primary} />
            <Text style={fc.followerTxt}>{formatCount(farmer.followersCount)}</Text>
          </View>
          <FollowBtn following={farmer.isFollowing} onPress={() => onFollow(farmer._id)} />
        </View>
      </View>
    </View>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

const fc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: SPACING.md,
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOW.md,
  },
  avatarWrap: { position: 'relative', width: 56, height: 56, flexShrink: 0 },
  avatarGrad: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  avatarTxt: { fontSize: 20, fontWeight: '800', color: '#fff' },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2, borderColor: '#fff',
  },
  info: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: FONT_SIZE.md, fontWeight: '800', color: '#111827', letterSpacing: -0.2, flex: 1 },
  verifiedBadge: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#F9A825',
    alignItems: 'center', justifyContent: 'center',
  },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  loc: { fontSize: 11, color: '#6B7280', fontWeight: '500', flex: 1 },
  bio: { fontSize: 11, color: '#6B7280', fontStyle: 'italic', lineHeight: 16 },
  cropsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  crops: { fontSize: 10, color: '#9CA3AF', fontWeight: '500', flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  followerPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0FBF1', borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  followerTxt: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
});

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonFarmerCard({ theme }: { theme: any }) {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[sk.card, { opacity: anim, backgroundColor: theme.surface }]}>
      <View style={[sk.avatar, { backgroundColor: theme.border }]} />
      <View style={sk.info}>
        <View style={[sk.line1, { backgroundColor: theme.border }]} />
        <View style={[sk.line2, { backgroundColor: theme.borderLight }]} />
        <View style={[sk.line3, { backgroundColor: theme.borderLight }]} />
      </View>
    </Animated.View>
  );
}

const sk = StyleSheet.create({
  card:   { flexDirection: 'row', gap: 12, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  info:   { flex: 1, gap: 8, justifyContent: 'center' },
  line1:  { height: 14, borderRadius: 7, width: '60%' },
  line2:  { height: 10, borderRadius: 5, width: '40%' },
  line3:  { height: 10, borderRadius: 5, width: '80%' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function FarmersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { isLoggedIn } = useAuth();

  const [search,         setSearch]         = useState('');
  const [activeFilter,   setActiveFilter]   = useState('all');
  const [allFarmers,     setAllFarmers]     = useState<Farmer[]>(MOCK_FARMERS);
  const [displayFarmers, setDisplayFarmers] = useState<Farmer[]>(MOCK_FARMERS);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading,  setSearchLoading]  = useState(false);
  const [refreshing,     setRefreshing]     = useState(false);

  // ── Load real farmers on mount ──
  const loadFarmers = useCallback(async () => {
    if (!isLoggedIn) {
      setInitialLoading(false);
      return;
    }
    try {
      const data = await socialAPI.getAllUsers();
      if (data?.users?.length) {
        const mapped: Farmer[] = data.users.map((u: any) => ({
          _id:            u._id || u.id,
          name:           u.name           || '',
          profileImage:   u.profileImage   || '',
          village:        u.village        || '',
          district:       u.district       || '',
          state:          u.state          || '',
          bio:            u.bio            || '',
          cropsGrown:     u.cropsGrown     || '',
          followersCount: u.followersCount || 0,
          isFollowing:    u.isFollowing    || false,
        }));
        setAllFarmers(mapped);
        setDisplayFarmers(mapped);
      } else {
        // No real users yet — show mock
        setAllFarmers(MOCK_FARMERS);
        setDisplayFarmers(MOCK_FARMERS);
      }
    } catch {
      // offline — keep mock data
      setAllFarmers(MOCK_FARMERS);
      setDisplayFarmers(MOCK_FARMERS);
    } finally {
      setInitialLoading(false);
    }
  }, [isLoggedIn]);

  useEffect(() => { loadFarmers(); }, [loadFarmers]);

  // ── Search with debounce ──
  useEffect(() => {
    const base = allFarmers;

    if (!search.trim()) {
      setDisplayFarmers(base);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        if (isLoggedIn) {
          const data = await socialAPI.searchUsers(search.trim());
          if (data?.users?.length) {
            setDisplayFarmers(data.users.map((u: any) => ({
              _id:            u._id || u.id,
              name:           u.name           || '',
              profileImage:   u.profileImage   || '',
              village:        u.village        || '',
              district:       u.district       || '',
              state:          u.state          || '',
              bio:            u.bio            || '',
              cropsGrown:     u.cropsGrown     || '',
              followersCount: u.followersCount || 0,
              isFollowing:    u.isFollowing    || false,
            })));
            setSearchLoading(false);
            return;
          }
        }
        // Fallback: local filter
        const q = search.toLowerCase();
        setDisplayFarmers(base.filter(f =>
          f.name.toLowerCase().includes(q) ||
          (f.village   || '').toLowerCase().includes(q) ||
          (f.district  || '').toLowerCase().includes(q) ||
          (f.cropsGrown|| '').toLowerCase().includes(q)
        ));
      } catch {
        const q = search.toLowerCase();
        setDisplayFarmers(base.filter(f =>
          f.name.toLowerCase().includes(q) ||
          (f.village   || '').toLowerCase().includes(q) ||
          (f.district  || '').toLowerCase().includes(q) ||
          (f.cropsGrown|| '').toLowerCase().includes(q)
        ));
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, allFarmers, isLoggedIn]);

  // ── Filter chips ──
  const filteredFarmers = displayFarmers.filter(f => {
    if (activeFilter === 'all')       return true;
    if (activeFilter === 'nearby')    return (f.state    || '').toLowerCase().includes('gujarat');
    if (activeFilter === 'organic')   return (f.bio      || '').toLowerCase().includes('organic');
    if (activeFilter === 'wheat')     return (f.cropsGrown || '').toLowerCase().includes('wheat');
    if (activeFilter === 'cotton')    return (f.cropsGrown || '').toLowerCase().includes('cotton');
    if (activeFilter === 'vegetable') return !!(f.cropsGrown || '').toLowerCase().match(/tomato|brinjal|vegetable|onion|potato/);
    return true;
  });

  // ── Follow toggle ──
  const handleFollow = useCallback(async (id: string) => {
    const farmer = allFarmers.find(f => f._id === id) || displayFarmers.find(f => f._id === id);
    if (!farmer) return;
    const wasFollowing = farmer.isFollowing;

    const toggle = (list: Farmer[]) =>
      list.map(f =>
        f._id === id
          ? { ...f, isFollowing: !f.isFollowing, followersCount: f.isFollowing ? f.followersCount - 1 : f.followersCount + 1 }
          : f
      );

    setAllFarmers(prev => toggle(prev));
    setDisplayFarmers(prev => toggle(prev));

    // Skip API for mock data (numeric IDs) or when not logged in
    const isMockId = /^\d+$/.test(id);
    if (isMockId) {
      // Save/remove mock follow to AsyncStorage so social profile can show it
      try {
        const raw = await AsyncStorage.getItem('@kisan_mock_following');
        let list: any[] = raw ? JSON.parse(raw) : [];
        if (!wasFollowing) {
          // Add to following if not already there
          if (!list.find((f: any) => (f._id || f.id) === id)) {
            list.push({
              _id:          id,
              name:         farmer.name,
              profileImage: farmer.profileImage || '',
              village:      farmer.village      || '',
              district:     farmer.district     || '',
              bio:          farmer.bio          || '',
              cropsGrown:   farmer.cropsGrown   || '',
              isFollowing:  true,
            });
          }
        } else {
          list = list.filter((f: any) => (f._id || f.id) !== id);
        }
        await AsyncStorage.setItem('@kisan_mock_following', JSON.stringify(list));
      } catch {}
      return;
    }

    if (!isLoggedIn) return;

    try {
      if (wasFollowing) await socialAPI.unfollow(id);
      else await socialAPI.follow(id);
    } catch {
      // revert
      const revert = (list: Farmer[]) =>
        list.map(f =>
          f._id === id
            ? { ...f, isFollowing: wasFollowing, followersCount: farmer.followersCount }
            : f
        );
      setAllFarmers(prev => revert(prev));
      setDisplayFarmers(prev => revert(prev));
    }
  }, [allFarmers, displayFarmers, isLoggedIn]);

  const onRefresh = async () => {
    setRefreshing(true);
    setSearch('');
    setActiveFilter('all');
    await loadFarmers();
    setRefreshing(false);
  };

  const isLoading = initialLoading || searchLoading;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />

      {/* ── Header ── */}
      <View style={[s.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }]}>
        {/* Title row */}
        <View style={s.titleRow}>
          <View style={s.titleLeft}>
            <LinearGradient colors={['#1B5E20', '#43A047']} style={s.titleIcon}>
              <Ionicons name="people" size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[s.title, { color: theme.text }]}>{t('farmers.title')}</Text>
              <Text style={[s.subtitle, { color: theme.textSecondary }]}>{t('farmers.subtitle')}</Text>
            </View>
          </View>
          <View style={[s.countPill, { backgroundColor: theme.primaryBg, borderColor: COLORS.primary + '40' }]}>
            <Text style={s.countTxt}>{filteredFarmers.length}</Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={[s.searchBox, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}>
          <Ionicons name="search-outline" size={16} color={theme.textMuted} />
          <TextInput
            style={[s.searchInput, { color: theme.text }]}
            placeholder={t('farmers.searchPlaceholder')}
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {searchLoading ? (
            <ActivityIndicator size={14} color={COLORS.primary} />
          ) : search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.filterScroll}
          contentContainerStyle={s.filterContent}
        >
          {FILTER_CHIPS.map(chip => (
            <TouchableOpacity
              key={chip.key}
              style={[
                s.filterChip,
                { backgroundColor: theme.surface, borderColor: theme.border },
                activeFilter === chip.key && s.filterChipActive,
              ]}
              onPress={() => setActiveFilter(chip.key)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={chip.icon as any}
                size={13}
                color={activeFilter === chip.key ? '#fff' : theme.textSecondary}
              />
              <Text style={[s.filterChipTxt, { color: theme.textSecondary }, activeFilter === chip.key && s.filterChipTxtActive]}>
                {t(chip.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Content ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        {/* Stats banner */}
        {(() => {
          const totalFarmers  = allFarmers.length;
          const uniqueVillages = new Set(allFarmers.map(f => f.village).filter(Boolean)).size;
          const allCrops = allFarmers.flatMap(f => (f.cropsGrown || '').split(',').map(c => c.trim()).filter(Boolean));
          const uniqueCrops = new Set(allCrops).size;
          const stats = [
            { icon: 'people',   value: formatCount(totalFarmers),   labelKey: 'farmers.statFarmers'  },
            { icon: 'location', value: formatCount(uniqueVillages), labelKey: 'farmers.statVillages' },
            { icon: 'leaf',     value: formatCount(uniqueCrops),    labelKey: 'farmers.statCrops'    },
          ];
          return (
            <View style={[s.statsBanner, { backgroundColor: theme.primaryBg, borderColor: COLORS.primary + '30' }]}>
              {stats.map((stat, i, arr) => (
                <React.Fragment key={stat.labelKey}>
                  <View style={s.statItem}>
                    <View style={[s.statIcon, { backgroundColor: COLORS.primary + '20' }]}>
                      <Ionicons name={stat.icon as any} size={14} color={COLORS.primary} />
                    </View>
                    <Text style={s.statValue}>{stat.value}</Text>
                    <Text style={[s.statLabel, { color: theme.textSecondary }]}>{t(stat.labelKey)}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={[s.statDivider, { backgroundColor: COLORS.primary + '30' }]} />}
                </React.Fragment>
              ))}
            </View>
          );
        })()}

        {/* Farmer list */}
        {isLoading ? (
          [1, 2, 3, 4].map(i => <SkeletonFarmerCard key={i} theme={theme} />)
        ) : filteredFarmers.length === 0 ? (
          <View style={s.empty}>
            <LinearGradient colors={['#E8F5E9', '#F1F8E9']} style={s.emptyIcon}>
              <Ionicons name="people-outline" size={40} color={COLORS.primary} />
            </LinearGradient>
            <Text style={[s.emptyTitle, { color: theme.text }]}>{t('farmers.emptyTitle')}</Text>
            <Text style={[s.emptySub, { color: theme.textSecondary }]}>{t('farmers.emptySub')}</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => { setSearch(''); setActiveFilter('all'); }}>
              <Text style={s.emptyBtnTxt}>{t('farmers.emptyReset')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredFarmers.map(farmer => (
            <FarmerCard
              key={farmer._id}
              farmer={farmer}
              onFollow={handleFollow}
              theme={theme}
            />
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  titleIcon: {
    width: 44, height: 44, borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: FONT_SIZE.lg, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: FONT_SIZE.xs, fontWeight: '500', marginTop: 1 },
  countPill: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1,
  },
  countTxt: { fontSize: FONT_SIZE.sm, fontWeight: '800', color: COLORS.primary },

  // Search
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: 11,
    borderWidth: 1.5, marginBottom: SPACING.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZE.sm, padding: 0 },

  // Filters
  filterScroll: { flexGrow: 0, marginBottom: 4 },
  filterContent: { gap: SPACING.sm, paddingRight: SPACING.md },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: RADIUS.full, borderWidth: 1.5,
    ...SHADOW.sm,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterChipTxt: { fontSize: 12, fontWeight: '600' },
  filterChipTxtActive: { color: '#fff' },

  // Content
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md },

  // Stats banner
  statsBanner: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    ...SHADOW.sm,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  statValue: { fontSize: FONT_SIZE.md, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 10, fontWeight: '500' },
  statDivider: { width: 1, marginVertical: 8 },

  // Empty state
  empty: { alignItems: 'center', paddingVertical: 48, gap: SPACING.sm },
  emptyIcon: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  emptyTitle: { fontSize: FONT_SIZE.lg, fontWeight: '800', letterSpacing: -0.2 },
  emptySub: { fontSize: FONT_SIZE.sm, textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  emptyBtnTxt: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: '#fff' },
});
