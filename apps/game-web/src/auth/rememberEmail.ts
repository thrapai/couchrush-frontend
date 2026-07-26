const REMEMBER_EMAIL_KEY = 'couchrush.game.remember_email';
const REMEMBER_EMAIL_ENABLED_KEY = 'couchrush.game.remember_email.enabled';

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage;
}

export function getRememberedEmail() {
  return getStorage()?.getItem(REMEMBER_EMAIL_KEY) ?? '';
}

export function getRememberEmailEnabled() {
  return getStorage()?.getItem(REMEMBER_EMAIL_ENABLED_KEY) === 'true';
}

export function persistRememberedEmail(email: string) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(REMEMBER_EMAIL_KEY, email);
  storage.setItem(REMEMBER_EMAIL_ENABLED_KEY, 'true');
}

export function clearRememberedEmail() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(REMEMBER_EMAIL_KEY);
  storage.removeItem(REMEMBER_EMAIL_ENABLED_KEY);
}

export function setRememberEmailEnabled(enabled: boolean) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  if (enabled) {
    storage.setItem(REMEMBER_EMAIL_ENABLED_KEY, 'true');
    return;
  }

  clearRememberedEmail();
}
