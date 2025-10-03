import React, { useState } from "react";
import { mockDisasterData, type DisasterEvent } from "../data/mockDisasterData";

interface MissionSelectorProps {
  onMissionSelect: (mission: DisasterEvent) => void;
}

const MissionSelector: React.FC<MissionSelectorProps> = ({ onMissionSelect }) => {
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

  const handleMissionClick = (mission: DisasterEvent) => {
    setSelectedMissionId(mission.id);
    onMissionSelect(mission);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "#ff4444";
      case "high":
        return "#ff8844";
      case "medium":
        return "#ffaa44";
      case "low":
        return "#44ff44";
      default:
        return "#ffffff";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "earthquake":
        return "🌋";
      case "flood":
        return "🌊";
      case "wildfire":
        return "🔥";
      case "hurricane":
        return "🌀";
      case "volcano":
        return "🌋";
      default:
        return "⚠️";
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(0, 0, 0, 0.8)",
        padding: "20px",
        borderRadius: "10px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        zIndex: 1000,
        maxWidth: "300px",
      }}
    >
      <h3 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>Active Missions</h3>
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        {mockDisasterData.map((mission) => (
          <div
            key={mission.id}
            onClick={() => handleMissionClick(mission)}
            style={{
              padding: "10px",
              marginBottom: "10px",
              background: selectedMissionId === mission.id ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.1)",
              borderRadius: "5px",
              cursor: "pointer",
              border: `2px solid ${getSeverityColor(mission.severity)}`,
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
              <span style={{ fontSize: "20px", marginRight: "8px" }}>
                {getTypeIcon(mission.type)}
              </span>
              <strong style={{ flex: 1 }}>{mission.title}</strong>
              <span
                style={{
                  padding: "2px 8px",
                  background: getSeverityColor(mission.severity),
                  borderRadius: "10px",
                  fontSize: "10px",
                  fontWeight: "bold",
                }}
              >
                {mission.severity.toUpperCase()}
              </span>
            </div>
            <p style={{ margin: "0 0 5px 0", fontSize: "12px", opacity: 0.8 }}>
              {mission.description}
            </p>
            <div style={{ fontSize: "10px", opacity: 0.6 }}>
              📍 {mission.coordinates.latitude}°, {mission.coordinates.longitude}°
            </div>
            <div style={{ fontSize: "10px", opacity: 0.6 }}>
              🕒 {new Date(mission.timestamp).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "15px", fontSize: "12px", opacity: 0.7 }}>
        <p><strong>Controls:</strong></p>
        <p>WASD - Move (Zero-G Physics)</p>
        <p>Q/E - Up/Down</p>
        <p>Mouse - Look around</p>
        <p>Arrow Keys - Orbital movement</p>
        <p>Mouse Wheel - Zoom orbit</p>
      </div>
    </div>
  );
};

export default MissionSelector;