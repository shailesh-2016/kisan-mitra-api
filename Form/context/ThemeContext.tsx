/**
 * ThemeContext — global dark/light mode system.
 * Persisted to AsyncStorage. Consumed by every screen via useTheme().
 *
 * Usage:
 *   const { theme, isDark, toggleTheme } = useTheme();
 *   <View style={{ backgroundColor: theme.background }} />
 */
import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@kisan_theme_v1';

// ── Palette definitions ───────────────────────────────────────────────────────
export interface ThemePalette {
  // Backgrounds
  background:       string;
  surface:          string;   // cards, modals
  surfaceElevated:  string;   // elevated cards
  // Text
  text:             string;
  textSecondary:    string;
  textMuted:        string;
  // Borders
  border:           string;
  borderLight:      string;
  // Brand (unchanged in both modes)
  primary:          string;
  primaryLight:     string;
  primaryBg:        string;
  secondary:        string;
  secondaryBg:      string;
  // Status
  red:              string;
  redBg:            string;
  // Misc
  white:            string;
  overlay:          string;
  // Header
  headerBg:         string;
  headerBorder:     string;
  // Input
  inputBg:          string;
  inputBorder:      string;
  // Switch track
  switchTrackOff:   string;
}

export const LIGHT_THEME: ThemePalette = {
  background:       '#F4F6F8',
  surface:          '#FFFFFF',
  surfaceElevated:  '#FFFFFF',
  text:             '#1A1A2E',
  textSecondary:    '#6B7280',
  textMuted:        '#9CA3AF',
  border:           '#EEEEEE',
  borderLight:      '#F5F5F5',
  primary:          '#2E7D32',
  primaryLight:     '#43A047',
  primaryBg:        '#E8F5E9',
  secondary:        '#F9A825',
  secondaryBg:      '#FFF8E1',
  red:              '#D32F2F',
  redBg:            '#FFEBEE',
  white:            '#FFFFFF',
  overlay:          'rgba(0,0,0,0.45)',
  headerBg:         '#FFFFFF',
  headerBorder:     '#F0F0F0',
  inputBg:          '#F4F6F8',
  inputBorder:      '#EEEEEE',
  switchTrackOff:   '#E5E7EB',
};

export const DARK_THEME: ThemePalette = {
  background:       '#0F1117',
  surface:          '#1C1F2A',
  surfaceElevated:  '#252836',
  text:             '#F1F5F9',
  textSecondary:    '#94A3B8',
  textMuted:        '#64748B',
  border:           '#2D3142',
  borderLight:      '#252836',
  primary:          '#4CAF50',
  primaryLight:     '#66BB6A',
  primaryBg:        '#1A2E1B',
  secondary:        '#FFB300',
  secondaryBg:      '#2A2210',
  red:              '#EF5350',
  redBg:            '#2A1515',
  white:            '#FFFFFF',
  overlay:          'rgba(0,0,0,0.65)',
  headerBg:         '#1C1F2A',
  headerBorder:     '#2D3142',
  inputBg:          '#252836',
  inputBorder:      '#2D3142',
  switchTrackOff:   '#374151',
};

// ── Context type ──────────────────────────────────────────────────────────────
interface ThemeContextType {
  theme:       ThemePalette;
  isDark:      boolean;
  toggleTheme: () => Promise<void>;
  setDark:     (v: boolean) => Promise<void>;
  themeLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme:       LIGHT_THEME,
  isDark:      false,
  toggleTheme: async () => {},
  setDark:     async () => {},
  themeLoaded: false,
});

export const useTheme = () => useContext(ThemeContext);

// ── Provider ──────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark,      setIsDark]      = useState(false);
  const [themeLoaded, setThemeLoaded] = useState(false);

  // Restore from storage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_KEY);
        if (stored === 'dark') setIsDark(true);
      } catch {}
      setThemeLoaded(true);
    })();
  }, []);

  const setDark = useCallback(async (v: boolean) => {
    setIsDark(v);
    try { await AsyncStorage.setItem(THEME_KEY, v ? 'dark' : 'light'); } catch {}
  }, []);

  const toggleTheme = useCallback(async () => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  }, []);

  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setDark, themeLoaded }}>
      {children}
    </ThemeContext.Provider>
  );
}
