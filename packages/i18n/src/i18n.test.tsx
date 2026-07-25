import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it } from 'vitest';
import { LanguageSwitcher } from './LanguageSwitcher';
import {
  LANGUAGE_COOKIE_NAME,
  configureCouchRushI18n,
  createCouchRushI18nInstance,
  getStoredLanguage,
  i18n,
  setStoredLanguage,
} from './i18n';

function clearLanguageCookie() {
  document.cookie = `${LANGUAGE_COOKIE_NAME}=; Path=/; Max-Age=0`;
}

async function createConfiguredInstance() {
  const instance = createCouchRushI18nInstance();
  await configureCouchRushI18n(instance);

  return instance;
}

function renderSwitcher() {
  return render(
    <I18nextProvider i18n={i18n}>
      <LanguageSwitcher />
    </I18nextProvider>,
  );
}

describe('shared i18n', () => {
  afterEach(() => {
    cleanup();
    clearLanguageCookie();
  });

  it('uses English as the fallback language', async () => {
    const instance = await createConfiguredInstance();

    expect(instance.t('common.actions.save')).toBe('Save');
  });

  it('loads Greek translations', async () => {
    const instance = await createConfiguredInstance();
    await instance.changeLanguage('el');

    expect(instance.t('common.actions.save')).toBe('Αποθήκευση');
  });

  it('detects the cookie language value', async () => {
    setStoredLanguage('el');
    const instance = await createConfiguredInstance();

    expect(instance.resolvedLanguage).toBe('el');
    expect(instance.t('common.actions.cancel')).toBe('Ακύρωση');
  });

  it('updates the language cookie when changing language', async () => {
    const instance = await createConfiguredInstance();
    await instance.changeLanguage('el');

    expect(getStoredLanguage()).toBe('el');
  });

  it('shows the active language in the language switcher', async () => {
    await configureCouchRushI18n(i18n);
    await i18n.changeLanguage('el');

    renderSwitcher();

    expect(screen.getByRole('combobox', { name: 'Γλώσσα' })).toHaveTextContent('Ελληνικά');
  });

  it('changes language from the language switcher and updates the cookie', async () => {
    const user = userEvent.setup();
    await configureCouchRushI18n(i18n);
    await i18n.changeLanguage('en');

    renderSwitcher();

    await user.click(screen.getByRole('combobox', { name: 'Language' }));
    await user.click(await screen.findByRole('option', { name: 'Ελληνικά' }));

    expect(getStoredLanguage()).toBe('el');
    expect(screen.getByRole('combobox', { name: 'Γλώσσα' })).toHaveTextContent('Ελληνικά');
  });

  it('falls back to English for a missing Greek key', async () => {
    const instance = await createConfiguredInstance();
    await instance.changeLanguage('el');

    expect(instance.t('admin:admin.overview.unavailable')).toBe('Unavailable');
  });
});
