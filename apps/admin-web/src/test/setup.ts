import '@testing-library/jest-dom/vitest';
import { beforeAll } from 'vitest';
import { initCouchRushI18n } from '@couchrush/i18n';

beforeAll(async () => {
  await initCouchRushI18n();
});
