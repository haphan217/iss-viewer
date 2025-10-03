import React from "react";
import { type DisasterEvent } from "../data/mockDisasterData";

interface MissionDataPanelProps {
  mission: DisasterEvent | null;
  isVisible: boolean;
  onClose: () => void;
}

const MissionDataPanel: React.FC<MissionDataPanelProps> = ({
  mission,
  isVisible,
  onClose,
}) => {
  if (!mission || !isVisible) return null;

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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0, 0, 0, 0.95)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(10px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #001122 0%, #002244 100%)",
          border: "3px solid #4A90E2",
          borderRadius: "20px",
          padding: "40px",
          maxWidth: "900px",
          maxHeight: "80vh",
          width: "90%",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(255, 0, 0, 0.2)",
            border: "2px solid #FF0000",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            color: "white",
            cursor: "pointer",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255, 0, 0, 0.4)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(255, 0, 0, 0.2)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: "30px", textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "15px",
            }}
          >
            <span style={{ fontSize: "40px", marginRight: "15px" }}>
              {getTypeIcon(mission.type)}
            </span>
            <h1
              style={{
                color: "#4A90E2",
                margin: 0,
                fontSize: "28px",
                fontWeight: "bold",
              }}
            >
              {mission.name}
            </h1>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                color: getTypeColor(mission.type),
                fontSize: "14px",
                fontWeight: "bold",
                background: "rgba(255, 255, 255, 0.1)",
                padding: "5px 15px",
                borderRadius: "20px",
                border: `1px solid ${getTypeColor(mission.type)}`,
              }}
            >
              {mission.type.toUpperCase()}
            </span>
            <span
              style={{
                color: "#CCCCCC",
                fontSize: "14px",
                background: "rgba(255, 255, 255, 0.1)",
                padding: "5px 15px",
                borderRadius: "20px",
              }}
            >
              {new Date(mission.date).toLocaleDateString("vi-VN")}
            </span>
          </div>
        </div>

        {/* NASA Image Section */}
        <div style={{ marginBottom: "30px" }}>
          <h3
            style={{
              color: "#4A90E2",
              marginBottom: "15px",
              fontSize: "18px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
            }}
          >
            🛰️ Quan sát từ ISS
          </h3>
          <div
            style={{
              background: "rgba(0, 0, 0, 0.5)",
              border: "2px solid #4A90E2",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                background: "linear-gradient(45deg, #001122, #002244)",
                border: "1px solid #4A90E2",
                borderRadius: "8px",
                padding: "40px",
                marginBottom: "15px",
                minHeight: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>
                {getTypeIcon(mission.type)}
              </div>
              <p
                style={{
                  color: "#CCCCCC",
                  margin: 0,
                  fontSize: "14px",
                  fontStyle: "italic",
                }}
              >
                {mission.nasaImageDescription}
              </p>
              <p
                style={{
                  color: "#888888",
                  margin: "10px 0 0 0",
                  fontSize: "12px",
                }}
              >
                [Hình ảnh thực từ NASA sẽ được tích hợp ở đây]
              </p>
            </div>
          </div>
        </div>

        {/* Mission Details */}
        <div style={{ marginBottom: "30px" }}>
          <h3
            style={{
              color: "#4A90E2",
              marginBottom: "15px",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            📊 Thông tin Mission
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div>
              <h4
                style={{
                  color: "#FFFFFF",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Tọa độ:
              </h4>
              <p style={{ color: "#CCCCCC", margin: 0, fontSize: "13px" }}>
                Vĩ độ: {mission.coordinates.latitude}°<br />
                Kinh độ: {mission.coordinates.longitude}°
              </p>
            </div>
            <div>
              <h4
                style={{
                  color: "#FFFFFF",
                  marginBottom: "8px",
                  fontSize: "14px",
                }}
              >
                Quỹ đạo ISS:
              </h4>
              <p style={{ color: "#CCCCCC", margin: 0, fontSize: "13px" }}>
                Độ cao: {mission.orbitPosition.altitude} km
                <br />
                Độ nghiêng: {mission.orbitPosition.inclination}°
              </p>
            </div>
          </div>
        </div>

        {/* Impact Information */}
        <div style={{ marginBottom: "30px" }}>
          <h3
            style={{
              color: "#4A90E2",
              marginBottom: "15px",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            ⚠️ Tác động
          </h3>
          <div
            style={{
              background: "rgba(255, 107, 53, 0.1)",
              border: "1px solid #FF6B35",
              borderRadius: "8px",
              padding: "15px",
            }}
          >
            <p
              style={{
                color: "#FFFFFF",
                margin: 0,
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              {mission.impact}
            </p>
          </div>
        </div>

        {/* Humanitarian Benefit */}
        <div>
          <h3
            style={{
              color: "#4A90E2",
              marginBottom: "15px",
              fontSize: "18px",
              fontWeight: "bold",
            }}
          >
            🌍 Lợi ích cho Nhân loại
          </h3>
          <div
            style={{
              background: "rgba(74, 144, 226, 0.1)",
              border: "1px solid #4A90E2",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <p
              style={{
                color: "#FFFFFF",
                margin: 0,
                fontSize: "14px",
                lineHeight: "1.6",
                textAlign: "justify",
              }}
            >
              {mission.humanitarianBenefit}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "30px",
            textAlign: "center",
            paddingTop: "20px",
            borderTop: "1px solid rgba(74, 144, 226, 0.3)",
          }}
        >
          <p
            style={{
              color: "#888888",
              margin: 0,
              fontSize: "12px",
              fontStyle: "italic",
            }}
          >
            Dữ liệu từ International Space Station • NASA Earth Observatory
          </p>
        </div>
      </div>
    </div>
  );
};

export default MissionDataPanel;
