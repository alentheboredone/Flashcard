export function speakText(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
  
      // Ensure voices are loaded properly
      window.speechSynthesis.onvoiceschanged = () => {
        const voices = window.speechSynthesis.getVoices();
        
        // Try to find a German voice
        const germanVoice = voices.find(voice => voice.lang.includes('de'));
  
        if (germanVoice) {
          utterance.voice = germanVoice; // Use the German voice
        } else {
          utterance.lang = 'de-DE'; // Fallback to German language
        }
  
        utterance.rate = 0.9;  // Adjust speed if necessary
        utterance.pitch = 1.0; // Adjust pitch if necessary
  
        window.speechSynthesis.speak(utterance);
      };
  
      // Trigger voice loading if not yet available
      window.speechSynthesis.getVoices();
    } else {
      console.error('Speech synthesis is not supported in this browser.');
    }
  }
  