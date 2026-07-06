import { useCallback, useRef, useState } from 'react';
import * as voiceService from '../services/voice';

export function useVoice() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState(null);
  const controllerRef = useRef(null);

  const startListening = useCallback(() => {
    setVoiceError(null);
    setIsListening(true);
    controllerRef.current = voiceService.startListening({
      onResult: (text) => setTranscript(text),
      onError: (error) => {
        setVoiceError(error.message);
        setIsListening(false);
      },
      onEnd: () => setIsListening(false),
    });
  }, []);

  const stopListening = useCallback(() => {
    controllerRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text) => voiceService.speak(text), []);
  const stopSpeaking = useCallback(() => voiceService.stopSpeaking(), []);

  return {
    isListening,
    transcript,
    voiceError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    isSupported: voiceService.isSpeechToTextSupported(),
  };
}

export default useVoice;
