import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { setStoredLanguage, type SupportedLanguage } from './i18n';

const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'el', label: 'Ελληνικά' },
];

interface LanguageSwitcherProps {
  label?: string;
}

export function LanguageSwitcher({ label }: LanguageSwitcherProps) {
  const labelId = useId();
  const { i18n, t } = useTranslation('common');
  const resolvedLanguage = i18n.resolvedLanguage?.split('-')[0];
  const currentLanguage: SupportedLanguage = resolvedLanguage === 'el' ? 'el' : 'en';
  const accessibleLabel = label ?? t('common.language.label');

  return (
    <FormControl size="small" fullWidth sx={{ minWidth: 104 }}>
      <InputLabel id={labelId}>{accessibleLabel}</InputLabel>
      <Select
        labelId={labelId}
        label={accessibleLabel}
        value={currentLanguage}
        sx={{
          minHeight: 32,
          '& .MuiSelect-select': {
            py: 0.625,
            fontSize: '0.8125rem',
          },
        }}
        onChange={(event) => {
          const language = event.target.value as SupportedLanguage;
          setStoredLanguage(language);
          void i18n.changeLanguage(language);
        }}
        inputProps={{ 'aria-label': accessibleLabel }}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value} dense>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
