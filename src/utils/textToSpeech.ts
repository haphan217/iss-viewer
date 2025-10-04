export const speak = (text: string, options?: Partial<SpeechSynthesisUtterance>) => {
  console.log('Speak function called with text:', text);

  if (!('speechSynthesis' in window)) {
    console.error('Text-to-speech not supported in this browser');
    return;
  }

  // If speech is already in progress, queue this message instead of canceling
  const isSpeaking = window.speechSynthesis.speaking;
  if (isSpeaking) {
    console.log('Speech already in progress, queueing message');
    // Don't cancel, let it queue naturally
  }

  const getBestVoice = (preferredNames: string[] = ['Google US English', 'Microsoft Zira', 'Karen',  'Samantha']) => {
    const voices = speechSynthesis.getVoices();
    
    // Try preferred voices first
    for (const name of preferredNames) {
      const voice = voices.find(v => v.name.includes(name));
      if (voice) return voice;
    }
    
    // Fallback to first en-US voice
    return voices.find(v => v.lang === 'en-US') || voices[0];
  };

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

    // Use the first English voice if available
    const englishVoice = getBestVoice()
    utterance.voice = englishVoice;
    console.log('Using voice:', englishVoice.name);

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
