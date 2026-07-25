import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import base from './base.js';

export default [
  ...base,
  reactHooks.configs['recommended-latest'],
  reactRefresh.configs.vite,
];
