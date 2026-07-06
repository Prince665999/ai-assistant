import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StreamingText from './StreamingText';
import ToolBadge from './ToolBadge';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, SHADOW } from '../../constants/theme';

export default function ChatBubble({ message, animate = false, onSpeak }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAssistant,
          message.isError && styles.bubbleError,
        ]}
      >
        {isUser || !animate ? (
          <Text style={[styles.text, isUser && styles.textUser]}>{message.content}</Text>
        ) : (
          <StreamingText text={message.content} />
        )}

        {!isUser && !!message.toolUsed && <ToolBadge tool={message.toolUsed} />}

        {!isUser && !message.isError && !!onSpeak && (
          <TouchableOpacity onPress={() => onSpeak(message.content)} style={styles.speakButton}>
            <Text style={styles.speakText}>🔊 Play</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { width: '100%', paddingHorizontal: SPACING.md, marginBottom: SPACING.sm },
  rowUser: { alignItems: 'flex-end' },
  rowAssistant: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOW,
  },
  bubbleUser: { backgroundColor: COLORS.chatBubbleUser, borderBottomRightRadius: 4 },
  bubbleAssistant: { backgroundColor: COLORS.chatBubbleAssistant, borderBottomLeftRadius: 4 },
  bubbleError: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: COLORS.danger },
  text: { fontSize: FONT_SIZE.md, color: COLORS.text, lineHeight: 22 },
  textUser: { color: COLORS.onPrimary },
  speakButton: { marginTop: SPACING.xs, alignSelf: 'flex-start' },
  speakText: { fontSize: FONT_SIZE.xs, color: COLORS.primary, fontWeight: '600' },
});
