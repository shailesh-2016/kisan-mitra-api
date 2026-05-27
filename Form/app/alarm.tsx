import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, BackHandler,
  Dimensions, Platform,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withSequence,
  withTiming, withDelay, withSpring, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { getTaskById, ReminderTask } from '../services/reminderStorage';
import { startAlarmAudio, stopAlarmAudio, snoozeAlarm, completeAlarm, dismissAlarm } from '../services/ReminderService';
import { COLORS, SHADOW } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

const { width: W, height: H } = Dimensions.get('window');

// Priority color configuration
const PRIORITY_THEME = {
  high:   { primary: '#D32F2F', accent: '#FF5252', bg: '#FFEBEE', label: 'Urgent Task' },
  medium: { primary: '#F57F17', accent: '#FFD740', bg: '#FFF8E1', label: 'Daily Task' },
  low:    { primary: '#2E7D32', accent: '#69F0AE', bg: '#E8F5E9', label: 'Flexible Task' },
};

// Dynamic visual styles based on time of day
const GRADIENTS = [
  ['#1B5E20', '#2E7D32', '#4CAF50'], // Vibrant farming green gradient
  ['#E65100', '#F57C00', '#FFB74D'], // Warm farming sunrise gradient
];

function getTaskEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('water') || lower.includes('पानी') || lower.includes('પાણી')) return '💧';
  if (lower.includes('spray') || lower.includes('fertiliz') || lower.includes('खाद') || lower.includes('ખાતર')) return '🌿';
  if (lower.includes('harvest') || lower.includes('कटाई') || lower.includes('કાપ')) return '🌾';
  if (lower.includes('soil') || lower.includes('मिट्टी') || lower.includes('માટી')) return '🪱';
  if (lower.includes('market') || lower.includes('मंडी') || lower.includes('મંડી')) return '🏪';
  if (lower.includes('pest') || lower.includes('कीट') || lower.includes('જીવ')) return '🐛';
  if (lower.includes('tractor') || lower.includes('ट्रैक्टर') || lower.includes('ટ્રેક')) return '🚜';
  return '🌾';
}

