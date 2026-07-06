import React, { useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import Header from '../../components/common/Header';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useChat } from '../../hooks/useChat';
import { useVoice } from '../../hooks/useVoice';
import { COLORS } from '../../constants/colors';

export default function ChatScreen() {
  const { messages, isLoading, sendMessage, loadHistory } = useChat();
  const { speak } = useVoice();
  const listRef = useRef(null);
  const lastMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messages.length) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [lastMessageId, messages.length]);

  const handleSend = async (text) => {
    try {
      await sendMessage(text);
    } catch (error) {
      console.log('[ChatScreen] send failed:', error?.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <Header title="Chat" subtitle="Your AI Assistant" />

      {messages.length === 0 && !isLoading ? (
        <View style={styles.emptyWrap}>
          <LoadingSpinner label="Say hello to get started!" fullScreen={false} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ChatBubble
              message={item}
              animate={index === messages.length - 1 && item.role === 'assistant'}
              onSpeak={item.role === 'assistant' ? speak : undefined}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  list: { paddingVertical: 12, flexGrow: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center' },
});
