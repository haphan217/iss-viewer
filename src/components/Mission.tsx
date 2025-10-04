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
        setShowWasted(false);
      } else {
        setShowWasted(true);
        setShowSuccess(false);
      }
    }
  }, [missionResult]);

  // Select a mission
  const selectMission = useCallback((mission: MissionData) => {
    onMissionSelect(mission);
    setShowMissionSelect(false);
    setShowBriefing(true);
  }, [onMissionSelect]);

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
    onResetMission();
    onClearResult();
    setShowWasted(false);
    setShowSuccess(false);
    setTimeout(() => setShowBriefing(true), 100);
  }, [onResetMission, onClearResult]);

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
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="mission-panel rounded-xl p-8 max-w-4xl mx-4 fade-in">
            <h2 className="text-4xl font-bold text-yellow-400 text-center mb-6 uppercase tracking-wider border-b-2 border-yellow-400 pb-2">
              SELECT MISSION
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed mb-6 text-center">
              Select a mission to start taking photos from ISS Cupola
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  onClick={() => selectMission(mission)}
                  className="mission-card bg-gray-800 bg-opacity-70 rounded-lg p-4 cursor-pointer hover:bg-opacity-90 transition-all duration-200 border-2 border-transparent hover:border-blue-400"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      mission.difficulty === 'easy' ? 'bg-green-600' :
                      mission.difficulty === 'medium' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}>
                      {mission.difficulty.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{mission.year}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{mission.title}</h3>
                  <p className="text-sm text-gray-300 mb-2">{mission.location}</p>
                  <p className="text-sm text-gray-400 line-clamp-3">{mission.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mission Briefing */}
      {showBriefing && selectedMission && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="mission-panel rounded-xl p-8 max-w-2xl mx-4 fade-in">
            <h2 className="text-4xl font-bold text-yellow-400 text-center mb-4 uppercase tracking-wider border-b-2 border-yellow-400 pb-2">
              {selectedMission.title}
            </h2>
            <div className="mb-4 flex items-center justify-between">
              <span className={`px-3 py-1 text-sm rounded ${
                selectedMission.difficulty === 'easy' ? 'bg-green-600' :
                selectedMission.difficulty === 'medium' ? 'bg-yellow-600' :
                'bg-red-600'
              }`}>
                {selectedMission.difficulty.toUpperCase()}
              </span>
              <span className="text-gray-400">{selectedMission.location}</span>
            </div>
            <p className="text-lg text-gray-200 leading-relaxed mb-6">
              {selectedMission.briefing}
            </p>
            <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-6">
              <h3 className="text-xl font-bold text-blue-400 mb-2">Description:</h3>
              <p className="text-gray-300">{selectedMission.description}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowBriefing(false);
                  setShowMissionSelect(true);
                }}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200"
              >
                BACK
              </button>
              <button
                onClick={startMission}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105"
              >
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
            className="capture-button w-20 h-20 bg-red-600 hover:bg-red-700 border-2 border-white rounded-full flex items-center justify-center disabled:opacity-50"
            title="Capture target photo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-10 h-10 text-white"
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
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="mission-panel rounded-xl p-8 max-w-3xl mx-4 fade-in">
            <h1 className="text-6xl font-bold text-green-400 text-center mb-6">
              SUCCESS!
            </h1>
            <div className="bg-gray-800 bg-opacity-70 rounded-lg p-6 mb-6">
              <h2 className="text-3xl font-bold text-yellow-400 mb-4 text-center">
                {missionResult.mission.title}
              </h2>
              <div className="mb-4">
                <img
                  src={missionResult.mission.issImage}
                  alt={missionResult.mission.title}
                  className="w-full rounded-lg mb-4"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/640x360/1a2a40/00ffc8?text=ISS+Image';
                  }}
                />
              </div>
              <p className="text-lg text-gray-200 mb-4">
                {missionResult.mission.description}
              </p>
              <div className="bg-gray-900 bg-opacity-50 rounded-lg p-4">
                <h3 className="text-xl font-bold text-blue-400 mb-3">Highlights:</h3>
                <ul className="space-y-2">
                  {missionResult.mission.highlights.map((highlight, index) => (
                    <li key={index} className="text-gray-300 flex items-start">
                      <span className="text-green-400 mr-2">✓</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <button
              onClick={handleSuccessContinue}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200"
            >
              CONTINUE
            </button>
          </div>
        </div>
      )}

      {/* Wasted Screen */}
      {showWasted && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 wasted-screen">
          <div className="text-center">
            <h1 className="text-10xl font-bold text-red-500 mb-8">Wasted</h1>
            <div className="flex gap-6 justify-center">
              <button
                onClick={handleRetry}
                className="bg-gray-300 hover:bg-white text-gray-800 px-8 py-3 rounded-lg text-xl font-bold transition-all duration-200"
              >
                RETRY
              </button>
              <button
                onClick={handleExit}
                className="bg-gray-300 hover:bg-white text-gray-800 px-8 py-3 rounded-lg text-xl font-bold transition-all duration-200"
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
            <div className="control-panel rounded-lg p-4 w-56 font-mono text-blue-300">
              <div className="font-bold text-white border-b border-gray-600 mb-2 pb-1">
                SYSTEM
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Power:</span>
                <span className="text-green-400">STABLE</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Oxygen:</span>
                <span className="text-green-400">99.8%</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Pressure:</span>
                <span className="text-green-400">101.2 kPa</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Status:</span>
                <span className="text-green-400">ORBITAL</span>
              </div>
            </div>
          </div>

          <div className="fixed top-8 right-8 z-30">
            <div className="control-panel rounded-lg p-4 w-56 font-mono text-blue-300">
              {selectedMission && (
                <div className="mb-3 pb-3 border-b border-gray-600">
                  <div className="font-bold text-white mb-1">CURRENT MISSION</div>
                  <div className="text-xs text-gray-300">{selectedMission.title}</div>
                </div>
              )}
              <button
                onClick={() => {
                  onResetMission();
                  setShowMissionSelect(true);
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                SELECT DIFFERENT MISSION
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Mission;
