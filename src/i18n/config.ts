import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import viTranslation from "./locales/vi.json";

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: viTranslation,
    },
  },
  lng: "vi", // default language
  fallbackLng: "vi",
  nsSeparator: false,
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export default i18n;
