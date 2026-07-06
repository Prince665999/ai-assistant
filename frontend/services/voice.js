// Voice is deliberately kept simple for this learning project:
//
// - Speech-to-text: only implemented for web, using the browser's native
//   Web Speech API (SpeechRecognition). No native audio recording/backend
//   transcription pipeline is implemented, since the backend does not
//   currently expose an STT endpoint. On native (iOS/Android) this
//   resolves with an "unsupported" result instead of failing silently.
// - Text-to-speech: expo-speech on native, window.speechSynthesis on web.
import { Platform } from 'react-native';
import * as Speech from 'expo-speech';

export function isSpeechToTextSupported() {
  if (Platform.OS !== 'web') return false;
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

// Returns a controller: { stop() }. `onResult` is called once with the
// final transcript, `onError` on failure/unsupported.
export function startListening({ onResult, onError, onEnd }) {
  if (!isSpeechToTextSupported()) {
    onError?.(new Error('Voice input is only available in the web version right now.'));
    return { stop: () => {} };
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results?.[0]?.[0]?.transcript || '';
    onResult?.(transcript);
  };
  recognition.onerror = (event) => onError?.(new Error(event.error || 'Speech recognition error'));
  recognition.onend = () => onEnd?.();

  recognition.start();
  return { stop: () => recognition.stop() };
}

export function speak(text) {
  if (!text) return;
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
    return;
  }
  Speech.stop();
  Speech.speak(text);
}

export function stopSpeaking() {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    return;
  }
  Speech.stop();
}

export default { isSpeechToTextSupported, startListening, speak, stopSpeaking };
