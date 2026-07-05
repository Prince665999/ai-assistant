import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

// NOTE (kept simple on purpose): the backend in this project does not expose
// a speech-to-text endpoint yet, only /chat/. So:
//  - On web, voice input uses the browser's built-in Web Speech API
//    (handled directly in hooks/useVoice.js), which gives us live text
//    with zero extra backend work.
//  - On native (iOS/Android), we record audio with expo-av so the mic
//    button works and feels real, but there's nowhere to send the file for
//    transcription yet. If you add a /voice/transcribe endpoint later,
//    stopRecording() is the place to upload the returned uri.

let activeRecording = null;

const voiceService = {
  startRecording: async () => {
    if (Platform.OS === 'web') return null; // web uses Web Speech API instead

    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Microphone permission was not granted');
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    activeRecording = new Audio.Recording();
    await activeRecording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    await activeRecording.startAsync();
    return activeRecording;
  },

  stopRecording: async () => {
    if (!activeRecording) return null;
    await activeRecording.stopAndUnloadAsync();
    const uri = activeRecording.getURI();
    activeRecording = null;
    return uri; // hand this off to a transcription endpoint once one exists
  },

  speak: (text) => {
    if (!text) return;
    Speech.stop();
    Speech.speak(text, { language: 'en-US', pitch: 1.0, rate: 1.0 });
  },

  stopSpeaking: () => {
    Speech.stop();
  },

  isSpeakingAsync: async () => Speech.isSpeakingAsync(),
};

export default voiceService;