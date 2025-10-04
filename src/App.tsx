import { useState } from "react";
import ISSView from "./components/ISSView";
import "./App.css";

type AppMode = "explore" | "mission";

function App() {
  const [mode, setMode] = useState<AppMode>("explore");
  const [showModal, setShowModal] = useState(false);

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
        return (
          <div className="w-full h-full spaceship-gradient flex items-center justify-center text-cyan-400 text-2xl font-mono">
            <div className="text-center">
              <div className="text-5xl mb-5">🚀</div>
              <div>EXPLORE MODE</div>
              <div className="text-base mt-2.5 opacity-70">Coming Soon...</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden relative">
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
