import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { initI18n } from '../i18n';
import { COLORS } from '../constants/theme';
import { ToastProvider } from '../components/Toast';
import { AuthProvider } from '../context/AuthContext';
import { SettingsProvider } from '../context/SettingsContext';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

// ── Inner layout — reads ThemeContext after it's mounted ──────────────────────
function AppStack() {
  const { isDark, theme } = useTheme();

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: true, title: 'Modal' }} />
        <Stack.Screen name="login"        options={{ headerShown: false }} />
        <Stack.Screen name="otp"          options={{ headerShown: false }} />
        <Stack.Screen name="register"     options={{ headerShown: false }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="settings"     options={{ headerShown: false }} />
        <Stack.Screen name="delete-account" options={{ headerShown: false }} />
        <Stack.Screen name="privacy-policy"   options={{ headerShown: false }} />
        <Stack.Screen name="terms-conditions" options={{ headerShown: false }} />
        <Stack.Screen name="nearby-mandi" />
        <Stack.Screen name="weather" />
        <Stack.Screen name="govt-schemes" />
        <Stack.Screen name="govt-detail" />
        <Stack.Screen name="profit-calc" />
        <Stack.Screen name="machines" />
        <Stack.Screen name="machine-detail" />
        <Stack.Screen name="add-machine" />
        <Stack.Screen name="add-entry" />
        <Stack.Screen name="mandi/[id]" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ToastProvider />
    </NavThemeProvider>
  );
}

// ── Root layout ───────────────────────────────────────────────────────────────
export default function RootLayout() {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
  }, []);

  if (!i18nReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <AppStack />
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
