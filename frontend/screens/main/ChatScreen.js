import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import Header from '../../components/common/Header';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import { sendMessage } from '../../services/chat';

let idCounter = 0;
const nextId = () => `local-${Date.now()}-${idCounter++}`;

export default function ChatScreen() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const listRef = useRef(null);

  const scrollToEnd = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMessage = { id: nextId(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    scrollToEnd();

    try {
      const data = await sendMessage(text);
      const assistantMessage = {
        id: nextId(),
        role: 'assistant',
        content: data.response,
        tool_used: data.tool_used,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingId(assistantMessage.id);
      scrollToEnd();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          content: "Sorry, something went wrong reaching the assistant. Please try again.",
          tool_used: null,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending]);

  const handleVoicePress = useCallback(() => {
    if (Platform.OS === 'web' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.start();
    } else {
      Alert.alert(
        'Voice input',
        'Speech-to-text on native needs a backend transcription endpoint, which isn\'t built yet. Try this on web for now, or type your message.'
      );
    }
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Header title="Chat" subtitle="Talk to your AI Assistant" />

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ChatBubble
            message={item}
            isStreaming={item.id === streamingId}
            onStreamDone={() => setStreamingId(null)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Ask me anything to get started.</Text>
          </View>
        }
      />

      {isSending && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color="#667eea" />
          <Text style={styles.typingText}>Thinking…</Text>
        </View>
      )}

      <ChatInput
        value={input}
        onChangeText={setInput}
        onSend={handleSend}
        onVoicePress={handleVoicePress}
        isRecording={isRecording}
        disabled={isSending}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  list: { padding: 16, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { color: '#6b7280', fontSize: 16 },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  typingText: { marginLeft: 8, color: '#6b7280', fontSize: 14 },
});