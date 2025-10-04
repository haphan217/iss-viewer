export const speak = (text: string, options?: Partial<SpeechSynthesisUtterance>) => {
  console.log('Speak function called with text:', text);

  if (!('speechSynthesis' in window)) {
    console.error('Text-to-speech not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Wait for voices to be loaded
  const speakText = () => {
    const utterance = new SpeechSynthesisUtterance(text);

    // Set default properties
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (options) {
      Object.assign(utterance, options);
    }

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices.length);

    if (voices.length > 0) {
      // Use the first English voice if available
      const englishVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      utterance.voice = englishVoice;
      console.log('Using voice:', englishVoice.name);
    }

    utterance.onstart = () => console.log('Speech started');
    utterance.onend = () => console.log('Speech ended');
    utterance.onerror = (event) => console.error('Speech error:', event);

    console.log('Calling speechSynthesis.speak()');
    window.speechSynthesis.speak(utterance);
  };

  // Voices might not be loaded immediately
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    speakText();
  } else {
    // Wait for voices to load
    window.speechSynthesis.onvoiceschanged = () => {
      speakText();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
