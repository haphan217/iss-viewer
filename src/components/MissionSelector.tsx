import React, { useState } from "react";
import { type DisasterEvent } from "../data/mockDisasterData";

interface MissionSelectorProps {
  missions: DisasterEvent[];
  selectedMission: DisasterEvent | null;
  onMissionSelect: (mission: DisasterEvent) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const MissionSelector: React.FC<MissionSelectorProps> = ({
  missions,
  selectedMission,
  onMissionSelect,
  isVisible,
  onToggle,
}) => {
  const [filter, setFilter] = useState<string>("all");

  const filteredMissions = missions.filter(
    (mission) => filter === "all" || mission.type === filter
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "wildfire":
        return "🔥";
      case "hurricane":
        return "🌀";
      case "flood":
        return "🌊";
      case "earthquake":
        return "🌍";
      case "volcano":
        return "🌋";
      default:
        return "📡";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "wildfire":
        return "#FF6B35";
      case "hurricane":
        return "#4A90E2";
      case "flood":
        return "#0066CC";
      case "earthquake":
        return "#8B4513";
      case "volcano":
        return "#FF4500";
      default:
        return "#666666";
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        style={{
          position: "fixed",
          top: "20px",
          left: "20px",
          zIndex: 1000,
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          border: "2px solid #4A90E2",
          borderRadius: "8px",
          padding: "12px 20px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          backdropFilter: "blur(10px)",
          transition: "all 0.3s ease",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "rgba(74, 144, 226, 0.2)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "rgba(0, 0, 0, 0.8)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isVisible ? "🛰️ Ẩn Missions" : "🛰️ Chọn Mission"}
      </button>

      {/* Mission Panel */}
      {isVisible && (
        <div
          style={{
            position: "fixed",
            top: "80px",
            left: "20px",
            width: "400px",
            maxHeight: "70vh",
            background: "rgba(0, 0, 0, 0.9)",
            border: "2px solid #4A90E2",
            borderRadius: "12px",
            padding: "20px",
            zIndex: 999,
            backdropFilter: "blur(15px)",
            overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          <h2
            style={{
              color: "#4A90E2",
              marginBottom: "20px",
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            🛰️ ISS Cupola Missions
          </h2>

          {/* Filter Buttons */}
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {[
              "all",
              "wildfire",
              "hurricane",
              "flood",
              "earthquake",
              "volcano",
            ].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                style={{
                  background:
                    filter === type ? "#4A90E2" : "rgba(74, 144, 226, 0.2)",
                  color: "white",
                  border: "1px solid #4A90E2",
                  borderRadius: "20px",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "12px",
                  transition: "all 0.3s ease",
                }}
              >
                {type === "all"
                  ? "Tất cả"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          {/* Mission List */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {filteredMissions.map((mission) => (
              <div
                key={mission.id}
                onClick={() => onMissionSelect(mission)}
                style={{
                  background:
                    selectedMission?.id === mission.id
                      ? "rgba(74, 144, 226, 0.3)"
                      : "rgba(255, 255, 255, 0.05)",
                  border:
                    selectedMission?.id === mission.id
                      ? "2px solid #4A90E2"
                      : "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  padding: "15px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
                onMouseOver={(e) => {
                  if (selectedMission?.id !== mission.id) {
                    e.currentTarget.style.background =
                      "rgba(74, 144, 226, 0.1)";
                    e.currentTarget.style.transform = "translateX(5px)";
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedMission?.id !== mission.id) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <span style={{ fontSize: "20px", marginRight: "10px" }}>
                    {getTypeIcon(mission.type)}
                  </span>
                  <h3
                    style={{
                      color: "white",
                      margin: 0,
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {mission.name}
                  </h3>
                </div>

                <p
                  style={{
                    color: "#CCCCCC",
                    margin: "5px 0",
                    fontSize: "12px",
                    lineHeight: "1.4",
                  }}
                >
                  {mission.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <span
                    style={{
                      color: getTypeColor(mission.type),
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {mission.type.toUpperCase()}
                  </span>
                  <span
                    style={{
                      color: "#888888",
                      fontSize: "11px",
                    }}
                  >
                    {new Date(mission.date).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                {selectedMission?.id === mission.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "#4A90E2",
                      color: "white",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredMissions.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#888888",
                padding: "20px",
                fontStyle: "italic",
              }}
            >
              Không có mission nào thuộc loại này
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MissionSelector;
