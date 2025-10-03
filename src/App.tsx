import React, { useState } from "react";
import ISSView from "./components/ISSView";
import MissionSelector from "./components/MissionSelector";
import MissionDataPanel from "./components/MissionDataPanel";
import { disasterEvents, type DisasterEvent } from "./data/mockDisasterData";
import "./App.css";

function App() {
  const [selectedMission, setSelectedMission] = useState<DisasterEvent | null>(
    null
  );
  const [isMissionSelectorVisible, setIsMissionSelectorVisible] =
    useState(false);
  const [isDataPanelVisible, setIsDataPanelVisible] = useState(false);

  const handleMissionSelect = (mission: DisasterEvent) => {
    setSelectedMission(mission);
    setIsDataPanelVisible(false); // Close data panel when selecting new mission
  };

  const handleMissionTargetClick = (_mission: DisasterEvent) => {
    setIsDataPanelVisible(true);
  };

  const handleCloseDataPanel = () => {
    setIsDataPanelVisible(false);
  };

  const handleToggleMissionSelector = () => {
    setIsMissionSelectorVisible(!isMissionSelectorVisible);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      {/* 3D ISS View */}
      <ISSView
        selectedMission={selectedMission}
        onMissionTargetClick={handleMissionTargetClick}
      />

      {/* Mission Selector */}
      <MissionSelector
        missions={disasterEvents}
        selectedMission={selectedMission}
        onMissionSelect={handleMissionSelect}
        isVisible={isMissionSelectorVisible}
        onToggle={handleToggleMissionSelector}
      />

      {/* Mission Data Panel */}
      <MissionDataPanel
        mission={selectedMission}
        isVisible={isDataPanelVisible}
        onClose={handleCloseDataPanel}
      />

      {/* Mission Status Indicator */}
      {!isDataPanelVisible && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "15px 20px",
            borderRadius: "8px",
            border: "2px solid #4A90E2",
            zIndex: 1000,
            backdropFilter: "blur(10px)",
            maxWidth: "300px",
          }}
        >
          <h4
            style={{ margin: "0 0 8px 0", color: "#4A90E2", fontSize: "16px" }}
          >
            🛰️ Mission Active
          </h4>
          <p
            style={{
              margin: "0 0 5px 0",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            {selectedMission?.name}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#CCCCCC" }}>
            Nhìn về vị trí đỏ trên Trái đất và click để xem dữ liệu NASA
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
