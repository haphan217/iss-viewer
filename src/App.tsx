import React, { useState } from "react";
import ISSView from "./components/ISSView";
import { mockDisasterEvents, type DisasterEvent } from "./data/mockDisasterData";
import "./App.css";

function App() {
  const [selectedMission, setSelectedMission] = useState<DisasterEvent | null>(null);

  const handleMissionTargetClick = (mission: DisasterEvent) => {
    console.log("Mission target clicked:", mission);
    // You can add additional logic here for mission interaction
  };

  return (
    <div className="App">
      <div style={{ 
        position: "fixed", 
        top: 20, 
        right: 20, 
        zIndex: 1000,
        background: "rgba(0,0,0,0.7)",
        padding: "10px",
        borderRadius: "5px",
        color: "white",
        fontFamily: "monospace"
      }}>
        <h3>ISS Disaster Monitoring System</h3>
        <div style={{ marginBottom: "10px" }}>
          <strong>Controls:</strong>
        </div>
        <div style={{ fontSize: "12px", marginBottom: "5px" }}>
          <strong>Orbital Mode (Arrow Keys):</strong>
        </div>
        <div style={{ fontSize: "11px", marginLeft: "10px" }}>
          • Arrow Keys: Orbit around Earth<br/>
          • Mouse Wheel: Zoom in/out<br/>
          • TAB: Switch to First-Person
        </div>
        <div style={{ fontSize: "12px", marginTop: "10px", marginBottom: "5px" }}>
          <strong>First-Person Mode (WASD+QE):</strong>
        </div>
        <div style={{ fontSize: "11px", marginLeft: "10px" }}>
          • WASD: Move forward/back/left/right<br/>
          • QE: Move up/down<br/>
          • Mouse: Look around<br/>
          • TAB: Switch to Orbital
        </div>
        <div style={{ marginTop: "15px" }}>
          <strong>Available Missions:</strong>
        </div>
        <div style={{ fontSize: "11px" }}>
          {mockDisasterEvents.map((mission) => (
            <div 
              key={mission.id}
              style={{ 
                cursor: "pointer", 
                padding: "2px 5px",
                margin: "2px 0",
                background: selectedMission?.id === mission.id ? "#4A90E2" : "transparent",
                borderRadius: "3px"
              }}
              onClick={() => setSelectedMission(mission)}
            >
              {mission.name} ({mission.severity})
            </div>
          ))}
        </div>
        {selectedMission && (
          <div style={{ marginTop: "10px", fontSize: "11px" }}>
            <strong>Selected:</strong> {selectedMission.name}<br/>
            <strong>Type:</strong> {selectedMission.type}<br/>
            <strong>Status:</strong> {selectedMission.status}
          </div>
        )}
      </div>
      
      <ISSView 
        selectedMission={selectedMission}
        onMissionTargetClick={handleMissionTargetClick}
      />
    </div>
  );
}

export default App;