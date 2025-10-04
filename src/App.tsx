import { useState, useEffect } from "react";
import ISSView from "./components/ISSView";
import ExploreMode from "./components/ExploreMode";
import { speak } from "./utils/textToSpeech";
import "./App.css";

type AppMode = "explore" | "mission";

function App() {
  const [mode, setMode] = useState<AppMode>("explore");
  const [showModal, setShowModal] = useState(false);
  const [started, setStarted] = useState(false);

  const handleStart = () => {
    setStarted(true);
  };

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode);
    setShowModal(false);
  };

  const renderContent = () => {
    switch (mode) {
      case "mission":
        return <ISSView />;
      case "explore":
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

      {/* Mode Switch Button */}
      <button
        onClick={() => setShowModal(true)}
        className="absolute bottom-5 right-5 w-16 h-16 rounded-full text-cyan-400 text-2xl cursor-pointer font-mono flex items-center justify-center spaceship-button"
      >
        ⚙️
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 w-screen h-screen bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="spaceship-modal rounded-2xl p-8 min-w-80 font-mono text-cyan-400"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="spaceship-modal-title m-0 mb-5 text-center text-xl">
              🚀 MISSION CONTROL
            </h2>

            <div className="mb-5">
              <button
                onClick={() => handleModeChange("explore")}
                className={`w-full p-4 mb-2.5 rounded-lg text-base cursor-pointer font-mono font-bold spaceship-mode-button ${
                  mode === "explore" ? "active" : ""
                }`}
              >
                🌌 EXPLORE MODE
              </button>

              <button
                onClick={() => handleModeChange("mission")}
                className={`w-full p-4 rounded-lg text-base cursor-pointer font-mono font-bold spaceship-mode-button ${
                  mode === "mission" ? "active" : ""
                }`}
              >
                🛰️ MISSION MODE
              </button>
            </div>

            <div className="text-center text-xs opacity-70 border-t border-cyan-400 border-opacity-30 pt-4">
              Current Mode: {mode.toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
