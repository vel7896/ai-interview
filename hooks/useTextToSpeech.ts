import { useState, useCallback, useEffect } from 'react';

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string, onEndCallback?: () => void) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEndCallback) {
          onEndCallback();
        }
      };
      
      utterance.onerror = () => {
          setIsSpeaking(false);
      }

      window.speechSynthesis.cancel(); 
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Text-to-speech is not supported in this browser.');
      if (onEndCallback) {
        onEndCallback();
      }
    }
  }, []);
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis?.speaking) {
         window.speechSynthesis.cancel();
         setIsSpeaking(false);
      }
    }
  }, []);

  return { speak, isSpeaking };
};

export default useTextToSpeech;