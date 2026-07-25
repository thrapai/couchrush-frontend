import adminEn from './locales/en/admin.json';
import commonEn from './locales/en/common.json';
import errorsEn from './locales/en/errors.json';
import hostEn from './locales/en/host.json';
import playerEn from './locales/en/player.json';
import adminEl from './locales/el/admin.json';
import commonEl from './locales/el/common.json';
import errorsEl from './locales/el/errors.json';
import hostEl from './locales/el/host.json';
import playerEl from './locales/el/player.json';

export const resources = {
  en: {
    common: commonEn,
    admin: adminEn,
    host: hostEn,
    player: playerEn,
    errors: errorsEn,
  },
  el: {
    common: commonEl,
    admin: adminEl,
    host: hostEl,
    player: playerEl,
    errors: errorsEl,
  },
} as const;
