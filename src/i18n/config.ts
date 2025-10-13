import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import viTranslation from "./locales/vi.json";

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: viTranslation,
    },
  },
  lng: "en", // default language
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export default i18n;
