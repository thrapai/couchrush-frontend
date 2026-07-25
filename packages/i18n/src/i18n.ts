import i18next, { createInstance, type i18n as I18nInstance } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';

export const LANGUAGE_COOKIE_NAME = 'couchrush_language';
export const COOKIE_MAX_AGE_SECONDS = 31_536_000;
export const SUPPORTED_LANGUAGES = ['en', 'el'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

let sharedInitPromise: Promise<I18nInstance> | undefined;

function isSupportedLanguage(value: string | undefined): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

function isHttpsEnvironment() {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}

export function setStoredLanguage(language: SupportedLanguage) {
  if (typeof document === 'undefined') {
    return;
  }

  const secure = isHttpsEnvironment() ? '; Secure' : '';
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; Path=/; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE_SECONDS}${secure}`;
}

export function getStoredLanguage(): SupportedLanguage | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const cookie = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${LANGUAGE_COOKIE_NAME}=`))
    ?.split('=')[1];

  return isSupportedLanguage(cookie) ? cookie : undefined;
}

export function createCouchRushI18nInstance() {
  return createInstance();
}

export async function configureCouchRushI18n(instance: I18nInstance) {
  if (instance.isInitialized) {
    return instance;
  }

  instance.on('languageChanged', (language) => {
    const normalizedLanguage = language.split('-')[0];

    if (isSupportedLanguage(normalizedLanguage)) {
      setStoredLanguage(normalizedLanguage);
    }
  });

  await instance
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      supportedLngs: SUPPORTED_LANGUAGES,
      fallbackLng: 'en',
      defaultNS: 'common',
      ns: ['common', 'admin', 'host', 'player', 'errors'],
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['cookie', 'navigator'],
        lookupCookie: LANGUAGE_COOKIE_NAME,
        caches: ['cookie'],
        cookieMinutes: COOKIE_MAX_AGE_SECONDS / 60,
        cookieOptions: {
          path: '/',
          sameSite: 'lax',
          secure: isHttpsEnvironment(),
        },
      },
      react: {
        useSuspense: false,
      },
    });

  return instance;
}

export function initCouchRushI18n() {
  sharedInitPromise ??= configureCouchRushI18n(i18next);

  return sharedInitPromise;
}

export const i18n = i18next;
