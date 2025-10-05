import clickSound from '../assets/mouse-click.mp3';
import cameraFlashSound from '../assets/camera-flash.mp3';
import noLuckSound from '../assets/no-luck.mp3';
import congratulationsSound from '../assets/congratulations.mp3';

let clickAudio: HTMLAudioElement | null = null;
let cameraFlashAudio: HTMLAudioElement | null = null;
let noLuckAudio: HTMLAudioElement | null = null;
let congratulationsAudio: HTMLAudioElement | null = null;

// Initialize the audio element
const initClickAudio = () => {
  if (!clickAudio) {
    clickAudio = new Audio(clickSound);
  }
};

const initCameraFlashAudio = () => {
  if (!cameraFlashAudio) {
    cameraFlashAudio = new Audio(cameraFlashSound);
  }
};

const initNoLuckAudio = () => {
  if (!noLuckAudio) {
    noLuckAudio = new Audio(noLuckSound);
  }
};

const initCongratulationsAudio = () => {
  if (!congratulationsAudio) {
    congratulationsAudio = new Audio(congratulationsSound);
  }
};

// Play click sound
export const playClickSound = () => {
  initClickAudio();
  if (clickAudio) {
    clickAudio.currentTime = 0;
    clickAudio.play().catch((error) => {
      console.log("Click sound playback failed:", error);
    });
  }
};

// Play camera flash sound
export const playCameraFlashSound = () => {
  initCameraFlashAudio();
  if (cameraFlashAudio) {
    cameraFlashAudio.currentTime = 0;
    cameraFlashAudio.play().catch((error) => {
      console.log("Camera flash sound playback failed:", error);
    });
  }
};

// Play no luck sound
export const playNoLuckSound = () => {
  initNoLuckAudio();
  if (noLuckAudio) {
    noLuckAudio.currentTime = 0;
    noLuckAudio.play().catch((error) => {
      console.log("No luck sound playback failed:", error);
    });
  }
};

// Play congratulations sound
export const playCongratulationsSound = () => {
  initCongratulationsAudio();
  if (congratulationsAudio) {
    congratulationsAudio.currentTime = 0;
    congratulationsAudio.play().catch((error) => {
      console.log("Congratulations sound playback failed:", error);
    });
  }
};
