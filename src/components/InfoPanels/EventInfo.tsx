import "../../styles/InfoPanel.css";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { playClickSound } from "../../utils/clickSound";

interface InfoPanelProps {
  isVisible: boolean;
  title: string;
  description: string;
  image: string;
  highlights?: string[];
  satellite?: string;
  onClose: () => void;
  buttonText?: string;
}

const EventInfo: React.FC<InfoPanelProps> = ({
  isVisible,
  title,
  description,
  image,
  highlights = [],
  satellite,
  onClose,
  buttonText,
}) => {
  const { t } = useTranslation();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (isVisible) setIsImageLoaded(false);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="info-panel-overlay">
      <div className="info-panel relative">
        <div
          className="close-icon absolute top-4 right-4 cursor-pointer hover:scale-110 transition-transform"
          onClick={() => {
            playClickSound();
            onClose();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="info-panel-title">{t(title)}</h2>
        <div className="viewfinder-wrapper">
          {/* Skeleton */}
          <div
            style={{
              animationDuration: "4s",
              display: isImageLoaded ? "none" : "flex",
            }}
            className="absolute animate-pulse items-center justify-center w-full h-full bg-gray-700"
          >
            <svg
              className="w-10 h-10 text-gray-600"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 18"
            >
              <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
            </svg>
          </div>
          <img
            className={`viewfinder-image ${isImageLoaded ? "block" : "hidden"}`}
            onLoad={() => setIsImageLoaded(true)}
            src={image}
            alt={title}
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
          {satellite && <p>{t("Satellite")}: {satellite}</p>}
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

export default EventInfo;
