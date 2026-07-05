import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import ToolBadge from './ToolBadge';
import StreamingText from './StreamingText';

export default function ChatBubble({ message, isStreaming, onStreamDone }) {
  const isUser = message.role === 'user';

  const speak = () => {
    Speech.stop();
    Speech.speak(message.content, { rate: 1.0 });
  };

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        {isStreaming ? (
          <StreamingText
            text={message.content}
            onDone={onStreamDone}
            style={[styles.text, isUser && styles.textUser]}
          />
        ) : (
          <Text style={[styles.text, isUser && styles.textUser]}>{message.content}</Text>
        )}

        {!isUser && <ToolBadge tool={message.tool_used} />}

        {!isUser && !isStreaming && (
          <TouchableOpacity onPress={speak} style={styles.ttsButton} hitSlop={8}>
            <Text style={styles.ttsIcon}>🔊</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', marginBottom: 8, flexDirection: 'row' },
  rowUser: { justifyContent: 'flex-end' },
  rowAssistant: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e4ec',
  },
  text: { fontSize: 16, color: '#1f2333' },
  textUser: { color: '#ffffff' },
  ttsButton: { marginTop: 4, alignSelf: 'flex-start' },
  ttsIcon: { fontSize: 16 },
});