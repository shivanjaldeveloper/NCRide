import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TRANSLATIONS,
  type Locale,
  type TranslationKeys,
} from './translations';

const STORAGE_KEY = '@ncride_locale';

interface I18nContextValue {
  locale: Locale;
  t: TranslationKeys;
  setLocale: (locale: Locale) => Promise<void>;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  t: TRANSLATIONS.en,
  setLocale: async () => {},
});

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  // Load persisted locale on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
        setLocaleState(saved as Locale);
      }
    });
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    await AsyncStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  return (
    <I18nContext.Provider
      value={{ locale, t: TRANSLATIONS[locale], setLocale }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);

/**
 * One-shot read of the persisted locale (used by SplashScreen to decide
 * whether to show LanguageSelect on first launch).
 */
export const getPersistedLocale = async (): Promise<Locale | null> => {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'hi' || saved === 'mr') return saved;
  return null;
};

export const LOCALE_STORAGE_KEY = STORAGE_KEY;
