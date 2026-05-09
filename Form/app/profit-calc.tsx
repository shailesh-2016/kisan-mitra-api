import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, KeyboardAvoidingView, Platform,
  ActivityIndicator, RefreshControl, Animated, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import { COLORS } from '../constants/theme';
import { profitAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import { useTheme } from '../context/ThemeContext';

const { width: SW } = Dimensions.get('window');
void SW; // suppress unused warning

// ── Types ─────────────────────────────────────────────────────────────────────
interface CalcResult {
  id: string; crop: string; date: string;
  totalCost: number; totalIncome: number;
  netProfit: number; perAcreProfit: number | null;
}

const CROP_KEYS = [
  'wheat','rice','cotton','mustard','gram','soyabean',
  'tomato','potato','onion','corn','sugarcane','groundnut',
];
const CROP_EMOJIS: Record<string,string> = {
  wheat:'🌾', rice:'🍚', cotton:'🌿', mustard:'🌻', gram:'🫘', soyabean:'🟤',
  tomato:'🍅', potato:'🥔', onion:'🧅', corn:'🌽', sugarcane:'🎋', groundnut:'🥜',
};

// ── SmartInput ────────────────────────────────────────────────────────────────
function SmartInput({ label, value, onChange, placeholder, icon, accent = COLORS.primary, prefix }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; icon: string; accent?: string; prefix?: string;
}) {
  const [focused, setFocused] = useState(false);
  const { theme } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const onFocus = () => { setFocused(true); Animated.spring(anim, { toValue: 1, useNativeDriver: false, speed: 30 }).start(); };
  const onBlur  = () => { setFocused(false); Animated.spring(anim, { toValue: 0, useNativeDriver: false, speed: 30 }).start(); };
  const borderColor = anim.interpolate({ inputRange: [0,1], outputRange: [COLORS.border, accent] });
  return (
    <View style={si.wrap}>
      <Text style={[si.label, { color: theme.textSecondary }]}>{label}</Text>
      <Animated.View style={[si.row, { backgroundColor: theme.inputBg, borderColor }]}>
        <View style={[si.iconBox, { backgroundColor: accent + '18' }]}>
          <Ionicons name={icon as any} size={14} color={accent} />
        </View>
        {prefix && <Text style={[si.prefix, { color: accent }]}>{prefix}</Text>}
        <TextInput style={[si.input, { color: theme.text }]} value={value} onChangeText={onChange}
          placeholder={placeholder} placeholderTextColor="#B0BEC5"
          keyboardType="numeric" onFocus={onFocus} onBlur={onBlur} />
      </Animated.View>
    </View>
  );
}
const si = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 11, fontWeight: '700', color: '#78909C', marginBottom: 5, letterSpacing: 0.4, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F8FAFB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, borderWidth: 1.5 },
  iconBox: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  prefix: { fontSize: 15, fontWeight: '800' },
  input: { flex: 1, fontSize: 15, color: '#1A1A2E', padding: 0, fontWeight: '600' },
});

