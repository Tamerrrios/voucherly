import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppLanguage, translations, TranslationKey} from '../localization/translations';

type LocalizationContextValue = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => Promise<void>;
  t: (key: TranslationKey) => string;
};

const STORAGE_KEY = 'voucherly.language';
const LocalizationContext = createContext<LocalizationContextValue | undefined>(undefined);

const resolveValue = (language: AppLanguage, key: TranslationKey): string => {
  const keys = key.split('.');
  const readPath = (source: any): string | undefined => {
    let current = source;
    for (const segment of keys) {
      if (current?.[segment] === undefined) {
        return undefined;
      }
      current = current[segment];
    }
    return typeof current === 'string' ? current : undefined;
  };

  const direct = readPath(translations[language]);
  if (direct !== undefined) {
    return direct;
  }

  const ruFallback = readPath(translations.ru);
  if (ruFallback !== undefined) {
    return ruFallback;
  }

  const enFallback = readPath(translations.en);
  if (enFallback !== undefined) {
    return enFallback;
  }

  return key;
};

export const LocalizationProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [language, setLanguageState] = useState<AppLanguage>('ru');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'ru' || saved === 'uz' || saved === 'en') {
          setLanguageState(saved);
        }
      } catch {
      }
    };

    loadLanguage();
  }, []);

  const setLanguage = async (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch {
    }
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: TranslationKey) => resolveValue(language, key),
    }),
    [language],
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
};

export const useLocalization = (): LocalizationContextValue => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }
  return context;
};
