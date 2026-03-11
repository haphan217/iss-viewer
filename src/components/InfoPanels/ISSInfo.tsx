import { useTranslation } from "react-i18next";

interface ISSInfoProps {
  visible?: boolean;
}

const ISSInfo = ({ visible = false }: ISSInfoProps) => {
  const { t } = useTranslation();
  return (
    <div id="iss-info" style={{ display: visible ? "block" : "none" }}>
      <h3>🛰️ {t("ISS Orbit")}</h3>
      <div className="info-row">
        <span className="info-label">{t("Speed:")}</span>
        <span className="info-value">{t("27,600 km/h")}</span>
      </div>
      <div className="info-row">
        <span className="info-label">{t("Altitude:")}</span>
        <span className="info-value">{t("~408 km")}</span>
      </div>
      <div className="info-row">
        <span className="info-label">{t("Orbital period:")}</span>
        <span className="info-value">{t("~92.7 minutes")}</span>
      </div>
      <div className="info-row">
        <span className="info-label">{t("Inclination:")}</span>
        <span className="info-value">{t("51.6°")}</span>
      </div>
      <div className="info-row">
        <span className="info-label">{t("Orbits/day:")}</span>
        <span className="info-value">{t("~15.5 times")}</span>
      </div>
      <div className="info-row">
        <span className="info-label">{t("Earth radius:")}</span>
        <span className="info-value">{t("6,371 km")}</span>
      </div>
      <div className="scale-note">
        ⚠️ &nbsp;{t("Note:")}
        {t(
          "ISS is magnified ~11,500x for easier observation. In reality, ISS is only 109m long, extremely small compared to Earth."
        )}
      </div>
    </div>
  );
};

export default ISSInfo;
