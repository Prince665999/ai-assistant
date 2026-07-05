import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';

export default function ChatInput({ value, onChangeText, onSend, onVoicePress, isRecording, disabled }) {
  const canSend = value.trim().length > 0 && !disabled;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.iconButton, isRecording && styles.iconButtonActive]}
        onPress={onVoicePress}
        hitSlop={8}
      >
        <Text style={styles.icon}>{isRecording ? '⏹️' : '🎙️'}</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Ask anything..."
        placeholderTextColor="#6b7280"
        multiline
        editable={!disabled}
      />

      <TouchableOpacity
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={!canSend}
      >
        <Text style={styles.sendText}>➤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e4ec',
    backgroundColor: '#f5f6fa',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    color: '#1f2333',
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e4ec',
    marginHorizontal: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: { backgroundColor: '#ef444422' },
  icon: { fontSize: 20 },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: '#e2e4ec' },
  sendText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});