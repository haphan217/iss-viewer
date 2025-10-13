import React from "react";
import { useTranslation } from "react-i18next";
import "./InfoPanel.css";
import { playClickSound } from "../utils/clickSound";

interface InfoPanelProps {
  isVisible: boolean;
  title: string;
  description: string;
  image: string;
  highlights?: string[];
  onClose: () => void;
  buttonText?: string;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  isVisible,
  title,
  description,
  image,
  highlights = [],
  onClose,
  buttonText,
}) => {
  const { t } = useTranslation();
  if (!isVisible) return null;

  return (
    <div className="info-panel-overlay">
      <div className="info-panel">
        <h2 className="info-panel-title">{t(title)}</h2>
        <div className="viewfinder-wrapper">
          <img
            className="viewfinder-image"
            src={image}
            alt={title}
            onError={(e) => {
              e.currentTarget.src =
                "https://via.placeholder.com/640x360/1a2a40/00ffc8?text=ISS+Image";
            }}
          />
          <div className="overlay-hud"></div>
        </div>
        <div className="info-panel-content">
          <p>{t(description)}</p>
          {highlights && highlights.length > 0 && (
            <ul className="highlights">
              {highlights.map((highlight, index) => (
                <li key={index}>{t(highlight)}</li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={() => {
            playClickSound();
            onClose();
          }}
          className="info-panel-button"
        >
          {buttonText || t("Close")}
        </button>
      </div>
    </div>
  );
};

export default InfoPanel;
