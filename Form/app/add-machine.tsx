import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/theme';
import { MACHINE_TYPES, TYPE_EMOJIS } from '../constants/machineStore';
import { machineAPI, getToken } from '../services/api';
import PageHeader from '../components/PageHeader';
import { toastService } from '../services/toastService';

const TYPE_COLORS: Record<string, string> = {
  tractor: '#1B5E20', rotavator: '#1565C0', harvester: '#E65100',
  pump: '#0277BD', thresher: '#6A1B9A', other: '#37474F',
};

function TypeChip({ tp, selected, onPress, label }: {
  tp: string; selected: boolean; onPress: () => void; label: string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(scale, { toValue: 0.93, useNativeDriver: true, speed: 40 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 40 }).start();
  const accent = TYPE_COLORS[tp] || '#1B5E20';
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[tc.chip, selected && { backgroundColor: accent, borderColor: accent }]}
        onPress={onPress} onPressIn={onIn} onPressOut={onOut} activeOpacity={1}>
        <Text style={tc.emoji}>{TYPE_EMOJIS[tp]}</Text>
        <Text style={[tc.label, selected && { color: '#FFF' }]}>{label}</Text>
        {selected && <View style={tc.check}><Ionicons name="checkmark" size={10} color="#FFF" /></View>}
      </TouchableOpacity>
    </Animated.View>
  );
}
const tc = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, backgroundColor: '#F8FAFB', borderWidth: 1.5, borderColor: '#E0E7EF' },
  emoji: { fontSize: 18 },
  label: { fontSize: 12, fontWeight: '700', color: '#607D8B' },
  check: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
});

export default function AddMachineScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [name, setName]       = useState('');
  const [type, setType]       = useState('tractor');
  const [saving, setSaving]   = useState(false);
  const [focused, setFocused] = useState(false);
  const accent = TYPE_COLORS[type] || '#1B5E20';

  const save = async () => {
    if (!name.trim()) { toastService.error('Enter machine name'); return; }
    const token = await getToken();
    if (!token) { toastService.loginRequired('Machine Tracker'); return; }
    setSaving(true);
    try {
      await machineAPI.add(name.trim(), type, TYPE_EMOJIS[type] ?? '🛠️');
      toastService.machineAdded(name.trim());
      router.back();
    } catch (err: any) {
      toastService.error(t('machine.deleteFailed'), err?.message || 'Unknown error');
    } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <PageHeader
          title={t('machine.addMachineTitle')}
          subtitle={`${TYPE_EMOJIS[type]}  ${t(`machine.types.${type}`)}`}
          onBack={() => router.back()}
          iconName="construct"
          iconColor={accent}
          iconBg={accent + '18'}
        />

        <ScrollView style={s.scroll} contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Name */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.cardIcon, { backgroundColor: '#E8F5E9' }]}>
                <Ionicons name="construct-outline" size={16} color={COLORS.primary} />
              </View>
              <Text style={s.cardTitle}>{t('machine.machineName')}</Text>
            </View>
            <View style={[s.inputWrap, focused && s.inputFocused]}>
              <View style={s.inputIconBox}>
                <Ionicons name="construct-outline" size={15} color={focused ? COLORS.primary : '#90A4AE'} />
              </View>
              <TextInput style={s.input} value={name} onChangeText={setName}
                placeholder={t('machine.machineNamePlaceholder')} placeholderTextColor="#B0BEC5"
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} returnKeyType="done" />
              {name.length > 0 && (
                <TouchableOpacity onPress={() => setName('')}>
                  <Ionicons name="close-circle" size={16} color="#B0BEC5" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Type */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <View style={[s.cardIcon, { backgroundColor: accent + '18' }]}>
                <Ionicons name="grid-outline" size={16} color={accent} />
              </View>
              <Text style={s.cardTitle}>{t('machine.machineType')}</Text>
            </View>
            <View style={s.chipGrid}>
              {MACHINE_TYPES.map(tp => (
                <TypeChip key={tp} tp={tp} selected={type === tp}
                  label={t(`machine.types.${tp}`)} onPress={() => setType(tp)} />
              ))}
            </View>
          </View>

          {/* Preview */}
          <LinearGradient colors={[accent, accent + 'BB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.preview}>
            <View style={s.previewEmoji}><Text style={{ fontSize: 28 }}>{TYPE_EMOJIS[type]}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.previewName}>{name.trim() || t('machine.machineNamePlaceholder')}</Text>
              <Text style={s.previewType}>{t(`machine.types.${type}`)}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color="rgba(255,255,255,0.6)" />
          </LinearGradient>

          {/* Save */}
          <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.7 }]}
            onPress={save} activeOpacity={0.85} disabled={saving}>
            <LinearGradient colors={['#1B5E20', '#43A047']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveGrad}>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={s.saveTxt}>{saving ? 'Saving...' : t('machine.save')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 18, gap: 14 },
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFB', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 13, borderWidth: 1.5, borderColor: '#E0E7EF' },
  inputFocused: { borderColor: COLORS.primary, backgroundColor: '#FFF' },
  inputIconBox: { width: 28, height: 28, borderRadius: 9, backgroundColor: '#ECEFF1', alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontSize: 15, color: '#1A1A2E', padding: 0, fontWeight: '600' },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preview: { borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  previewEmoji: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  previewName: { fontSize: 16, fontWeight: '800', color: '#FFF', letterSpacing: -0.2 },
  previewType: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2, fontWeight: '600' },
  saveBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  saveGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  saveTxt: { fontSize: 16, fontWeight: '800', color: '#FFF' },
});
