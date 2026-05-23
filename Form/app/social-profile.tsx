import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { postAPI, socialAPI, saveUser } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');
const POST_SIZE = (SCREEN_W - SPACING.md * 2 - SPACING.xs * 2) / 3;

// ─── Static activity data (farming activities) ────────────────────────────────
const MOCK_ACTIVITIES = [
  { id: '1', icon: 'water',  color: '#1565C0', bg: '#E3F2FD', textKey: 'social.actSpray',   time: '2h ago' },
  { id: '2', icon: 'leaf',   color: '#2E7D32', bg: '#E8F5E9', textKey: 'social.actHarvest', time: '1d ago' },
  { id: '3', icon: 'sunny',  color: '#F57F17', bg: '#FFF8E1', textKey: 'social.actIrrig',   time: '2d ago' },
  { id: '4', icon: 'bug',    color: '#C62828', bg: '#FCE4EC', textKey: 'social.actPest',    time: '3d ago' },
  { id: '5', icon: 'cart',   color: '#7B1FA2', bg: '#F3E5F5', textKey: 'social.actSell',    time: '4d ago' },
];

const CROP_EMOJIS = ['🌾', '🚜', '🌱', '💧', '🌿', '🌻', '🍅', '🌽', '🐄', '🌳', '🍃', '🌼'];
const BG_COLORS   = ['#E8F5E9','#E3F2FD','#F3E5F5','#E0F7FA','#F9FBE7','#FFF8E1','#FCE4EC','#FFF3E0','#F1F8E9'];

// ─── Types ────────────────────────────────────────────────────────────────────

type TabType = 'posts' | 'activity' | 'followers' | 'following';

interface Post {
  id: string;
  emoji: string;
  bg: string;
  caption: string;
  likes: number;
  comments: number;
  liked: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LikeButton({ liked, count, onPress }: { liked: boolean; count: number; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.4, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} style={styles.likeBtn}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#E53935' : '#9CA3AF'} />
      </Animated.View>
      <Text style={[styles.likeCount, liked && { color: '#E53935' }]}>{count}</Text>
    </TouchableOpacity>
  );
}

