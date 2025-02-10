export function speakText(text: string) {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }
  
    const utterance = new SpeechSynthesisUtterance(text);
  
    // Log available voices to the console
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices);
  
    // Try to find a German voice
    const germanVoice = voices.find(voice => voice.lang.includes('de'));
  
    if (germanVoice) {
      utterance.voice = germanVoice; // Use the German voice
    } else {
      utterance.lang = 'de-DE'; // Fallback to German language if voice not found
    }
  
    utterance.rate = 0.9;  // Adjust speed if necessary
    utterance.pitch = 1.0; // Adjust pitch if necessary
  
    window.speechSynthesis.speak(utterance);
  }
  