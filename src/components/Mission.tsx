import React, { useState, useCallback } from "react";

interface MissionState {
  isActive: boolean;
  target: unknown;
  isCapturing: boolean;
}

interface MissionProps {
  missionState: MissionState;
  onStartMission: () => void;
  onCapturePhoto: () => void;
  onResetMission: () => void;
}

const Mission: React.FC<MissionProps> = ({
  missionState,
  onStartMission,
  onCapturePhoto,
  onResetMission,
}) => {
  const [showBriefing, setShowBriefing] = useState(false);
  const [showWasted, setShowWasted] = useState(false);

  // Handle mission results based on state changes
  React.useEffect(() => {
    if (missionState.isActive && !missionState.isCapturing) {
      // Check if mission was just completed (this would need to be tracked differently)
      // For now, we'll handle this through the target hit callback in ISSView
    }
  }, [missionState]);

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
    setShowWasted(false);
    setTimeout(() => setShowBriefing(true), 100);
  }, [onResetMission]);

  // Handle exit
  const handleExit = useCallback(() => {
    onResetMission();
    setShowWasted(false);
  }, [onResetMission]);

  return (
    <>
      {/* Mission Briefing */}
      {showBriefing && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="mission-panel rounded-xl p-8 max-w-2xl mx-4 fade-in">
            <h2 className="text-4xl font-bold text-yellow-400 text-center mb-4 uppercase tracking-wider border-b-2 border-yellow-400 pb-2">
              Nhiệm vụ: Tìm & Chụp
            </h2>
            <p className="text-lg text-gray-200 leading-relaxed mb-8 text-center">
              Chào phi hành gia. Một mục tiêu trinh sát đã được đánh dấu màu đỏ
              trên bề mặt hành tinh.
              <br />
              <br />
              Hãy điều khiển tàu quanh quỹ đạo, xác định vị trí mục tiêu và chụp
              một bức ảnh rõ nét. Chúc may mắn!
            </p>
            <button
              onClick={startMission}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-xl transition-all duration-200 transform hover:scale-105"
            >
              CHẤP NHẬN NHIỆM VỤ
            </button>
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
            title="Chụp ảnh mục tiêu"
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

      {/* Mission Passed Screen - handled by parent component */}

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
                LÀM LẠI
              </button>
              <button
                onClick={handleExit}
                className="bg-gray-300 hover:bg-white text-gray-800 px-8 py-3 rounded-lg text-xl font-bold transition-all duration-200"
              >
                THOÁT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Panels */}
      <div className="fixed top-8 left-8 z-30">
        <div className="control-panel rounded-lg p-4 w-56 font-mono text-blue-300">
          <div className="font-bold text-white border-b border-gray-600 mb-2 pb-1">
            HỆ THỐNG
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Năng lượng:</span>
            <span className="text-green-400">ỔN ĐỊNH</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Oxy:</span>
            <span className="text-green-400">99.8%</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Áp suất:</span>
            <span className="text-green-400">101.2 kPa</span>
          </div>
          <div className="flex justify-between text-sm mb-1">
            <span>Trạng thái:</span>
            <span className="text-green-400">QUỸ ĐẠO</span>
          </div>
        </div>
      </div>

      <div className="fixed top-8 right-8 z-30">
        <div className="control-panel rounded-lg p-4 w-56 font-mono text-blue-300">
          <button
            onClick={() => setShowBriefing(true)}
            className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            NHIỆM VỤ MỚI
          </button>
        </div>
      </div>
    </>
  );
};

export default Mission;
