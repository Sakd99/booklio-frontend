import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations, LOCALE_META, type Locale, type TranslationKeys } from '../i18n/translations';

const SUPPORTED_LOCALES: Locale[] = ['ar', 'en', 'es', 'fr', 'tr'];

function detectBrowserLocale(): Locale {
  const langs = navigator.languages ?? [navigator.language];
  for (const lang of langs) {
    const code = lang.split('-')[0].toLowerCase() as Locale;
    if (SUPPORTED_LOCALES.includes(code)) return code;
  }
  return 'ar'; // default to Arabic
}

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKeys) => string;
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: detectBrowserLocale(),
      setLocale: (locale: Locale) => {
        const { dir } = LOCALE_META[locale];
        document.documentElement.dir = dir;
        document.documentElement.lang = locale;
        set({ locale });
      },
      t: (key: TranslationKeys) => {
        const { locale } = get();
        return translations[locale][key] ?? translations.en[key] ?? key;
      },
    }),
    {
      name: 'convly-locale',
      partialize: (s) => ({ locale: s.locale }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { dir } = LOCALE_META[state.locale];
          document.documentElement.dir = dir;
          document.documentElement.lang = state.locale;
        }
      },
    },
  ),
);
