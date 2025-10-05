import { useState, useEffect } from "react";
import ISSView from "./components/ISSView";
import ExploreMode from "./components/ExploreMode";
import "./App.css";

const FULL_TITLE = "MISSION CONTROL";
type AppMode = "explore" | "mission";

export default function App() {
  const [mode, setMode] = useState<AppMode>("explore");
  const [showModal, setShowModal] = useState(false);
  const [started, setStarted] = useState(false);

  const handleStart = () => {
    setStarted(true);
  };

  // States cho animations
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);

  // --- Effect điều khiển animation của modal ---
  useEffect(() => {
    if (showModal) {
      setTypedTitle("");
      setShowModalContent(false);
      setIsTyping(true);

      const visibilityTimer = setTimeout(() => setIsModalVisible(true), 10);

      let charIndex = -1;
      const typingInterval = setInterval(() => {
        if (charIndex < FULL_TITLE.length) {
          setTypedTitle((prev) => prev + FULL_TITLE.charAt(charIndex));
          charIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          setTimeout(() => setShowModalContent(true), 300);
        }
      }, 90);

      return () => {
        clearTimeout(visibilityTimer);
        clearInterval(typingInterval);
      };
    } else {
      setIsModalVisible(false);
    }
  }, [showModal]);

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setShowModal(false);
  };

  const renderContent = () => {
    switch (mode) {
      case "mission":
        return <ISSView />;
      default:
        return <ExploreMode />;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Start Button Overlay */}
      {!started && (
        <div className="fixed inset-0 w-screen h-screen bg-black bg-opacity-90 flex items-center justify-center z-50">
          <button
            onClick={handleStart}
            className="px-12 py-6 rounded-2xl text-2xl cursor-pointer font-mono font-bold spaceship-button text-cyan-400"
          >
            🚀 START YOUR JOURNEY
          </button>
        </div>
      )}

      {/* Main Content */}
      {renderContent()}

      <div className="absolute top-0 left-0 w-full h-full z-10 scanline-overlay"></div>

      <button
        onClick={() => setShowModal(true)}
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

      {showModal && (
        <div
          className={`fixed inset-0 w-screen h-screen flex items-center justify-center z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300 ease-in-out ${
            isModalVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setShowModal(false)}
        >
          <div
            className={`rounded-lg p-1 min-w-[480px] max-w-lg text-cyan-300 bg-slate-900/50 transition-all duration-300 ease-in-out border border-transparent ${
              isModalVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } ${isModalVisible ? "modal-flicker" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full bg-slate-900/90 rounded p-8">
              <h2 className="m-0 mb-8 text-center text-3xl tracking-[0.3em] font-bold text-cyan-300 h-12">
                <span
                  className={isTyping ? "typing-effect" : "typing-effect-done"}
                >
                  {typedTitle}
                </span>
              </h2>

              <div
                className={`transition-opacity duration-500 ease-in ${
                  showModalContent ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => handleModeChange("explore")}
                    className={`mode-button text-lg ${
                      mode === "explore" ? "active" : ""
                    }`}
                  >
                    <span className="text-2xl">🌌</span> <span>EXPLORE</span>
                  </button>
                  <button
                    onClick={() => handleModeChange("mission")}
                    className={`mode-button text-lg ${
                      mode === "mission" ? "active" : ""
                    }`}
                  >
                    <span className="text-2xl">🛰️</span> <span>MISSION</span>
                  </button>
                </div>
                <div className="text-center text-sm opacity-50 border-t border-cyan-400/20 pt-6 mt-8">
                  CURRENT MODE: {mode.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
