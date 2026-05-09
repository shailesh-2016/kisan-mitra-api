import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import hi from '../locales/hi.json';
import gu from '../locales/gu.json';

export const LANGUAGES = [
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'en', label: 'English' },
];

export const LANGUAGE_STORAGE_KEY = '@kisan_app_language';

export async function getStoredLanguage(): Promise<string> {
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return lang ?? 'gu';
  } catch {
    return 'gu';
  }
}

export async function saveLanguage(lang: string): Promise<void> {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {}
}

export async function changeLanguage(lang: string): Promise<void> {
  await i18n.changeLanguage(lang);
  await saveLanguage(lang);
}

export async function initI18n(): Promise<void> {
  const savedLang = await getStoredLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        hi: { translation: hi },
        gu: { translation: gu },
      },
      lng: savedLang,
      fallbackLng: 'gu',
      interpolation: { escapeValue: false },
      compatibilityJSON: 'v4',
    });
}

export default i18n;
