import { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import ISSView from "./components/ISSView";
import ExploreMode from "./components/ExploreMode";
import LanguageSwitcher from "./components/LanguageSwitcher";
import {
  playClickSound,
  playExploreEnSound,
  playExploreViSound,
  playMissionEnSound,
  playMissionViSound,
} from "./utils/clickSound";
import type { AppMode } from "./components/ModeModal";
import ModeModal from "./components/ModeModal";


export default function App() {
  const { t, i18n } = useTranslation();
  const [mode, setMode] = useState<AppMode>("explore");
  const [showModal, setShowModal] = useState(false);
  const [started, setStarted] = useState(false);

  const bgAudioRef = useRef<HTMLAudioElement>(null);
  const welcomeMissionPlayedRef = useRef(false);

  const handleStart = () => {
    playClickSound();
    setStarted(true);

    if (i18n.language === "en") playExploreEnSound();
    else playExploreViSound();

    // Play background sound
    if (bgAudioRef.current) {
      bgAudioRef.current.play().catch((error) => {
        console.log("Audio playback failed:", error);
      });
    }
  };

  const handleModeChange = (newMode: AppMode) => {
    playClickSound();
    setMode(newMode);
    setShowModal(false);

    if (newMode === "explore" || welcomeMissionPlayedRef.current) return;

    if (i18n.language === "en") playMissionEnSound();
    else playMissionViSound();
    welcomeMissionPlayedRef.current = true;
  };

  const renderContent = () => {
    switch (mode) {
      case "mission":
        return <ISSView />;
      default:
        return <ExploreMode />;
    }
  };

  const handleModeModalClose = useCallback(() => {
    playClickSound();
    setShowModal(false);
  },[])

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Background Audio */}
      {/* <audio ref={audioRef} src={backgroundSound} loop /> */}

      {/* Start Button Overlay */}
      {!started && (
        <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
          {/* Application Title */}
          <div className="mb-12 text-center relative">
            <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-wide leading-none">
              <div className="relative inline-block">
                <span className="text-amber-400 font-black">
                  {t("OUT OF THIS")}
                </span>
                <br />
                <span className="text-white font-black text-7xl md:text-9xl relative -mt-4 inline-block">
                  {t("WORLD")}
                </span>
              </div>
            </h1>
            <p className="text-white/80 text-lg md:text-xl italic mt-6 font-light">
              "{t("Live like an astronaut, explore the endless universe.")}"
            </p>
          </div>

          <button
            onClick={handleStart}
            className="px-12 py-6 rounded-2xl text-2xl cursor-pointer font-mono font-bold spaceship-button text-cyan-400"
          >
            🚀 {t("START YOUR JOURNEY")}
          </button>
        </div>
      )}

      {/* Main Content */}
      {renderContent()}

      <div className="absolute top-0 left-0 w-full h-full z-10 scanline-overlay"></div>

      {/* Language Switcher */}
      {started && <LanguageSwitcher />}

      <button
        onClick={() => {
          playClickSound();
          setShowModal(true);
        }}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-full text-cyan-300 flex items-center justify-center bg-slate-900/70 border-2 border-cyan-400/30 backdrop-blur-sm hover:border-cyan-400/80 hover:bg-cyan-400/20 transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 z-30"
        aria-label="Open Mission Control"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.1l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2.12l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

    <ModeModal open={showModal} mode={mode} onModeChange={handleModeChange} onClose={handleModeModalClose}/>

    </div>
  );
}
