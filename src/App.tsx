import React, { useState } from "react";
import ISSView from "./components/ISSView";
import MissionSelector from "./components/MissionSelector";
import { type DisasterEvent } from "./data/mockDisasterData";

const App: React.FC = () => {
  const [selectedMission, setSelectedMission] = useState<DisasterEvent | null>(null);

  const handleMissionSelect = (mission: DisasterEvent) => {
    setSelectedMission(mission);
  };

  const handleMissionTargetClick = (mission: DisasterEvent) => {
    // Handle mission target interaction
    console.log("Mission target clicked:", mission.title);
    // You could implement additional mission details or actions here
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
      <ISSView
        selectedMission={selectedMission}
        onMissionTargetClick={handleMissionTargetClick}
      />
      <MissionSelector onMissionSelect={handleMissionSelect} />
    </div>
  );
};

export default App;