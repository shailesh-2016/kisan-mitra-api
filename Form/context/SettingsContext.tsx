/**
 * SettingsContext — global app preferences, persisted to AsyncStorage.
 * darkMode is the source of truth here; ThemeContext reads from it.
 */
import React, {
  createContext, useContext, useState,
  useEffect, useCallback, ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@kisan_settings_v1';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AppSettings {
  // Notifications
  weatherAlerts:    boolean;
  mandiAlerts:      boolean;
  reminderNotifs:   boolean;
  soundEnabled:     boolean;
  // App Preferences
  darkMode:         boolean;
  unit:             'kg' | 'quintal';
  locationAccess:   boolean;
  // Farm Profile
  landSize:         string;
  cropsGrown:       string;
  farmingType:      string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  weatherAlerts:  true,
  mandiAlerts:    true,
  reminderNotifs: true,
  soundEnabled:   true,
  darkMode:       false,
  unit:           'kg',
  locationAccess: true,
  landSize:       '',
  cropsGrown:     '',
  farmingType:    '',
};

interface SettingsContextType {
  settings:       AppSettings;
  updateSetting:  <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  resetSettings:  () => Promise<void>;
  settingsLoaded: boolean;
}

// ── Context ───────────────────────────────────────────────────────────────────
const SettingsContext = createContext<SettingsContextType>({
  settings:       DEFAULT_SETTINGS,
  updateSetting:  async () => {},
  resetSettings:  async () => {},
  settingsLoaded: false,
});

export const useSettings = () => useContext(SettingsContext);

// ── Provider ──────────────────────────────────────────────────────────────────
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings,       setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setLoaded]   = useState(false);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AppSettings>;
          setSettings(prev => ({ ...prev, ...parsed }));
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (next: AppSettings) => {
    try { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const updateSetting = useCallback(async <K extends keyof AppSettings>(
    key: K, value: AppSettings[K],
  ) => {
    setSettings(prev => {
      const next = { ...prev, [key]: value };
      persist(next);
      return next;
    });
  }, [persist]);

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    await persist(DEFAULT_SETTINGS);
  }, [persist]);

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, settingsLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
}
