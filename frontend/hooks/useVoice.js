import { useState, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import voiceService from '../services/voice';

// Gives ChatInput one simple API regardless of platform:
//   startListening(onResult, onError) / stopListening(onResult)
export default function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const isSupported =
    Platform.OS !== 'web' ||
    (typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition));

  const startListening = useCallback((onResult, onError) => {
    if (Platform.OS === 'web') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        onError?.('Voice input is not supported in this browser');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        onResult?.(event.results[0][0].transcript);
      };
      recognition.onerror = (event) => {
        onError?.(event.error);
        setIsRecording(false);
      };
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } else {
      voiceService
        .startRecording()
        .then(() => setIsRecording(true))
        .catch((err) => onError?.(err.message));
    }
  }, []);

  const stopListening = useCallback(async (onResult) => {
    if (Platform.OS === 'web') {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const uri = await voiceService.stopRecording();
      setIsRecording(false);
      // No transcription endpoint yet on native — see services/voice.js note.
      onResult?.(null, uri);
    }
  }, []);

  const speak = useCallback((text) => voiceService.speak(text), []);
  const stopSpeaking = useCallback(() => voiceService.stopSpeaking(), []);

  return { isRecording, isSupported, startListening, stopListening, speak, stopSpeaking };
}