// ── SectionCard ───────────────────────────────────────────────────────────────
function SectionCard({ title, icon, accent = COLORS.primary, children }: {
  title: string; icon: string; accent?: string; children: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View style={[sc.card, { backgroundColor: theme.surface }]}>
      <View style={sc.header}>
        <View style={[sc.iconWrap, { backgroundColor: accent + '18' }]}>
          <Ionicons name={icon as any} size={16} color={accent} />
        </View>
        <Text style={[sc.title, { color: theme.text }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
const sc = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  iconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '800', color: '#1A1A2E', letterSpacing: -0.3 },
});

// ── StatPill ──────────────────────────────────────────────────────────────────
function StatPill({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <View style={[sp.pill, { backgroundColor: bg }]}>
      <Text style={[sp.val, { color }]}>{value}</Text>
      <Text style={[sp.lbl, { color: color + 'AA' }]}>{label}</Text>
    </View>
  );
}
const sp = StyleSheet.create({
  pill: { flex: 1, borderRadius: 14, padding: 12, alignItems: 'center' },
  val: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  lbl: { fontSize: 10, fontWeight: '600', marginTop: 3, textAlign: 'center' },
});

// ── HistoryCard ───────────────────────────────────────────────────────────────
function HistoryCard({ item, t, onDelete }: { item: CalcResult; t: any; onDelete: (id: string) => void }) {
  const isProfit = item.netProfit >= 0;
  const emoji = CROP_EMOJIS[item.crop] ?? '🌱';
  const pct = item.totalIncome > 0 ? Math.round((item.netProfit / item.totalIncome) * 100) : 0;
  const { theme } = useTheme();
  return (
    <View style={[hc.card, { backgroundColor: theme.surface }]}>
      <View style={hc.top}>
        <View style={[hc.emojiBox, { backgroundColor: isProfit ? '#E8F5E9' : '#FFEBEE' }]}>
          <Text style={hc.emoji}>{emoji}</Text>
        </View>
        <View style={hc.info}>
          <Text style={[hc.crop, { color: theme.text }]}>{t(`calc.crops.${item.crop}`, { defaultValue: item.crop })}</Text>
          <Text style={hc.date}>{item.date}</Text>
        </View>
        <View style={hc.right}>
          <Text style={[hc.profit, { color: isProfit ? '#2E7D32' : '#C62828' }]}>
            {isProfit ? '+' : '-'}₹{Math.abs(item.netProfit).toLocaleString('en-IN')}
          </Text>
          <View style={[hc.pctBadge, { backgroundColor: isProfit ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[hc.pctText, { color: isProfit ? '#2E7D32' : '#C62828' }]}>{pct}%</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={hc.del}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View style={hc.delBtn}>
            <Ionicons name="trash-outline" size={14} color="#EF5350" />
          </View>
        </TouchableOpacity>
      </View>
      <View style={hc.stats}>
        <StatPill label={t('calc.totalCost')}   value={`₹${item.totalCost.toLocaleString('en-IN')}`}   color="#C62828" bg="#FFEBEE" />
        <View style={hc.div} />
        <StatPill label={t('calc.totalIncome')} value={`₹${item.totalIncome.toLocaleString('en-IN')}`} color="#1565C0" bg="#E3F2FD" />
        {item.perAcreProfit !== null && (
          <>
            <View style={hc.div} />
            <StatPill label={t('calc.perAcre')} value={`₹${Math.abs(item.perAcreProfit).toLocaleString('en-IN')}`} color="#6A1B9A" bg="#F3E5F5" />
          </>
        )}
      </View>
    </View>
  );
}
const hc = StyleSheet.create({
  card: { backgroundColor: '#FFF', borderRadius: 18, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  emojiBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  info: { flex: 1 },
  crop: { fontSize: 14, fontWeight: '800', color: '#1A1A2E' },
  date: { fontSize: 11, color: '#90A4AE', marginTop: 2, fontWeight: '500' },
  right: { alignItems: 'flex-end', gap: 4 },
  profit: { fontSize: 14, fontWeight: '800' },
  pctBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  pctText: { fontSize: 10, fontWeight: '700' },
  del: { padding: 4 },
  delBtn: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#FFEBEE', alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 6 },
  div: { width: 1, backgroundColor: '#ECEFF1', marginVertical: 4 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ProfitCalcScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'calc' | 'history'>('calc');
  const { theme, isDark } = useTheme();

  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [customCrop, setCustomCrop]     = useState('');
  const [showCropPicker, setShowCropPicker] = useState(false);
  const [seed, setSeed]     = useState('');
  const [fert, setFert]     = useState('');
  const [labour, setLabour] = useState('');
  const [irrig, setIrrig]   = useState('');
  const [other, setOther]   = useState('');
  const [prod, setProd]     = useState('');
  const [price, setPrice]   = useState('');
  const [priceMode, setPriceMode] = useState<'kg' | '20kg'>('kg');
  const [acre, setAcre]     = useState('');

  const [result, setResult]   = useState<CalcResult | null>(null);
  const [history, setHistory] = useState<CalcResult[]>([]);
  const [saving, setSaving]   = useState(false);
  const [histLoading, setHistLoading] = useState(false);
  const [refreshing, setRefreshing]   = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const resultAnim = useRef(new Animated.Value(0)).current;

  const effectivePrice = priceMode === '20kg'
    ? (parseFloat(price) || 0) / 20
    : (parseFloat(price) || 0);

  const totalCostPreview = [seed,fert,labour,irrig,other].reduce((a,v) => a+(parseFloat(v)||0), 0);

  const loadHistory = useCallback(async (showLoader = true) => {
    if (showLoader) setHistLoading(true);
    try {
      const data = await profitAPI.getHistory();
      const mapped: CalcResult[] = (data.history || []).map((h: any) => ({
        id: h._id, crop: h.cropName,
        date: h.date || new Date(h.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        totalCost: h.totalCost, totalIncome: h.totalIncome,
        netProfit: h.netProfit, perAcreProfit: h.perAcreProfit ?? null,
      }));
      setHistory(mapped);
    } catch { /* offline */ } finally {
      setHistLoading(false); setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, []);

  const calculate = () => {
    const totalCost = [seed, fert, labour, irrig, other].reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const totalIncome = (parseFloat(prod) || 0) * effectivePrice;
    if (totalIncome === 0 && totalCost === 0) {
      Toast.show({ type: 'error', text1: t('calc.enterValue') }); return;
    }
    const netProfit = totalIncome - totalCost;
    const acreVal = parseFloat(acre);
    setResult({
      id: Date.now().toString(),
      crop: customCrop.trim() || selectedCrop,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      totalCost, totalIncome, netProfit,
      perAcreProfit: acreVal > 0 ? netProfit / acreVal : null,
    });
    resultAnim.setValue(0);
    Animated.spring(resultAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 6 }).start();
  };

  const saveCalc = async () => {
    if (!result || saving) return;
    setSaving(true);
    try {
      const data = await profitAPI.calculate({
        cropName: customCrop.trim() || selectedCrop,
        seedCost: parseFloat(seed) || 0, fertCost: parseFloat(fert) || 0,
        labourCost: parseFloat(labour) || 0, irrigCost: parseFloat(irrig) || 0,
        otherCost: parseFloat(other) || 0, production: parseFloat(prod) || 0,
        pricePerKg: effectivePrice, acreArea: parseFloat(acre) || null,
      });
      const saved: CalcResult = {
        id: data.record?._id || Date.now().toString(),
        crop: customCrop.trim() || selectedCrop, date: result.date,
        totalCost: result.totalCost, totalIncome: result.totalIncome,
        netProfit: result.netProfit, perAcreProfit: result.perAcreProfit,
      };
      setHistory(prev => [saved, ...prev]);
      Toast.show({ type: 'success', text1: '✅ ' + t('calc.saved'), text2: `₹${Math.abs(result.netProfit).toLocaleString('en-IN')}`, visibilityTime: 2500 });
      setSeed(''); setFert(''); setLabour(''); setIrrig('');
      setOther(''); setProd(''); setPrice(''); setAcre('');
      setCustomCrop(''); setResult(null);
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Save failed', text2: err.message || 'Please login to save' });
    } finally { setSaving(false); }
  };

  const deleteRecord = async (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try { await profitAPI.delete(id); } catch {}
    setHistory(prev => prev.filter(h => h.id !== id));
    Toast.show({ type: 'success', text1: t('calc.recordDeleted'), visibilityTime: 1800 });
  };

  const reset = () => {
    setSeed(''); setFert(''); setLabour(''); setIrrig('');
    setOther(''); setProd(''); setPrice(''); setAcre('');
    setCustomCrop(''); setResult(null);
    Toast.show({ type: 'info', text1: 'Form cleared', visibilityTime: 1000 });
  };

  const getInsight = (profit: number, income: number) => {
    if (income === 0) return null;
    const m = profit / income;
    if (m >= 0.3) return { key: 'insightGood', color: '#2E7D32', bg: '#E8F5E9', icon: 'trending-up', grad: ['#2E7D32','#43A047'] as [string,string] };
    if (m >= 0)   return { key: 'insightAvg',  color: '#E65100', bg: '#FFF3E0', icon: 'remove-circle', grad: ['#E65100','#FF8F00'] as [string,string] };
    return           { key: 'insightLoss', color: '#C62828', bg: '#FFEBEE', icon: 'trending-down', grad: ['#C62828','#EF5350'] as [string,string] };
  };

  const insight  = result ? getInsight(result.netProfit, result.totalIncome) : null;
  const isProfit = result ? result.netProfit >= 0 : true;
  const profitPct = result && result.totalIncome > 0
    ? Math.round((result.netProfit / result.totalIncome) * 100) : 0;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.headerBg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* ── HEADER ── */}
        <PageHeader
          title={t('calc.title')}
          subtitle={`${CROP_EMOJIS[selectedCrop] ?? '🌱'}  ${customCrop.trim() || t(`calc.crops.${selectedCrop}`)}`}
          onBack={() => router.back()}
          iconName="calculator"
          iconColor="#BE123C"
          iconBg="#FFF1F2"
        />

        {/* Tab bar */}
        <View style={[s.tabBar, { backgroundColor: theme.inputBg }]}>
          {(['calc','history'] as const).map(tab => (
            <TouchableOpacity key={tab}
              style={[s.tab, activeTab === tab && [s.tabActive, { backgroundColor: theme.surface }]]}
              onPress={() => { setActiveTab(tab); if (tab === 'history') loadHistory(false); }}
              activeOpacity={0.85}>
              <Ionicons name={tab === 'calc' ? 'calculator-outline' : 'time-outline'} size={14}
                color={activeTab === tab ? COLORS.primary : '#9CA3AF'} />
              <Text style={[s.tabTxt, { color: theme.textSecondary }, activeTab === tab && s.tabTxtActive]}>
                {t(tab === 'calc' ? 'calc.calculator' : 'calc.history')}
              </Text>
              {tab === 'history' && history.length > 0 && (
                <View style={s.tabDot}><Text style={s.tabDotTxt}>{history.length}</Text></View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── CALCULATOR TAB ── */}
        {activeTab === 'calc' && (
          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
            contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">

            {/* Crop Selector */}
            <SectionCard title={t('calc.cropSelect')} icon="leaf" accent="#2E7D32">
              <TouchableOpacity style={s.cropRow}
                onPress={() => setShowCropPicker(!showCropPicker)} activeOpacity={0.85}>
                <View style={s.cropEmojiBox}>
                  <Text style={{ fontSize: 26 }}>{CROP_EMOJIS[selectedCrop]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cropLbl}>{t('calc.cropSelect')}</Text>
                  <Text style={s.cropVal}>{t(`calc.crops.${selectedCrop}`)}</Text>
                </View>
                <View style={[s.chevron, showCropPicker && s.chevronOpen]}>
                  <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
                </View>
              </TouchableOpacity>

              {showCropPicker && (
                <View style={s.cropGrid}>
                  {CROP_KEYS.map(k => (
                    <TouchableOpacity key={k}
                      style={[s.chip, selectedCrop === k && !customCrop && s.chipActive]}
                      onPress={() => { setSelectedCrop(k); setCustomCrop(''); setShowCropPicker(false); }}
                      activeOpacity={0.8}>
                      <Text style={{ fontSize: 16 }}>{CROP_EMOJIS[k]}</Text>
                      <Text style={[s.chipTxt, selectedCrop === k && !customCrop && s.chipTxtActive]}>
                        {t(`calc.crops.${k}`)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={s.customRow}>
                <Ionicons name="create-outline" size={14} color={COLORS.primary} />
                <TextInput style={s.customInput} value={customCrop} onChangeText={setCustomCrop}
                  placeholder={t('calc.cropSelect') + '...'} placeholderTextColor="#B0BEC5" />
                {customCrop.length > 0 && (
                  <TouchableOpacity onPress={() => setCustomCrop('')}>
                    <Ionicons name="close-circle" size={16} color="#B0BEC5" />
                  </TouchableOpacity>
                )}
              </View>
            </SectionCard>

            {/* Costs */}
            <SectionCard title={t('calc.costs')} icon="wallet-outline" accent="#1565C0">
              <SmartInput label={t('calc.seedCost')}   value={seed}   onChange={setSeed}   placeholder="0" icon="leaf"          accent="#2E7D32" prefix="₹" />
              <SmartInput label={t('calc.fertCost')}   value={fert}   onChange={setFert}   placeholder="0" icon="flask-outline" accent="#7B1FA2" prefix="₹" />
              <SmartInput label={t('calc.labourCost')} value={labour} onChange={setLabour} placeholder="0" icon="people-outline" accent="#1565C0" prefix="₹" />
              <SmartInput label={t('calc.irrigCost')}  value={irrig}  onChange={setIrrig}  placeholder="0" icon="water-outline" accent="#0288D1" prefix="₹" />
              <SmartInput label={t('calc.otherCost')}  value={other}  onChange={setOther}  placeholder="0" icon="ellipsis-horizontal-circle-outline" accent="#E65100" prefix="₹" />
              {totalCostPreview > 0 && (
                <View style={s.costTotal}>
                  <Text style={s.costTotalLbl}>{t('calc.totalCost')}</Text>
                  <Text style={s.costTotalVal}>₹{totalCostPreview.toLocaleString('en-IN')}</Text>
                </View>
              )}
            </SectionCard>

            {/* Production */}
            <SectionCard title={t('calc.production')} icon="stats-chart-outline" accent="#E65100">
              <SmartInput label={t('calc.totalProd')} value={prod} onChange={setProd}
                placeholder={t('calc.enterKg')} icon="scale-outline" accent="#2E7D32" />

              <Text style={s.fieldLbl}>{t('calc.sellingPrice')}</Text>
              <View style={s.toggle}>
                {(['kg','20kg'] as const).map(m => (
                  <TouchableOpacity key={m} style={[s.toggleBtn, priceMode === m && s.toggleBtnOn]}
                    onPress={() => setPriceMode(m)} activeOpacity={0.85}>
                    <Text style={[s.toggleTxt, priceMode === m && s.toggleTxtOn]}>
                      {t(m === 'kg' ? 'calc.perKg' : 'calc.per20Kg')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <SmartInput label="" value={price} onChange={setPrice}
                placeholder={t('calc.enterPrice')} icon="pricetag-outline" accent="#E65100" prefix="₹" />
              {priceMode === '20kg' && price.length > 0 && (
                <View style={s.hint}>
                  <Ionicons name="information-circle-outline" size={13} color={COLORS.primary} />
                  <Text style={s.hintTxt}>{t('calc.hint20kg', { val: price, per: effectivePrice.toFixed(2) })}</Text>
                </View>
              )}

              <SmartInput label={t('calc.acreOpt')} value={acre} onChange={setAcre}
                placeholder={t('calc.enterAcre')} icon="map-outline" accent="#1565C0" />
            </SectionCard>

            {/* Action Buttons */}
            <View style={s.btnRow}>
              <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.8}>
                <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
                <Text style={s.resetTxt}>{t('calc.reset')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.calcBtn} onPress={calculate} activeOpacity={0.85}>
                <LinearGradient colors={['#1B5E20','#43A047']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.calcGrad}>
                  <Ionicons name="calculator" size={18} color="#FFF" />
                  <Text style={s.calcTxt}>{t('calc.calculate')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Results */}
            {result && (
              <Animated.View style={{ opacity: resultAnim, transform: [{ scale: resultAnim.interpolate({ inputRange: [0,1], outputRange: [0.95,1] }) }] }}>
                {/* Insight Banner */}
                {insight && (
                  <LinearGradient colors={insight.grad} start={{x:0,y:0}} end={{x:1,y:0}} style={s.insightBanner}>
                    <View style={s.insightIcon}>
                      <Ionicons name={insight.icon as any} size={22} color="#FFF" />
                    </View>
                    <Text style={s.insightTxt}>{t(`calc.${insight.key}`)}</Text>
                    <View style={s.insightPct}>
                      <Text style={s.insightPctTxt}>{profitPct}%</Text>
                    </View>
                  </LinearGradient>
                )}

                {/* Result Card */}
                <View style={[s.resultCard, { backgroundColor: theme.surface }]}>
                  <Text style={[s.resultTitle, { color: theme.text }]}>{t('calc.results')}</Text>

                  {/* Cost vs Income row */}
                  <View style={s.resultPills}>
                    <StatPill label={t('calc.totalCost')}   value={`₹${result.totalCost.toLocaleString('en-IN')}`}   color="#C62828" bg="#FFEBEE" />
                    <View style={{ width: 8 }} />
                    <StatPill label={t('calc.totalIncome')} value={`₹${result.totalIncome.toLocaleString('en-IN')}`} color="#1565C0" bg="#E3F2FD" />
                  </View>

                  {/* Net Profit Hero */}
                  <LinearGradient
                    colors={isProfit ? ['#E8F5E9','#F1F8E9'] : ['#FFEBEE','#FFF5F5']}
                    style={s.netHero}>
                    <View style={[s.netIconBox, { backgroundColor: isProfit ? '#2E7D32' : '#C62828' }]}>
                      <Ionicons name={isProfit ? 'trending-up' : 'trending-down'} size={24} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.netLbl}>{isProfit ? t('calc.netProfit') : t('calc.netLoss')}</Text>
                      <Text style={[s.netVal, { color: isProfit ? '#2E7D32' : '#C62828' }]}>
                        ₹{Math.abs(result.netProfit).toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 36 }}>{CROP_EMOJIS[result.crop] ?? '🌱'}</Text>
                  </LinearGradient>

                  {result.perAcreProfit !== null && (
                    <View style={s.perAcreRow}>
                      <View style={s.perAcreIcon}>
                        <Ionicons name="map-outline" size={15} color="#6A1B9A" />
                      </View>
                      <Text style={s.perAcreLbl}>{t('calc.perAcre')}</Text>
                      <Text style={s.perAcreVal}>₹{Math.abs(result.perAcreProfit).toLocaleString('en-IN')}</Text>
                    </View>
                  )}
                </View>

                {/* Save Button */}
                <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.7 }]}
                  onPress={saveCalc} activeOpacity={0.85} disabled={saving}>
                  <LinearGradient colors={['#1B5E20','#2E7D32']} start={{x:0,y:0}} end={{x:1,y:0}} style={s.saveGrad}>
                    {saving
                      ? <ActivityIndicator size="small" color="#FFF" />
                      : <><Ionicons name="cloud-upload-outline" size={18} color="#FFF" />
                          <Text style={s.saveTxt}>{t('calc.save')}</Text></>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}
            <View style={{ height: 48 }} />
          </ScrollView>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === 'history' && (
          <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}
            contentContainerStyle={s.content}
            refreshControl={
              <RefreshControl refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); loadHistory(false); }}
                colors={[COLORS.primary]} />
            }>
            {histLoading
              ? <View style={s.loader}><ActivityIndicator size="large" color={COLORS.primary} /></View>
              : history.length === 0
                ? <View style={s.empty}>
                    <View style={s.emptyIcon}>
                      <Ionicons name="bar-chart-outline" size={36} color="#B0BEC5" />
                    </View>
                    <Text style={s.emptyTxt}>{t('calc.noHistory')}</Text>
                    <Text style={s.emptySub}>Login to sync your calculations</Text>
                  </View>
                : history.map(item => (
                    <HistoryCard key={item.id} item={item} t={t} onDelete={deleteRecord} />
                  ))
            }
            <View style={{ height: 48 }} />
          </ScrollView>
        )}

        <ConfirmModal
          visible={!!confirmDeleteId}
          title={t('calc.deleteTitle')}
          message={t('calc.deleteMessage')}
          confirmText={t('machine.delete')}
          cancelText={t('machine.cancel')}
          icon="trash-outline"
          iconColor="#C62828"
          confirmColor="#C62828"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },

  // Tab bar (below PageHeader)
  tabBar: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginHorizontal: 16, marginTop: 10, marginBottom: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderRadius: 9 },
  tabActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabTxt: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  tabTxtActive: { color: COLORS.primary },
  tabDot: { backgroundColor: '#F9A825', borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  tabDotTxt: { fontSize: 9, color: '#FFF', fontWeight: '800' },

  // Scroll
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 18 },

  // Crop selector
  cropRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#F8FAFB', borderRadius: 14, padding: 12, borderWidth: 1.5, borderColor: '#E8EDF2', marginBottom: 12 },
  cropEmojiBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  cropLbl: { fontSize: 10, color: '#90A4AE', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  cropVal: { fontSize: 16, fontWeight: '800', color: '#1A1A2E', marginTop: 2 },
  chevron: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  chevronOpen: { backgroundColor: COLORS.primary },
  cropGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F0F4F8', borderWidth: 1.5, borderColor: '#E8EDF2' },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipTxt: { fontSize: 11, fontWeight: '600', color: '#607D8B' },
  chipTxtActive: { color: '#FFF' },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0F9F1', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1.5, borderColor: '#C8E6C9' },
  customInput: { flex: 1, fontSize: 14, color: '#1A1A2E', padding: 0, fontWeight: '600' },

  // Cost total preview
  costTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF3E0', borderRadius: 12, padding: 12, marginTop: 4, borderWidth: 1, borderColor: '#FFCC80' },
  costTotalLbl: { fontSize: 12, color: '#E65100', fontWeight: '700' },
  costTotalVal: { fontSize: 16, fontWeight: '800', color: '#E65100' },

  // Field helpers
  fieldLbl: { fontSize: 11, fontWeight: '700', color: '#78909C', marginBottom: 6, letterSpacing: 0.4, textTransform: 'uppercase' },
  toggle: { flexDirection: 'row', backgroundColor: '#ECEFF1', borderRadius: 12, padding: 3, marginBottom: 10 },
  toggleBtn: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 9 },
  toggleBtnOn: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleTxt: { fontSize: 12, fontWeight: '600', color: '#90A4AE' },
  toggleTxtOn: { color: COLORS.primary, fontWeight: '800' },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E8F5E9', borderRadius: 10, padding: 10, marginTop: 4 },
  hintTxt: { fontSize: 11, color: COLORS.primary, fontWeight: '500', flex: 1 },

  // Buttons
  btnRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: '#F0F9F1' },
  resetTxt: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  calcBtn: { flex: 1, borderRadius: 14, overflow: 'hidden', shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  calcGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  calcTxt: { fontSize: 15, fontWeight: '800', color: '#FFF' },

  // Insight banner
  insightBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, padding: 14, marginBottom: 12 },
  insightIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  insightTxt: { flex: 1, fontSize: 14, fontWeight: '700', color: '#FFF', lineHeight: 20 },
  insightPct: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  insightPctTxt: { fontSize: 14, fontWeight: '800', color: '#FFF' },

  // Result card
  resultCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  resultTitle: { fontSize: 17, fontWeight: '800', color: '#1A1A2E', marginBottom: 14, letterSpacing: -0.3 },
  resultPills: { flexDirection: 'row', marginBottom: 14 },
  netHero: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, padding: 16, marginBottom: 4 },
  netIconBox: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  netLbl: { fontSize: 12, color: '#78909C', fontWeight: '600' },
  netVal: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginTop: 2 },
  perAcreRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F3E5F5', borderRadius: 12, padding: 12, marginTop: 10 },
  perAcreIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: '#E1BEE7', alignItems: 'center', justifyContent: 'center' },
  perAcreLbl: { flex: 1, fontSize: 13, fontWeight: '600', color: '#6A1B9A' },
  perAcreVal: { fontSize: 15, fontWeight: '800', color: '#6A1B9A' },

  // Save button
  saveBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 6, shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  saveGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  saveTxt: { fontSize: 15, fontWeight: '800', color: '#FFF' },

  // History empty / loader
  loader: { alignItems: 'center', paddingVertical: 80 },
  empty: { alignItems: 'center', paddingVertical: 70, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#ECEFF1', alignItems: 'center', justifyContent: 'center' },
  emptyTxt: { fontSize: 15, color: '#78909C', fontWeight: '700' },
  emptySub: { fontSize: 13, color: '#B0BEC5', fontWeight: '500' },
});
