import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { COLORS } from '../constants/theme';
import { machineAPI } from '../services/api';
import { Toast } from '../components/Toast';
import PageHeader from '../components/PageHeader';

// ── Focused Input ─────────────────────────────────────────────────────────────
function FocusInput({ label, value, onChange, placeholder, icon, iconBg, iconColor, prefix, suffix, keyboardType, multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; icon: string; iconBg: string; iconColor: string;
  prefix?: string; suffix?: string; keyboardType?: any; multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fi.wrap}>
      {label ? <Text style={fi.label}>{label}</Text> : null}
      <View style={[fi.row, focused && fi.rowFocused, { borderColor: focused ? iconColor : '#E0E7EF' }]}>
        <View style={[fi.iconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={15} color={iconColor} />
        </View>
        {prefix ? <Text style={[fi.prefix, { color: iconColor }]}>{prefix}</Text> : null}
        <TextInput
          style={[fi.input, multiline && { height: 60, textAlignVertical: 'top' }]}
          value={value} onChangeText={onChange} placeholder={placeholder}
          placeholderTextColor="#B0BEC5" keyboardType={keyboardType || 'default'}
          multiline={multiline} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        {suffix ? <Text style={fi.suffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}
const fi = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '700', color: '#78909C', marginBottom: 5, letterSpacing: 0.4, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8FAFB', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 12, borderWidth: 1.5 },
  rowFocused: { backgroundColor: '#FFF' },
  iconBox: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  prefix: { fontSize: 15, fontWeight: '800' },
  input: { flex: 1, fontSize: 15, color: '#1A1A2E', padding: 0, fontWeight: '600' },
  suffix: { fontSize: 12, color: '#90A4AE', fontWeight: '600' },
});

// ── Section Card ──────────────────────────────────────────────────────────────
function SCard({ icon, iconBg, iconColor, title, children }: {
  icon: string; iconBg: string; iconColor: string; title: string; children: React.ReactNode;
}) {
  return (
    <View style={sc.card}>
      <View style={sc.header}>
        <View style={[sc.iconWrap, { backgroundColor: iconBg }]}>
          <Ionicons name={icon as any} size={16} color={iconColor} />
        </View>
        <Text style={sc.title}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
const sc = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '800', color: '#1A1A2E' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function AddEntryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { machineId, machineName, machineEmoji } = useLocalSearchParams<{
    machineId: string; machineName: string; machineEmoji: string;
  }>();
  const machine = { id: machineId, name: machineName || 'Machine', emoji: machineEmoji || '🚜' };

  const [farmerName, setFarmerName] = useState('');
  const [address, setAddress]       = useState('');
  const [pricePerHour, setPph]      = useState('');
  const [hrs, setHrs]               = useState('');
  const [mins, setMins]             = useState('');

  const totalHours        = (parseFloat(hrs) || 0) + (parseFloat(mins) || 0) / 60;
  const totalHoursDisplay = parseFloat(totalHours.toFixed(2));
  const amount            = totalHoursDisplay * (parseFloat(pricePerHour) || 0);
  const ready             = totalHoursDisplay > 0 && amount > 0 && farmerName.trim().length > 0;

  // Result card animation
  const resultAnim = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.spring(resultAnim, { toValue: ready ? 1 : 0, useNativeDriver: true, speed: 18, bounciness: 5 }).start();
  }, [ready]);

  const save = async () => {
    if (!ready) return;
    if (!machine.id) { Toast.show({ type: 'error', text1: 'Machine ID missing' }); return; }
    try {
      await machineAPI.addEntry(machine.id, farmerName.trim(), address.trim(),
        parseFloat(pricePerHour) || 0, totalHoursDisplay, Math.round(amount));
      Toast.show({ type: 'success', text1: t('machine.entrySaved'),
        text2: `${farmerName.trim()} — ₹${Math.round(amount).toLocaleString('en-IN')}`, visibilityTime: 2500 });
      router.back();
    } catch (err: any) {
      Toast.show({ type: 'error', text1: t('machine.deleteFailed'), text2: err?.message || 'Unknown error' });
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        <PageHeader
          title={t('machine.newEntry')}
          subtitle={`${machine.emoji}  ${machine.name}`}
          onBack={() => router.back()}
          iconName="document-text"
          iconColor="#1565C0"
          iconBg="#E3F2FD"
        />

        {/* Live strip — shown when hours + amount are ready */}
        {ready && (
          <View style={s.liveStrip}>
            <View style={s.liveItem}>
              <Ionicons name="time-outline" size={13} color={COLORS.primary} />
              <Text style={s.liveVal}>{totalHoursDisplay} {t('machine.hrs')}</Text>
              <Text style={s.liveLbl}>{t('machine.totalHours')}</Text>
            </View>
            <View style={s.liveDiv} />
            <View style={s.liveItem}>
              <Ionicons name="cash-outline" size={13} color="#D97706" />
              <Text style={[s.liveVal, { color: '#D97706' }]}>₹{Math.round(amount).toLocaleString('en-IN')}</Text>
              <Text style={s.liveLbl}>{t('machine.totalAmount')}</Text>
            </View>
          </View>
        )}

        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

          {/* Farmer Info */}
          <SCard icon="person-outline" iconBg="#E8F5E9" iconColor={COLORS.primary} title={t('machine.farmerName')}>
            <FocusInput label={t('machine.farmerName')} value={farmerName} onChange={setFarmerName}
              placeholder="Ramesh Patel" icon="person-outline" iconBg="#E8F5E9" iconColor={COLORS.primary} />
            <FocusInput label={t('machine.address')} value={address} onChange={setAddress}
              placeholder="Village / Address" icon="location-outline" iconBg="#FFF8E1" iconColor="#F57F17" />
          </SCard>

          {/* Price */}
          <SCard icon="pricetag-outline" iconBg="#FFF8E1" iconColor="#F57F17" title={t('machine.pricePerHour')}>
            <FocusInput label="" value={pricePerHour} onChange={setPph}
              placeholder="500" icon="cash-outline" iconBg="#FFF8E1" iconColor="#F57F17"
              prefix="₹" suffix="/hr" keyboardType="numeric" />
          </SCard>

          {/* Hours Worked */}
          <SCard icon="time-outline" iconBg="#E3F2FD" iconColor="#1565C0" title={t('machine.hrsWorked')}>
            {/* Hint */}
            <View style={s.hint}>
              <Ionicons name="information-circle-outline" size={13} color={COLORS.primary} />
              <Text style={s.hintTxt}>{t('machine.hint')}</Text>
            </View>

            {/* Hours + Minutes */}
            <View style={s.timeRow}>
              <View style={s.timeField}>
                <Text style={s.timeFieldLbl}>{t('machine.hours')}</Text>
                <View style={s.timeInput}>
                  <View style={[s.timeIcon, { backgroundColor: '#E3F2FD' }]}>
                    <Ionicons name="time-outline" size={14} color="#1565C0" />
                  </View>
                  <TextInput style={s.timeDigit} value={hrs}
                    onChangeText={v => setHrs(v.replace(/\D/g, '').slice(0, 3))}
                    placeholder="0" placeholderTextColor="#B0BEC5"
                    keyboardType="number-pad" maxLength={3} />
                  <Text style={s.timeUnit}>hr</Text>
                </View>
              </View>
              <View style={s.timeSep}><Text style={s.timeSepTxt}>+</Text></View>
              <View style={s.timeField}>
                <Text style={s.timeFieldLbl}>{t('machine.minutes')}</Text>
                <View style={s.timeInput}>
                  <View style={[s.timeIcon, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="hourglass-outline" size={14} color={COLORS.primary} />
                  </View>
                  <TextInput style={s.timeDigit} value={mins}
                    onChangeText={v => { const n = parseInt(v.replace(/\D/g, '')); setMins(isNaN(n) ? '' : Math.min(59, n).toString()); }}
                    placeholder="0" placeholderTextColor="#B0BEC5"
                    keyboardType="number-pad" maxLength={2} />
                  <Text style={s.timeUnit}>min</Text>
                </View>
              </View>
            </View>

            {/* Quick presets */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={s.presets}>
                {[1, 2, 3, 4, 5, 6, 8, 10].map(h => (
                  <TouchableOpacity key={h}
                    style={[s.preset, hrs === String(h) && mins === '' && s.presetOn]}
                    onPress={() => { setHrs(String(h)); setMins(''); }} activeOpacity={0.8}>
                    <Text style={[s.presetTxt, hrs === String(h) && mins === '' && s.presetTxtOn]}>{h}h</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Result card */}
            <Animated.View style={{ opacity: resultAnim, transform: [{ scale: resultAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
              {ready && (
                <LinearGradient colors={['#E8F5E9', '#F1F8E9']} style={s.resultCard}>
                  <View style={s.resultRow}>
                    <View style={s.resultItem}>
                      <View style={s.resultIcon}><Ionicons name="time" size={18} color={COLORS.primary} /></View>
                      <View>
                        <Text style={s.resultLbl}>{t('machine.totalHours')}</Text>
                        <Text style={s.resultVal}>{totalHoursDisplay} {t('machine.hrs')}</Text>
                      </View>
                    </View>
                    <View style={s.resultDivider} />
                    <View style={s.resultItem}>
                      <View style={[s.resultIcon, { backgroundColor: 'rgba(46,125,50,0.12)' }]}>
                        <Ionicons name="cash" size={18} color={COLORS.primary} />
                      </View>
                      <View>
                        <Text style={s.resultLbl}>{t('machine.totalAmount')}</Text>
                        <Text style={[s.resultVal, { fontSize: 22, color: COLORS.primary }]}>
                          ₹{Math.round(amount).toLocaleString('en-IN')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              )}
            </Animated.View>
          </SCard>

          {/* Save */}
          <TouchableOpacity style={[s.saveBtn, !ready && s.saveBtnOff]}
            onPress={save} activeOpacity={0.85} disabled={!ready}>
            <LinearGradient colors={ready ? ['#1B5E20', '#43A047'] : ['#9E9E9E', '#BDBDBD']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.saveGrad}>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={s.saveTxt}>{t('machine.addEntry')}</Text>
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
  liveStrip: {
    flexDirection: 'row', backgroundColor: '#F0FBF1',
    borderBottomWidth: 1, borderBottomColor: '#E6F4EA',
    paddingVertical: 10,
  },
  liveItem: { flex: 1, alignItems: 'center', gap: 2 },
  liveVal: { fontSize: 14, fontWeight: '800', color: '#111827' },
  liveLbl: { fontSize: 9, color: '#6B7280', fontWeight: '500' },
  liveDiv: { width: 1, backgroundColor: '#D1FAE5', marginVertical: 4 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 18, gap: 14 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 10, marginBottom: 12 },
  hintTxt: { flex: 1, fontSize: 11, color: COLORS.primary, fontWeight: '500' },
  timeRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 12 },
  timeField: { flex: 1 },
  timeFieldLbl: { fontSize: 11, fontWeight: '700', color: '#78909C', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 },
  timeInput: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F8FAFB', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 12, borderWidth: 1.5, borderColor: '#E0E7EF' },
  timeIcon: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  timeDigit: { flex: 1, fontSize: 22, fontWeight: '800', color: '#1A1A2E', textAlign: 'center', padding: 0 },
  timeUnit: { fontSize: 12, color: '#90A4AE', fontWeight: '600' },
  timeSep: { paddingBottom: 14, alignItems: 'center' },
  timeSepTxt: { fontSize: 22, fontWeight: '800', color: '#90A4AE' },
  presets: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  preset: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F0F4F8', borderWidth: 1.5, borderColor: '#E0E7EF' },
  presetOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  presetTxt: { fontSize: 13, fontWeight: '700', color: '#607D8B' },
  presetTxtOn: { color: '#FFF' },
  resultCard: { borderRadius: 16, padding: 16 },
  resultRow: { flexDirection: 'row', alignItems: 'center' },
  resultItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center' },
  resultIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(46,125,50,0.1)', alignItems: 'center', justifyContent: 'center' },
  resultLbl: { fontSize: 11, color: '#78909C', fontWeight: '600' },
  resultVal: { fontSize: 16, fontWeight: '800', color: '#1A1A2E', marginTop: 2 },
  resultDivider: { width: 1, backgroundColor: '#C8E6C9', marginVertical: 4, alignSelf: 'stretch' },
  saveBtn: { borderRadius: 16, overflow: 'hidden', shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  saveBtnOff: { opacity: 0.5 },
  saveGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  saveTxt: { fontSize: 16, fontWeight: '800', color: '#FFF' },
});
