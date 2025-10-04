import React, { useState, useCallback, useEffect } from "react";
import missionsData from "../data/missions.json";

export interface MissionData {
  id: string;
  title: string;
  location: string;
  lat: number;
  lon: number;
  year: number;
  description: string;
  issImage: string;
  highlights: string[];
  difficulty: string;
  briefing: string;
}

interface MissionState {
  isActive: boolean;
  target: MissionData | null;
  isCapturing: boolean;
}

interface MissionProps {
  missionState: MissionState;
  onStartMission: () => void;
  onCapturePhoto: () => void;
  onResetMission: () => void;
  onMissionSelect: (mission: MissionData) => void;
  selectedMission: MissionData | null;
  missionResult: { success: boolean; mission: MissionData } | null;
  onClearResult: () => void;
}

const Mission: React.FC<MissionProps> = ({
  missionState,
  onStartMission,
  onCapturePhoto,
  onResetMission,
  onMissionSelect,
  selectedMission,
  missionResult,
  onClearResult,
}) => {
  const [showMissionSelect, setShowMissionSelect] = useState(true);
  const [showBriefing, setShowBriefing] = useState(false);
  const [showWasted, setShowWasted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const missions = missionsData as MissionData[];

  // Handle mission results
  useEffect(() => {
    if (missionResult) {
      if (missionResult.success) {
        setShowSuccess(true);
      } else {
        setShowWasted(true);
      }
    }
  }, [missionResult]);

  // Select a mission
  const selectMission = useCallback(
    (mission: MissionData) => {
      onMissionSelect(mission);
      setShowMissionSelect(false);
      setShowBriefing(true);
    },
    [onMissionSelect]
  );

  // Start mission
  const startMission = useCallback(() => {
    onStartMission();
    setShowBriefing(false);
  }, [onStartMission]);

  // Capture photo
  const capturePhoto = useCallback(() => {
    onCapturePhoto();
  }, [onCapturePhoto]);

  // Handle retry
  const handleRetry = useCallback(() => {
    onClearResult();
    setShowWasted(false);
    setShowSuccess(false);

    onStartMission();
  }, [onClearResult, onStartMission]);

  // Handle exit
  const handleExit = useCallback(() => {
    onResetMission();
    onClearResult();
    setShowWasted(false);
    setShowSuccess(false);
    setShowMissionSelect(true);
  }, [onResetMission, onClearResult]);

  // Handle success continue
  const handleSuccessContinue = useCallback(() => {
    onClearResult();
    setShowSuccess(false);
    setShowMissionSelect(true);
  }, [onClearResult]);

  return (
    <>
      {/* Mission Selection */}
      {showMissionSelect && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="mission-selection-panel rounded-xl p-8 max-w-6xl mx-4 fade-in">
            <div className="panel-header mb-6">
              <h2 className="text-5xl font-bold text-cyan-400 text-center mb-4 uppercase tracking-wider text-shadow-glow">
                SELECT MISSION
              </h2>
              <p className="text-xl text-cyan-200 leading-relaxed text-center font-mono">
                Select a mission to start taking photos from ISS Cupola
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  onClick={() => selectMission(mission)}
                  className="mission-card-tech bg-slate-900 bg-opacity-80 rounded-lg p-6 cursor-pointer hover:bg-opacity-95 transition-all duration-300 border border-cyan-400 border-opacity-30 hover:border-cyan-400 hover:border-opacity-80 hover:shadow-cyan-glow group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-3 py-1 text-xs rounded font-mono font-bold ${
                        mission.difficulty === "easy"
                          ? "bg-green-600 text-green-100"
                          : mission.difficulty === "medium"
                          ? "bg-yellow-600 text-yellow-100"
                          : "bg-red-600 text-red-100"
                      }`}
                    >
                      {mission.difficulty.toUpperCase()}
                    </span>
                    <span className="text-xs text-cyan-300 font-mono">
                      {mission.year}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-cyan-100 mb-3 group-hover:text-cyan-50 transition-colors">
                    {mission.title}
                  </h3>
                  <p className="text-sm text-cyan-300 mb-3 font-mono">
                    {mission.location}
                  </p>
                  <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">
                    {mission.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mission Briefing */}
      {showBriefing && selectedMission && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="mission-briefing-panel rounded-xl p-8 max-w-4xl mx-4 fade-in">
            <div className="panel-header mb-6">
              <h2 className="text-5xl font-bold text-cyan-400 text-center mb-4 uppercase tracking-wider text-shadow-glow">
                {selectedMission.title}
              </h2>
              <div className="flex items-center justify-center gap-4 mb-4">
                <span
                  className={`px-4 py-2 text-sm rounded font-mono font-bold ${
                    selectedMission.difficulty === "easy"
                      ? "bg-green-600 text-green-100"
                      : selectedMission.difficulty === "medium"
                      ? "bg-yellow-600 text-yellow-100"
                      : "bg-red-600 text-red-100"
                  }`}
                >
                  {selectedMission.difficulty.toUpperCase()}
                </span>
                <span className="text-cyan-300 font-mono text-lg">
                  {selectedMission.location}
                </span>
              </div>
            </div>

            <div className="bg-slate-900 bg-opacity-60 rounded-lg p-6 mb-6 border border-cyan-400 border-opacity-30">
              <h3 className="text-2xl font-bold text-cyan-300 mb-4 font-mono">
                BRIEFING:
              </h3>
              <p className="text-lg text-cyan-100 leading-relaxed font-mono">
                {selectedMission.briefing}
              </p>
            </div>

            <div className="bg-slate-800 bg-opacity-50 rounded-lg p-6 mb-8 border border-cyan-400 border-opacity-20">
              <h3 className="text-xl font-bold text-cyan-400 mb-3 font-mono">
                {selectedMission.briefing}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {selectedMission.description}
              </p>
            </div>

            <div className="flex gap-6">
              <button
                onClick={() => {
                  setShowBriefing(false);
                  setShowMissionSelect(true);
                }}
                className="mode-button active"
              >
                BACK
              </button>
              <button onClick={startMission} className="mode-button active">
                START
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mission Control Panel */}
      {missionState.isActive && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40">
          <button
            onClick={capturePhoto}
            disabled={missionState.isCapturing}
            className="capture-button-tech w-24 h-24 bg-red-600 hover:bg-red-700 border-2 border-cyan-400 rounded-full flex items-center justify-center disabled:opacity-50 shadow-red-glow hover:shadow-red-glow-strong transition-all duration-300"
            title="Capture target photo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.776 48.776 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Mission Success Screen */}
      {showSuccess && missionResult?.mission && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="mission-success-panel rounded-xl p-8 max-w-5xl mx-4 fade-in">
            <div className="text-center mb-8">
              <h1 className="text-8xl font-bold text-green-400 mb-4 text-shadow-glow-success">
                SUCCESS!{" "}
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto"></div>
            </div>

            <div className="bg-slate-900 bg-opacity-80 rounded-lg p-8 mb-8 border border-green-400 border-opacity-40">
              <h2 className="text-4xl font-bold text-cyan-400 mb-6 text-center font-mono">
                {missionResult.mission.title}
              </h2>

              <div className="mb-6">
                <img
                  src={missionResult.mission.issImage}
                  alt={missionResult.mission.title}
                  className="w-full rounded-lg mb-4 border border-cyan-400 border-opacity-30"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/640x360/1a2a40/00ffc8?text=ISS+Image";
                  }}
                />
              </div>

              <p className="text-lg text-cyan-100 mb-6 leading-relaxed font-mono">
                {missionResult.mission.description}
              </p>

              <div className="bg-slate-800 bg-opacity-60 rounded-lg p-6 border border-cyan-400 border-opacity-20">
                <h3 className="text-2xl font-bold text-cyan-300 mb-4 font-mono">
                  Highlights:
                </h3>
                <ul className="space-y-3">
                  {missionResult.mission.highlights.map((highlight, index) => (
                    <li
                      key={index}
                      className="text-cyan-100 flex items-start font-mono"
                    >
                      <span className="text-green-400 mr-3 text-xl">✓</span>
                      <span className="leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={handleSuccessContinue}
              className="w-full mode-button active"
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* Wasted Screen */}
      {showWasted && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 wasted-screen">
          <div className="text-center">
            <h1 className="text-10xl font-bold text-red-500 mb-8 text-shadow-glow-error font-mono">
              MISSION FAILED
            </h1>
            <div className="w-48 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto mb-8"></div>
            <div className="flex gap-8 justify-center">
              <button
                onClick={handleRetry}
                className="spaceship-button-tech text-slate-900 px-8 py-4 rounded-lg text-xl font-bold transition-all duration-300 font-mono transform hover:scale-105"
              >
                RETRY
              </button>
              <button
                onClick={handleExit}
                className="spaceship-button-tech text-slate-900 px-8 py-4 rounded-lg text-xl font-bold transition-all duration-300 font-mono transform hover:scale-105"
              >
                EXIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Panels */}
      {!showMissionSelect && (
        <>
          <div className="fixed top-8 left-8 z-30">
            <div className="control-panel-tech rounded-lg p-6 w-64 font-mono text-cyan-300 border border-cyan-400 border-opacity-30">
              <div className="font-bold text-cyan-100 border-b border-cyan-400 border-opacity-40 mb-4 pb-2 text-lg">
                SYSTEM
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-200">Energy:</span>
                  <span className="text-green-400 font-bold">STABLE</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-200">Oxygen:</span>
                  <span className="text-green-400 font-bold">99.8%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-200">Pressure:</span>
                  <span className="text-green-400 font-bold">101.2 kPa</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-cyan-200">Status:</span>
                  <span className="text-green-400 font-bold">ORBITAL</span>
                </div>
              </div>
            </div>
          </div>

          <div className="fixed top-8 right-8 z-30">
            <div className="control-panel-tech rounded-lg p-6 w-64 font-mono text-cyan-300 border border-cyan-400 border-opacity-30">
              {selectedMission && (
                <div className="mb-4 pb-4 border-b border-cyan-400 border-opacity-40">
                  <div className="font-bold text-cyan-100 mb-2 text-lg">
                    CURRENT MISSION
                  </div>
                  <div className="text-sm text-cyan-200 leading-relaxed">
                    {selectedMission.title}
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  onResetMission();
                  setShowMissionSelect(true);
                }}
                className="w-full spaceship-button-tech text-slate-900 font-bold py-3 px-4 rounded transition-all duration-300 font-mono"
              >
                OTHER MISSIONS
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Mission;
