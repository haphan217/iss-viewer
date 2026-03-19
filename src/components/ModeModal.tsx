import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  mode: AppMode
  onModeChange: (mode:AppMode) => void
  onClose: VoidFunction
  open: boolean
}

export type AppMode = "explore" | "mission";

const ModeModal = ({open, mode, onClose, onModeChange}: Props) => {
  const {t} = useTranslation()
  const FULL_TITLE = t("MISSION CONTROL");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [typedTitle, setTypedTitle] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showModalContent, setShowModalContent] = useState(false);
  
  useEffect(() => {
    if (!open) {
      setIsModalVisible(false);
      return
    }

    setTypedTitle("");
    setShowModalContent(false);
    setIsTyping(true);

    const visibilityTimer = setTimeout(() => setIsModalVisible(true), 10);

    let charIndex = -1;
    const typingInterval = setInterval(() => {
      if (charIndex < FULL_TITLE.length) {
        setTypedTitle((prev) => prev + FULL_TITLE.charAt(charIndex));
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        setTimeout(() => setShowModalContent(true), 300);
      }
    }, 90);

    return () => {
      clearTimeout(visibilityTimer);
      clearInterval(typingInterval);
    };
  }, [open]);

  if(!open) return null;

  return <div
          className={`fixed inset-0 w-screen h-screen flex items-center justify-center z-50 bg-black/70 backdrop-blur-md transition-opacity duration-300 ease-in-out ${
            isModalVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={onClose}
        >
          <div
            className={`rounded-lg p-1 min-w-[480px] max-w-lg text-cyan-300 bg-slate-900/50 transition-all duration-300 ease-in-out border border-transparent ${
              isModalVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            } ${isModalVisible ? "modal-flicker" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full bg-slate-900/90 rounded p-8">
              <h2 className="m-0 mb-8 text-center text-3xl tracking-[0.3em] font-bold text-cyan-300 h-12">
                <span
                  className={isTyping ? "typing-effect" : "typing-effect-done"}
                >
                  {typedTitle}
                </span>
              </h2>

              <div
                className={`transition-opacity duration-500 ease-in ${
                  showModalContent ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => onModeChange("explore")}
                    className={`mode-button text-lg ${
                      mode === "explore" ? "active" : ""
                    }`}
                  >
                    <span className="text-2xl">🌌</span>{" "}
                    <span>{t("EXPLORE")}</span>
                  </button>
                  <button
                    onClick={() => onModeChange("mission")}
                    className={`mode-button text-lg ${
                      mode === "mission" ? "active" : ""
                    }`}
                  >
                    <span className="text-2xl">🛰️</span>{" "}
                    <span>{t("MISSION")}</span>
                  </button>
                </div>
                <div className="text-center text-sm opacity-50 border-t border-cyan-400/20 pt-6 mt-8">
                  {t("CURRENT MODE:")} {t(mode.toUpperCase())}
                </div>
              </div>
            </div>
          </div>
        </div>
}

export default ModeModal