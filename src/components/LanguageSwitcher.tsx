import React from "react";
import { useTranslation } from "react-i18next";
import { playClickSound } from "../utils/clickSound";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    playClickSound();
    i18n.changeLanguage(lng);
  };

  return (
    <div className="fixed top-6 left-8 z-30 flex gap-2">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-4 py-2 rounded-lg font-mono font-bold transition-all duration-300 ${
          i18n.language === "en"
            ? "bg-cyan-400 text-slate-900"
            : "bg-slate-900/70 text-cyan-300 border-2 border-cyan-400/30 hover:border-cyan-400/80"
        }`}
        title="English"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("vi")}
        className={`px-4 py-2 rounded-lg font-mono font-bold transition-all duration-300 ${
          i18n.language === "vi"
            ? "bg-cyan-400 text-slate-900"
            : "bg-slate-900/70 text-cyan-300 border-2 border-cyan-400/30 hover:border-cyan-400/80"
        }`}
        title="Tiếng Việt"
      >
        VI
      </button>
    </div>
  );
};

export default LanguageSwitcher;
