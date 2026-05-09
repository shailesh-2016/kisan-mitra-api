import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Animated, TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  icon?: string;
  iconColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible, title, message,
  confirmText = 'Confirm', cancelText = 'Cancel',
  confirmColor = '#C62828',
  icon = 'trash-outline', iconColor = '#C62828',
  onConfirm, onCancel,
}: ConfirmModalProps) {
  const { theme } = useTheme();
  const scale   = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      scale.setValue(0.85);
      opacity.setValue(0);
    }
  }, [visible, scale, opacity]);

  return (
    <Modal transparent visible={visible} animationType="none" statusBarTranslucent onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={cm.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[
              cm.card,
              { backgroundColor: theme.surface, opacity, transform: [{ scale }] },
            ]}>
              {/* Icon */}
              <View style={[cm.iconCircle, { backgroundColor: iconColor + '18' }]}>
                <Ionicons name={icon as any} size={28} color={iconColor} />
              </View>

              <Text style={[cm.title, { color: theme.text }]}>{title}</Text>
              <Text style={[cm.message, { color: theme.textSecondary }]}>{message}</Text>

              <View style={cm.btnRow}>
                <TouchableOpacity
                  style={[cm.cancelBtn, { backgroundColor: theme.inputBg, borderColor: theme.border }]}
                  onPress={onCancel} activeOpacity={0.8}
                >
                  <Text style={[cm.cancelTxt, { color: theme.textSecondary }]}>{cancelText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[cm.confirmBtn, { backgroundColor: confirmColor }]}
                  onPress={onConfirm} activeOpacity={0.85}
                >
                  <Ionicons name={icon as any} size={15} color="#FFF" />
                  <Text style={cm.confirmTxt}>{confirmText}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const cm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  cancelTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  confirmTxt: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
});