function formatTime12(time: string): string {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export default function AlarmScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const { isDark } = useTheme();
  
  const [task, setTask] = useState<ReminderTask | null>(null);

  // Load task and start sound/vibration immediately
  useEffect(() => {
    async function loadAndPlay() {
      if (!taskId) return;
      const t = await getTaskById(taskId);
      if (t) {
        setTask(t);
        await startAlarmAudio(taskId);
      }
    }
    loadAndPlay();

    // Disable hardware back button on Android to prevent leaving without action
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      stopAlarmAudio();
      backHandler.remove();
    };
  }, [taskId]);

  // Animated pulse waves around the icon
  const scale1 = useSharedValue(0.7);
  const opacity1 = useSharedValue(0.8);
  const scale2 = useSharedValue(0.7);
  const opacity2 = useSharedValue(0.8);
  
  // Ringing bell rotate animation
  const bellRotate = useSharedValue(0);

  // Floating farmer tractor / crop animation
  const tractorTranslateY = useSharedValue(0);

  useEffect(() => {
    // Pulse wave 1
    scale1.value = withRepeat(
      withTiming(2.2, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1, false
    );
    opacity1.value = withRepeat(
      withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1, false
    );

    // Pulse wave 2 with delay
    scale2.value = withDelay(1000, withRepeat(
      withTiming(2.2, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1, false
    ));
    opacity2.value = withDelay(1000, withRepeat(
      withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1, false
    ));

    // Ringing bell rotation sequence
    bellRotate.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 100 }),
        withTiming(15, { duration: 100 }),
        withTiming(-12, { duration: 90 }),
        withTiming(12, { duration: 90 }),
        withTiming(-8, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(0, { duration: 600 }), // Pause between rings
      ),
      -1, false
    );

    // Floating tractor animation
    tractorTranslateY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.ease) })
      ),
      -1, true
    );
  }, []);

  const waveStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));

  const waveStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  const bellStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${bellRotate.value}deg` }],
  }));

  const tractorStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: tractorTranslateY.value }],
  }));

  if (!task) return null;

  const emoji = getTaskEmoji(task.name);
  const hourMins = formatTime12(task.time);

  const handleComplete = async () => {
    await completeAlarm(task.id);
    router.dismissAll();
    router.replace('/(tabs)');
  };

  const handleSnooze = async () => {
    await snoozeAlarm(task.id);
    router.dismissAll();
    router.replace('/(tabs)');
  };

  const handleDismiss = async () => {
    await dismissAlarm(task.id);
    router.dismissAll();
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#E65100', '#F57C00', '#FFB74D']} style={styles.gradient}>
      <View style={styles.content}>
        
        {/* Floating context icon */}
        <Animated.View style={[styles.floatingTractor, tractorStyle]}>
          <Ionicons name="sunny" size={32} color="#FFF" />
        </Animated.View>

        {/* Pulse Waves & Ringing Icon */}
        <View style={styles.bellSection}>
          <Animated.View style={[styles.pulseCircle, waveStyle1]} />
          <Animated.View style={[styles.pulseCircle, waveStyle2]} />
          <Animated.View style={[styles.bellContainer, bellStyle]}>
            <Text style={styles.bellEmoji}>{emoji}</Text>
          </Animated.View>
        </View>

        {/* Header Task Category Badge */}
        <View style={styles.badge}>
          <Ionicons name="notifications-outline" size={16} color="#FFE082" />
          <Text style={styles.badgeTxt}>{t('reminder.title', 'FARMING REMINDER').toUpperCase()}</Text>
        </View>

        {/* Reminder Time */}
        <Text style={styles.timeTxt}>{hourMins}</Text>

        {/* glassmorphism Card */}
        <View style={styles.glassCard}>
          <View style={styles.innerCard}>
            <Text style={styles.taskTitle}>{task.name}</Text>
            <Text style={styles.taskSub}>🌾 {t('reminder.alertTip', 'Time to take action on your field. Happy Farming!')}</Text>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.btnRow}>
          
          {/* Dismiss */}
          <TouchableOpacity style={[styles.btn, styles.dismissBtn]} onPress={handleDismiss}>
            <Ionicons name="close-circle-outline" size={24} color="#FFF" />
            <Text style={styles.btnTxt}>{t('reminder.dismiss', 'Dismiss')}</Text>
          </TouchableOpacity>

          {/* Snooze 5 Min */}
          <TouchableOpacity style={[styles.btn, styles.snoozeBtn]} onPress={handleSnooze}>
            <Ionicons name="time-outline" size={24} color="#E65100" />
            <Text style={[styles.btnTxt, { color: '#E65100' }]}>{t('reminder.snooze', 'Snooze')}</Text>
            <Text style={styles.snoozeSub}>5 Min</Text>
          </TouchableOpacity>

          {/* Complete */}
          <TouchableOpacity style={[styles.btn, styles.completeBtn]} onPress={handleComplete}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#FFF" />
            <Text style={styles.btnTxt}>{t('reminder.complete', 'Complete')}</Text>
          </TouchableOpacity>

        </View>

        {/* Context Footer Visuals */}
        <View style={styles.footerRow}>
          <Ionicons name="leaf-outline" size={18} color="#C8E6C9" />
          <Text style={styles.footerTxt}>Kisan Plus Smart Alarm System</Text>
        </View>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  floatingTractor: {
    position: 'absolute',
    top: 60,
    right: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    padding: 12,
    borderRadius: 20,
  },
  bellSection: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  pulseCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  bellContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.lg,
  },
  bellEmoji: {
    fontSize: 54,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    marginBottom: 8,
  },
  badgeTxt: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  timeTxt: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 28,
    padding: 2,
    marginBottom: 36,
  },
  innerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 26,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    ...SHADOW.md,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 8,
  },
  taskSub: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    textAlign: 'center',
    lineHeight: 20,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginBottom: 24,
  },
  btn: {
    flex: 1,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.md,
  },
  dismissBtn: {
    backgroundColor: '#C62828',
  },
  snoozeBtn: {
    backgroundColor: '#FFE082',
  },
  completeBtn: {
    backgroundColor: '#2E7D32',
  },
  btnTxt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
    marginTop: 4,
    textAlign: 'center',
  },
  snoozeSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E65100',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.8,
  },
  footerTxt: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
