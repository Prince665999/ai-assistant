import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useVoice } from '../../hooks/useVoice';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

export default function ChatInput({ onSend, isLoading }) {
  const [text, setText] = useState('');
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoice();

  // When a voice transcript arrives, drop it straight into the input box
  // so the user can review/edit before sending.
  React.useEffect(() => {
    if (transcript) setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, [transcript]);

  const handleSend = () => {
    if (!text.trim() || isLoading) return;
    onSend(text);
    setText('');
  };

  const handleMicPress = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <View style={styles.container}>
      {isSupported && (
        <TouchableOpacity
          style={[styles.micButton, isListening && styles.micButtonActive]}
          onPress={handleMicPress}
        >
          <Text style={styles.micIcon}>{isListening ? '⏹' : '🎤'}</Text>
        </TouchableOpacity>
      )}

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Ask me anything…"
        placeholderTextColor={COLORS.textMuted}
        multiline
        onSubmitEditing={handleSend}
      />

      <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isLoading || !text.trim()}>
        {isLoading ? <ActivityIndicator color={COLORS.onPrimary} size="small" /> : <Text style={styles.sendIcon}>➤</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.xs,
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  micButton: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  micButtonActive: { backgroundColor: COLORS.danger },
  micIcon: { fontSize: FONT_SIZE.md },
  sendButton: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  sendIcon: { color: COLORS.onPrimary, fontSize: FONT_SIZE.md, fontWeight: '700' },
});
