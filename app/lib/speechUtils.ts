export const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE'; // German language
      utterance.rate = 1; // Speed of speech (1 is normal)
      utterance.pitch = 1; // Pitch (1 is normal)
      speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser doesn't support text-to-speech!");
    }
  };
  