import { useCallback, useEffect } from 'react';
import { useChatContext } from '../contexts/ChatContext';
import * as chatService from '../services/chat';

// End-to-end chat sending logic lives here so ChatScreen.js stays focused
// on layout/rendering.
export function useChat() {
  const {
    messages, isLoading, currentResponse,
    setIsLoading, setCurrentResponse, addMessage, clearMessages,
  } = useChatContext();

  const loadHistory = useCallback(async () => {
    try {
      const history = await chatService.getHistory(50);
      const mapped = (history || []).slice().reverse().map((item) => ({
        id: `history-${item.id}`,
        role: item.role,
        content: item.content,
        toolUsed: item.tool_used,
        createdAt: item.created_at,
      }));
      mapped.forEach((m) => addMessage(m));
    } catch (error) {
      console.log('[chat] failed to load history:', error?.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return null;

    addMessage({ role: 'user', content: trimmed });
    setIsLoading(true);
    setCurrentResponse(null);

    try {
      const result = await chatService.sendMessage(trimmed);
      addMessage({
        role: 'assistant',
        content: result.response,
        toolUsed: result.tool_used,
        tokensUsed: result.tokens_used,
        latencyMs: result.latency_ms,
      });
      setCurrentResponse(result);
      return result;
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: "Sorry, I couldn't reach the server. Please check your connection and try again.",
        isError: true,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, setIsLoading, setCurrentResponse]);

  const resetChat = useCallback(async () => {
    try {
      await chatService.clearHistory();
    } finally {
      clearMessages();
    }
  }, [clearMessages]);

  return { messages, isLoading, currentResponse, sendMessage, loadHistory, resetChat };
}

export default useChat;