function FollowButton({ following, onPress }: { following: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 60 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 60 }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[styles.followBtn, following && styles.followingBtn]}
      >
        {following ? (
          <Ionicons name="checkmark" size={13} color={COLORS.primary} />
        ) : (
          <Ionicons name="person-add" size={13} color={COLORS.white} />
        )}
        <Text style={[styles.followBtnText, following && styles.followingBtnText]}>
          {following ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function SocialProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, refreshProfile } = useAuth();
  const { theme, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingPeople, setLoadingPeople] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddPost, setShowAddPost] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🌾');
  const [postingLoading, setPostingLoading] = useState(false);

  const followBtnScale = useRef(new Animated.Value(1)).current;
  const isOwnProfile = true;
  const isFollowing = false;
  const handleMainFollow = () => {};

  // ── Load posts ──
  const loadPosts = useCallback(async () => {
    try {
      const data = await postAPI.getUserPosts('me');
      if (data?.posts) {
        setPosts(data.posts.map((p: any) => ({
          id:       p._id || p.id,
          emoji:    p.emoji    || '🌾',
          bg:       p.bg       || '#E8F5E9',
          caption:  p.caption  || '',
          likes:    p.likesCount ?? p.likes?.length ?? 0,
          comments: p.commentsCount ?? p.comments?.length ?? 0,
          liked:    p.isLiked  || false,
        })));
      }
    } catch {
      // offline — keep empty
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  // ── Load followers/following ──
  const loadPeople = useCallback(async () => {
    setLoadingPeople(true);
    try {
      // Load locally stored mock follows (for mock farmers)
      const localRaw = await AsyncStorage.getItem('@kisan_mock_following');
      const localFollowing: any[] = localRaw ? JSON.parse(localRaw) : [];

      try {
        const [fwrData, fwgData] = await Promise.all([
          socialAPI.getFollowers('me'),
          socialAPI.getFollowing('me'),
        ]);
        if (fwrData?.followers) setFollowers(fwrData.followers);

        // Merge real API following + local mock following (deduplicate by _id)
        const apiFollowing: any[] = fwgData?.following || [];
        const apiIds = new Set(apiFollowing.map((f: any) => f._id || f.id));
        const merged = [
          ...apiFollowing,
          ...localFollowing.filter((f: any) => !apiIds.has(f._id || f.id)),
        ];
        setFollowing(merged);
      } catch {
        // API failed — show only local mock follows
        setFollowing(localFollowing);
      }
    } catch {
      // offline
    } finally {
      setLoadingPeople(false);
    }
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  // Refresh follower/following counts every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      loadPeople();
    }, [refreshProfile, loadPeople])
  );

  useEffect(() => {
    if (activeTab === 'followers' || activeTab === 'following') {
      loadPeople();
    }
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadPosts(), refreshProfile(), loadPeople()]);
    setRefreshing(false);
  };

  // ── Like toggle ──
  const handleLike = async (postId: string) => {
    // Optimistic update
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    try {
      await postAPI.toggleLike(postId);
    } catch {
      // revert on failure
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
            : p
        )
      );
    }
  };

  // ── Follow toggle ──
  const handleFollowerFollow = async (id: string) => {
    const person = followers.find(f => f._id === id || f.id === id);
    if (!person) return;
    const wasFollowing = person.isFollowing;
    setFollowers(prev => prev.map(f =>
      (f._id === id || f.id === id) ? { ...f, isFollowing: !f.isFollowing } : f
    ));
    try {
      if (wasFollowing) await socialAPI.unfollow(id);
      else await socialAPI.follow(id);
    } catch {
      setFollowers(prev => prev.map(f =>
        (f._id === id || f.id === id) ? { ...f, isFollowing: wasFollowing } : f
      ));
    }
  };

  const handleFollowingUnfollow = async (id: string) => {
    const person = following.find(f => f._id === id || f.id === id);
    if (!person) return;
    const wasFollowing = person.isFollowing;
    setFollowing(prev => prev.map(f =>
      (f._id === id || f.id === id) ? { ...f, isFollowing: !f.isFollowing } : f
    ));

    const isMockId = /^\d+$/.test(id);
    if (isMockId) {
      // Remove from local storage
      try {
        const raw = await AsyncStorage.getItem('@kisan_mock_following');
        const list: any[] = raw ? JSON.parse(raw) : [];
        const updated = list.filter((f: any) => (f._id || f.id) !== id);
        await AsyncStorage.setItem('@kisan_mock_following', JSON.stringify(updated));
        setFollowing(prev => prev.filter(f => (f._id || f.id) !== id));
      } catch {}
      return;
    }

    try {
      if (wasFollowing) await socialAPI.unfollow(id);
      else await socialAPI.follow(id);
    } catch {
      setFollowing(prev => prev.map(f =>
        (f._id === id || f.id === id) ? { ...f, isFollowing: wasFollowing } : f
      ));
    }
  };

  // ── Add post ──
  const handleAddPost = async () => {
    if (!newCaption.trim()) return;
    setPostingLoading(true);
    try {
      const bgColor = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];
      const data = await postAPI.create({
        emoji:   selectedEmoji,
        caption: newCaption.trim(),
        bg:      bgColor,
      });
      if (data?.post) {
        const p = data.post;
        setPosts(prev => [{
          id:       p._id || p.id,
          emoji:    p.emoji    || selectedEmoji,
          bg:       p.bg       || bgColor,
          caption:  p.caption  || newCaption.trim(),
          likes:    0,
          comments: 0,
          liked:    false,
        }, ...prev]);
      }
      setNewCaption('');
      setShowAddPost(false);
      setActiveTab('posts');
    } catch {
      // offline fallback — add locally
      setPosts(prev => [{
        id:       Date.now().toString(),
        emoji:    selectedEmoji,
        bg:       BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)],
        caption:  newCaption.trim(),
        likes:    0,
        comments: 0,
        liked:    false,
      }, ...prev]);
      setNewCaption('');
      setShowAddPost(false);
    } finally {
      setPostingLoading(false);
    }
  };

  // ── Helpers ──
  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const getLocation = () =>
    [user?.village, user?.district, user?.state].filter(Boolean).join(', ') || '—';

  const formatStatCount = (n: number): string => {
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
  };

  // ── Render helpers ──

  const renderPostGrid = () => (
    <View style={styles.postGrid}>
      {loadingPosts ? (
        <View style={{ width: '100%', paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View style={{ width: '100%', paddingVertical: 40, alignItems: 'center', gap: 8 }}>
          <Ionicons name="images-outline" size={48} color="#D1D5DB" />
          <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '500' }}>{t('social.noPosts')}</Text>
        </View>
      ) : (
        posts.map(post => (
          <TouchableOpacity key={post.id} style={[styles.postCell, { backgroundColor: post.bg }]} activeOpacity={0.85}>
            <Text style={styles.postEmoji}>{post.emoji}</Text>
            <View style={styles.postOverlay}>
              <LikeButton liked={post.liked} count={post.likes} onPress={() => handleLike(post.id)} />
              <View style={styles.commentRow}>
                <Ionicons name="chatbubble-outline" size={14} color="#9CA3AF" />
                <Text style={styles.likeCount}>{post.comments}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderActivity = () => (
    <View style={styles.activityList}>
      {MOCK_ACTIVITIES.map(act => (
        <View key={act.id} style={styles.activityItem}>
          <View style={[styles.activityIcon, { backgroundColor: act.bg }]}>
            <Ionicons name={act.icon as any} size={18} color={act.color} />
          </View>
          <View style={styles.activityInfo}>
            <Text style={styles.activityText}>{t(act.textKey)}</Text>
            <Text style={styles.activityTime}>{act.time}</Text>
          </View>
          <View style={[styles.activityDot, { backgroundColor: act.color }]} />
        </View>
      ))}
    </View>
  );

  const renderPeopleList = (people: any[], onToggle: (id: string) => void) => (
    <View style={styles.peopleList}>
      {loadingPeople ? (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : people.length === 0 ? (
        <View style={{ paddingVertical: 40, alignItems: 'center', gap: 8 }}>
          <Ionicons name="people-outline" size={48} color="#D1D5DB" />
          <Text style={{ color: '#9CA3AF', fontSize: 14, fontWeight: '500' }}>{t('social.noUsers')}</Text>
        </View>
      ) : (
        people.map(person => {
          const pid = person._id || person.id;
          const loc = [person.village, person.district].filter(Boolean).join(', ') || '—';
          return (
            <View key={pid} style={styles.personRow}>
              <View style={styles.personAvatar}>
                {person.profileImage ? (
                  <Image source={{ uri: person.profileImage }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                ) : (
                  <Text style={styles.personEmoji}>👨‍🌾</Text>
                )}
              </View>
              <View style={styles.personInfo}>
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.personVillage}>{loc}</Text>
              </View>
              <FollowButton following={person.isFollowing || false} onPress={() => onToggle(pid)} />
            </View>
          );
        })
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >

        {/* ── SECTION 1: Cover + Profile Header ── */}
        <View style={styles.coverContainer}>
          <LinearGradient
            colors={['#1B5E20', '#2E7D32', '#66BB6A', '#A5D6A7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverGradient}
          >
            {/* Farm pattern overlay */}
            <View style={styles.coverPattern}>
              {['🌾', '🌿', '🌱', '🌻', '🍃'].map((e, i) => (
                <Text key={i} style={[styles.coverPatternEmoji, { opacity: 0.18 + i * 0.04, top: 10 + i * 14, left: 20 + i * 60 }]}>{e}</Text>
              ))}
            </View>

            {/* Back button */}
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={20} color={COLORS.white} />
            </TouchableOpacity>

            {/* More options */}
            <TouchableOpacity style={styles.moreBtn} activeOpacity={0.8}>
              <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Profile image */}
          <View style={styles.avatarWrapper}>
            <LinearGradient colors={['#1B5E20', '#43A047']} style={styles.avatarGrad}>
              {user?.profileImage ? (
                <Image source={{ uri: user.profileImage }} style={{ width: 80, height: 80, borderRadius: 40 }} />
              ) : (
                <Text style={styles.avatarEmoji}>
                  {user?.name ? getInitials(user.name) : '👨‍🌾'}
                </Text>
              )}
            </LinearGradient>
            <View style={styles.avatarVerified}>
              <Ionicons name="checkmark" size={10} color={COLORS.white} />
            </View>
            {isOwnProfile && (
              <TouchableOpacity style={styles.avatarEditBtn} activeOpacity={0.8} onPress={() => router.push('/edit-profile' as any)}>
                <Ionicons name="camera" size={12} color={COLORS.white} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Name + Location + Bio */}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || '—'}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-sharp" size={13} color={COLORS.primary} />
            <Text style={styles.locationText}>{getLocation()}</Text>
          </View>
          {user?.bio ? (
            <View style={styles.bioPill}>
              <Text style={styles.bioText}>🌾 {user.bio}</Text>
            </View>
          ) : (
            <View style={styles.bioPill}>
              <Text style={styles.bioText}>🌾 {t('social.bio')}</Text>
            </View>
          )}
        </View>

        {/* ── SECTION 2: Stats Bar ── */}
        <View style={styles.statsCard}>
          {[
            { value: String(user?.followersCount || 0), labelKey: 'social.followers', icon: 'people',     color: '#1565C0', bg: '#E3F2FD', gradColors: ['#E3F2FD', '#BBDEFB'] as [string,string] },
            { value: String(user?.followingCount || 0), labelKey: 'social.following', icon: 'person-add', color: '#7B1FA2', bg: '#F3E5F5', gradColors: ['#F3E5F5', '#E1BEE7'] as [string,string] },
            { value: String(posts.length),              labelKey: 'social.posts',     icon: 'images',     color: '#2E7D32', bg: '#E8F5E9', gradColors: ['#E8F5E9', '#C8E6C9'] as [string,string] },
          ].map((stat, i, arr) => (
            <React.Fragment key={stat.labelKey}>
              <TouchableOpacity
                style={styles.statItem}
                activeOpacity={0.75}
                onPress={() => {
                  if (stat.labelKey === 'social.followers') setActiveTab('followers');
                  else if (stat.labelKey === 'social.following') setActiveTab('following');
                  else setActiveTab('posts');
                }}
              >
                <LinearGradient colors={stat.gradColors} style={styles.statIconWrap}>
                  <Ionicons name={stat.icon as any} size={16} color={stat.color} />
                </LinearGradient>
                <Text style={[styles.statValue, { color: stat.color }]}>
                  {formatStatCount(Number(stat.value))}
                </Text>
                <Text style={styles.statLabel}>{t(stat.labelKey)}</Text>
              </TouchableOpacity>
              {i < arr.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── SECTION 3: Action Buttons ── */}
        <View style={styles.actionRow}>
          {isOwnProfile ? (
            <>
              <TouchableOpacity style={styles.editProfileBtn} activeOpacity={0.85} onPress={() => router.push('/edit-profile' as any)}>
                <Ionicons name="pencil" size={15} color={COLORS.primary} />
                <Text style={styles.editProfileText}>{t('social.editProfile')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareProfileBtn} activeOpacity={0.85}>
                <Ionicons name="share-social" size={15} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Animated.View style={[{ flex: 1 }, { transform: [{ scale: followBtnScale }] }]}>
                <TouchableOpacity
                  style={[styles.followMainBtn, isFollowing && styles.followingMainBtn]}
                  onPress={handleMainFollow}
                  activeOpacity={0.85}
                >
                  {isFollowing ? (
                    <>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                      <Text style={[styles.followMainText, { color: COLORS.primary }]}>{t('social.following')}</Text>
                    </>
                  ) : (
                    <LinearGradient colors={['#1B5E20', '#43A047']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.followGrad}>
                      <Ionicons name="person-add" size={16} color={COLORS.white} />
                      <Text style={[styles.followMainText, { color: COLORS.white }]}>{t('social.follow')}</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity style={styles.messageBtn} activeOpacity={0.85}>
                <Ionicons name="chatbubble-ellipses" size={16} color={COLORS.primary} />
                <Text style={styles.messageBtnText}>{t('social.message')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── SECTION 4: About Section ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconWrap, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="information-circle" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.sectionTitle}>{t('social.about')}</Text>
          </View>
          <View style={styles.aboutCard}>
            {[
              { icon: 'map',      color: '#F57F17', bg: '#FFF8E1', labelKey: 'social.landSize',   value: user?.farmSize   || '—' },
              { icon: 'leaf',     color: '#2E7D32', bg: '#E8F5E9', labelKey: 'social.cropsGrown', value: user?.cropsGrown || '—' },
              { icon: 'time',     color: '#1565C0', bg: '#E3F2FD', labelKey: 'social.experience', value: user?.experience || '—' },
              { icon: 'location', color: '#7B1FA2', bg: '#F3E5F5', labelKey: 'social.village',    value: getLocation() },
            ].map((item, idx, arr) => (
              <View key={item.labelKey} style={[styles.aboutRow, idx < arr.length - 1 && styles.aboutRowBorder]}>
                <View style={[styles.aboutIcon, { backgroundColor: item.bg }]}>
                  <Ionicons name={item.icon as any} size={16} color={item.color} />
                </View>
                <View style={styles.aboutTextWrap}>
                  <Text style={styles.aboutLabel}>{t(item.labelKey)}</Text>
                  <Text style={styles.aboutValue}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── SECTION 5–7: Tab Bar ── */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
            {([
              { key: 'posts', icon: 'grid', labelKey: 'social.posts' },
              { key: 'activity', icon: 'pulse', labelKey: 'social.activity' },
              { key: 'followers', icon: 'people', labelKey: 'social.followers' },
              { key: 'following', icon: 'person-add', labelKey: 'social.following' },
            ] as { key: TabType; icon: string; labelKey: string }[]).map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={15}
                  color={activeTab === tab.key ? COLORS.white : COLORS.textSecondary}
                />
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {t(tab.labelKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'posts' && renderPostGrid()}
          {activeTab === 'activity' && renderActivity()}
          {activeTab === 'followers' && renderPeopleList(followers, handleFollowerFollow)}
          {activeTab === 'following' && renderPeopleList(following, handleFollowingUnfollow)}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── SECTION 8: Floating Add Post Button ── */}
      {isOwnProfile && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowAddPost(true)} activeOpacity={0.85}>
          <LinearGradient colors={['#1B5E20', '#43A047']} style={styles.fabGrad}>
            <Ionicons name="add" size={28} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* ── Add Post Modal ── */}
      <Modal visible={showAddPost} animationType="slide" transparent presentationStyle="overFullScreen">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('social.addPost')}</Text>
              <TouchableOpacity onPress={() => setShowAddPost(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Emoji picker */}
            <Text style={styles.modalLabel}>{t('social.selectEmoji')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiScroll}>
              {CROP_EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[styles.emojiBtn, selectedEmoji === e && styles.emojiBtnActive]}
                  onPress={() => setSelectedEmoji(e)}
                >
                  <Text style={styles.emojiText}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Preview */}
            <View style={styles.postPreview}>
              <View style={[styles.postPreviewEmoji, { backgroundColor: '#E8F5E9' }]}>
                <Text style={{ fontSize: 40 }}>{selectedEmoji}</Text>
              </View>
            </View>

            {/* Caption */}
            <Text style={styles.modalLabel}>{t('social.caption')}</Text>
            <TextInput
              style={styles.captionInput}
              placeholder={t('social.captionPlaceholder')}
              placeholderTextColor="#9CA3AF"
              value={newCaption}
              onChangeText={setNewCaption}
              multiline
              maxLength={150}
            />
            <Text style={styles.charCount}>{newCaption.length}/150</Text>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.postSubmitBtn, (!newCaption.trim() || postingLoading) && { opacity: 0.5 }]}
              onPress={handleAddPost}
              disabled={!newCaption.trim() || postingLoading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#1B5E20', '#43A047']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.postSubmitGrad}>
                {postingLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={18} color={COLORS.white} />
                    <Text style={styles.postSubmitText}>{t('social.sharePost')}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F4F6F8' },

  // ── Cover ──
  coverContainer: { position: 'relative', marginBottom: 50 },
  coverGradient: { height: 180, width: '100%', overflow: 'hidden' },
  coverPattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  coverPatternEmoji: { position: 'absolute', fontSize: 36 },
  backBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 40, left: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  moreBtn: {
    position: 'absolute', top: Platform.OS === 'ios' ? 50 : 40, right: 16,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarWrapper: {
    position: 'absolute', bottom: -44, left: 20,
    width: 88, height: 88,
  },
  avatarGrad: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 4, borderColor: '#FFFFFF',
    ...SHADOW.lg,
  },
  avatarEmoji: { fontSize: 40 },
  avatarVerified: {
    position: 'absolute', bottom: 4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#F9A825',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },
  avatarEditBtn: {
    position: 'absolute', top: 0, right: 0,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#FFFFFF',
  },

  // ── Profile Info ──
  profileInfo: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: -4,
    ...SHADOW.sm,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3,
  },
  locationText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  bioPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0FBF1',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 4,
    marginTop: 6,
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  bioText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  // ── Stats ──
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    paddingVertical: 18,
    ...SHADOW.md,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 6 },
  statIconWrap: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginBottom: 2,
  },
  statValue: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.2 },
  statDivider: { width: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },

  // ── Action Buttons ──
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
  },
  editProfileBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5, borderColor: COLORS.primary,
    ...SHADOW.sm,
  },
  editProfileText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  shareProfileBtn: {
    width: 44, height: 44, borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    ...SHADOW.sm,
  },
  followMainBtn: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  followingMainBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5, borderColor: COLORS.primary,
    paddingVertical: 11,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  followGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 11,
  },
  followMainText: { fontSize: 14, fontWeight: '700' },
  messageBtn: {
    flex: 1,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 11,
    borderRadius: RADIUS.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    ...SHADOW.sm,
  },
  messageBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.primary },

  // ── Section ──
  section: { paddingHorizontal: SPACING.md, marginTop: SPACING.md },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm,
  },
  sectionIconWrap: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: '#111827', letterSpacing: -0.2 },

  // ── About ──
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOW.sm,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  aboutRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: 12, paddingHorizontal: SPACING.md,
  },
  aboutRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  aboutIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  aboutTextWrap: { flex: 1 },
  aboutLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 1 },
  aboutValue: { fontSize: 14, fontWeight: '600', color: '#111827' },

  // ── Tabs ──
  tabScroll: { marginBottom: 2 },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: RADIUS.full,
    backgroundColor: '#FFFFFF',
    marginRight: SPACING.sm,
    borderWidth: 1, borderColor: '#E5E7EB',
    ...SHADOW.sm,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white },
  tabContent: { paddingHorizontal: SPACING.md, marginTop: SPACING.sm },

  // ── Post Grid ──
  postGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs,
  },
  postCell: {
    width: POST_SIZE, height: POST_SIZE,
    borderRadius: RADIUS.sm,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  postEmoji: { fontSize: 36 },
  postOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 6, paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.88)',
  },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  likeCount: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },
  commentRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  // ── Activity ──
  activityList: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOW.sm,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  activityItem: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: 12, paddingHorizontal: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  activityIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  activityInfo: { flex: 1 },
  activityText: { fontSize: 14, fontWeight: '600', color: '#111827' },
  activityTime: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  activityDot: { width: 8, height: 8, borderRadius: 4 },

  // ── People List ──
  peopleList: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOW.sm,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  personRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingVertical: 12, paddingHorizontal: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  personAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#E8F5E9',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#C8E6C9',
  },
  personEmoji: { fontSize: 24 },
  personInfo: { flex: 1 },
  personName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  personVillage: { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  followBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    ...SHADOW.sm,
  },
  followingBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  followBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  followingBtnText: { color: COLORS.primary },

  // ── FAB ──
  fab: {
    position: 'absolute', bottom: 90, right: 20,
    width: 58, height: 58, borderRadius: 29,
    overflow: 'hidden',
    ...SHADOW.lg,
  },
  fabGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // ── Add Post Modal ──
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingTop: 12,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  modalClose: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 8 },
  emojiScroll: { marginBottom: SPACING.md },
  emojiBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 8,
    borderWidth: 2, borderColor: 'transparent',
  },
  emojiBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E8F5E9',
  },
  emojiText: { fontSize: 22 },
  postPreview: {
    alignItems: 'center', marginBottom: SPACING.md,
  },
  postPreviewEmoji: {
    width: 100, height: 100, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOW.sm,
  },
  captionInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: RADIUS.sm,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 14, color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 4,
  },
  charCount: { fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginBottom: SPACING.md },
  postSubmitBtn: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  postSubmitGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14,
  },
  postSubmitText: { fontSize: 15, fontWeight: '800', color: COLORS.white },
});
