export {
  COOKIE_MAX_AGE_SECONDS,
  LANGUAGE_COOKIE_NAME,
  SUPPORTED_LANGUAGES,
  getStoredLanguage,
  initCouchRushI18n,
  i18n,
  setStoredLanguage,
} from './i18n';
export { LanguageSwitcher } from './LanguageSwitcher';
export { resources } from './resources';
export type { SupportedLanguage } from './i18n';
export { useTranslation } from 'react-i18next';
