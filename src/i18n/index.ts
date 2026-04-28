import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { en } from './locales/en';
import { ru } from './locales/ru';
import { STORAGE_KEYS } from '../constants/storage';

export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  ru: 'Русский',
  en: 'English',
};

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  ru: '🇷🇺',
  en: '🇺🇸',
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    fallbackLng: 'ru',
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false, // React сам экранирует
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEYS.LANGUAGE,
      caches: ['localStorage'],
    },
    returnNull: false,
  });

/**
 * Возвращает текущий язык в нормализованном виде.
 * i18next может вернуть 'en-US' — нам нужно 'en'.
 */
export function getCurrentLanguage(): SupportedLanguage {
  const raw = i18n.language?.split('-')[0];
  const lng = (raw ?? 'ru') as SupportedLanguage;
  return SUPPORTED_LANGUAGES.includes(lng) ? lng : 'ru';
}

/**
 * BCP 47 локаль для Intl API (даты, числа).
 */
export function getIntlLocale(): string {
  return getCurrentLanguage() === 'en' ? 'en-US' : 'ru-RU';
}

export default i18n;
