import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING, FONT_SIZE, RADIUS, SHADOW } from '../constants/theme';
import { userAPI, saveUser } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Reusable Field ────────────────────────────────────────────────────────────
function Field({
  label, value, onChange, placeholder, icon,
  iconColor = COLORS.primary, keyboardType = 'default',
  maxLength, multiline = false,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; icon: string; iconColor?: string;
  keyboardType?: any; maxLength?: number; multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <View style={[f.row, focused && f.rowFocused, multiline && f.rowMulti]}>
        <View style={[f.iconWrap, { backgroundColor: iconColor + '18' }]}>
          <Ionicons name={icon as any} size={16} color={iconColor} />
        </View>
        <TextInput
          style={[f.input, multiline && f.inputMulti]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {!multiline && value.length > 0 && (
          <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
        )}
      </View>
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { marginBottom: SPACING.md },
  label: {
    fontSize: FONT_SIZE.xs, fontWeight: '700',
    color: COLORS.textSecondary, marginBottom: 5, letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.background, borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm, paddingVertical: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  rowFocused: { borderColor: COLORS.primary, backgroundColor: COLORS.white },
  rowMulti: { alignItems: 'flex-start', paddingVertical: SPACING.sm },
  iconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.text, padding: 0 },
  inputMulti: { minHeight: 72, paddingTop: 4 },
});

// ── Screen ────────────────────────────────────────────────────────────────────
export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, setUser } = useAuth();

  const [name,         setName]         = useState(user?.name         || '');
  const [village,      setVillage]      = useState(user?.village      || '');
  const [district,     setDistrict]     = useState(user?.district     || '');
  const [state,        setState]        = useState(user?.state        || '');
  const [bio,          setBio]          = useState(user?.bio          || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [coverImage,   setCoverImage]   = useState((user as any)?.coverImage   || '');
  const [farmSize,     setFarmSize]     = useState((user as any)?.farmSize     || '');
  const [cropsGrown,   setCropsGrown]   = useState((user as any)?.cropsGrown   || '');
  const [experience,   setExperience]   = useState((user as any)?.experience   || '');

  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isValid = name.trim().length > 1;

  const handleSave = async () => {
    if (!isValid) {
      setErrorMsg(t('editProfile.nameRequired'));
      return;
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const data = await userAPI.updateProfile({
        name:         name.trim(),
        village:      village.trim(),
        district:     district.trim(),
        state:        state.trim(),
        bio:          bio.trim(),
        profileImage: profileImage.trim(),
        coverImage:   coverImage.trim(),
        farmSize:     farmSize.trim(),
        cropsGrown:   cropsGrown.trim(),
        experience:   experience.trim(),
      });

      if (data?.user) {
        const u = data.user;
        const updated = {
          id:             u._id || u.id || user?.id || '',
          name:           u.name         || '',
          email:          u.email        || user?.email || '',
          village:        u.village      || '',
          district:       u.district     || '',
          state:          u.state        || '',
          bio:            u.bio          || '',
          profileImage:   u.profileImage || '',
          coverImage:     u.coverImage   || '',
          language:       u.language     || 'gu',
          farmSize:       u.farmSize     || '',
          cropsGrown:     u.cropsGrown   || '',
          experience:     u.experience   || '',
          followersCount: Array.isArray(u.followers) ? u.followers.length : (user as any)?.followersCount || 0,
          followingCount: Array.isArray(u.following) ? u.following.length : (user as any)?.followingCount || 0,
        };
        setUser(updated as any);
        await saveUser(updated);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.back();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || t('editProfile.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={18} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>{t('editProfile.title')}</Text>
            <View style={{ width: 36 }} />
          </View>

          {/* Avatar preview */}
          <View style={s.avatarSection}>
            <LinearGradient colors={[COLORS.primary, '#43A047']} style={s.avatarCircle}>
              <Text style={s.avatarText}>
                {name.trim()
                  ? name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                  : '?'}
              </Text>
            </LinearGradient>
            <Text style={s.avatarHint}>{t('editProfile.avatarHint')}</Text>
          </View>

          {/* Form card */}
          <View style={s.card}>
            <Field
              label={t('editProfile.name')}
              value={name}
              onChange={setName}
              placeholder={t('editProfile.namePlaceholder')}
              icon="person"
              iconColor={COLORS.primary}
            />
            <Field
              label={t('editProfile.village')}
              value={village}
              onChange={setVillage}
              placeholder={t('editProfile.villagePlaceholder')}
              icon="home"
              iconColor="#F57F17"
            />
            <Field
              label={t('editProfile.district')}
              value={district}
              onChange={setDistrict}
              placeholder={t('editProfile.districtPlaceholder')}
              icon="business"
              iconColor="#1565C0"
            />
            <Field
              label={t('editProfile.state')}
              value={state}
              onChange={setState}
              placeholder={t('editProfile.statePlaceholder')}
              icon="map"
              iconColor="#7B1FA2"
            />
            <Field
              label={t('editProfile.bio')}
              value={bio}
              onChange={setBio}
              placeholder={t('editProfile.bioPlaceholder')}
              icon="document-text"
              iconColor="#00796B"
              maxLength={200}
              multiline
            />
            <Field
              label={t('editProfile.profileImageUrl')}
              value={profileImage}
              onChange={setProfileImage}
              placeholder="https://..."
              icon="image"
              iconColor="#C62828"
            />
            <Field
              label={t('editProfile.coverImageUrl')}
              value={coverImage}
              onChange={setCoverImage}
              placeholder="https://..."
              icon="image-outline"
              iconColor="#7B1FA2"
            />
            <Field
              label={t('editProfile.farmSize')}
              value={farmSize}
              onChange={setFarmSize}
              placeholder={t('editProfile.farmSizePlaceholder')}
              icon="map"
              iconColor="#F57F17"
            />
            <Field
              label={t('editProfile.cropsGrown')}
              value={cropsGrown}
              onChange={setCropsGrown}
              placeholder={t('editProfile.cropsGrownPlaceholder')}
              icon="leaf"
              iconColor="#2E7D32"
            />
            <Field
              label={t('editProfile.experience')}
              value={experience}
              onChange={setExperience}
              placeholder={t('editProfile.experiencePlaceholder')}
              icon="time"
              iconColor="#1565C0"
            />

            {/* Error */}
            {errorMsg ? (
              <View style={s.errorWrap}>
                <Ionicons name="alert-circle" size={15} color={COLORS.red} />
                <Text style={s.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Success */}
            {success ? (
              <View style={s.successWrap}>
                <Ionicons name="checkmark-circle" size={15} color={COLORS.primary} />
                <Text style={s.successText}>{t('editProfile.saveSuccess')}</Text>
              </View>
            ) : null}

            {/* Save button */}
            <TouchableOpacity
              style={[s.btn, !isValid && s.btnDisabled]}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={!isValid || loading}
            >
              <LinearGradient
                colors={isValid ? ['#1B5E20', '#2E7D32', '#43A047'] : ['#9E9E9E', '#BDBDBD']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.btnGrad}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={18} color={COLORS.white} />
                    <Text style={s.btnText}>{t('editProfile.save')}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={s.cancelBtn} onPress={() => router.back()} activeOpacity={0.7}>
              <Text style={s.cancelText}>{t('editProfile.cancel')}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center',
    ...SHADOW.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg, fontWeight: '800',
    color: COLORS.text, letterSpacing: -0.3,
  },

  avatarSection: { alignItems: 'center', marginVertical: SPACING.lg },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOW.md,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: COLORS.white },
  avatarHint: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: '500' },

  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: SPACING.lg, ...SHADOW.md,
  },

  errorWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.redBg, borderRadius: RADIUS.sm,
    padding: SPACING.sm, marginBottom: SPACING.md,
  },
  errorText: { fontSize: FONT_SIZE.sm, color: COLORS.red, fontWeight: '600', flex: 1 },

  successWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.primaryBg, borderRadius: RADIUS.sm,
    padding: SPACING.sm, marginBottom: SPACING.md,
  },
  successText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600', flex: 1 },

  btn: { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.sm, ...SHADOW.md },
  btnDisabled: { opacity: 0.55 },
  btnGrad: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: SPACING.sm,
    paddingVertical: SPACING.md + 2,
  },
  btnText: { fontSize: FONT_SIZE.lg, fontWeight: '800', color: COLORS.white },

  cancelBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  cancelText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: '600' },
});
