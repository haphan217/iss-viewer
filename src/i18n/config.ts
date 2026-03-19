import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import viTranslation from "./locales/vi.json";
import enTranslation from "./locales/en.json";

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: viTranslation,
    },
    en: {
      translation: enTranslation,
    }
  },
  lng: "vi", // default language
  fallbackLng: "en",
  nsSeparator: false,
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export default i18n;
