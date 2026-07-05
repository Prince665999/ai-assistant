import React, { createContext, useState, useCallback } from 'react';
import chatService from '../services/chat';

export const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(null);
  const [error, setError] = useState(null);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const loadHistory = useCallback(async (limit = 20) => {
    try {
      const history = await chatService.getHistory(limit);
      setMessages(
        history.map((item, index) => ({
          id: item.id ?? `history-${index}`,
          role: item.role,
          content: item.content,
          tool_used: item.tool_used,
          created_at: item.created_at,
        }))
      );
    } catch (err) {
      setError('Could not load your previous messages.');
    }
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      setError(null);
      addMessage({
        id: `local-user-${Date.now()}`,
        role: 'user',
        content: text,
        created_at: new Date().toISOString(),
      });
      setIsLoading(true);
      setCurrentResponse(null);

      try {
        const data = await chatService.sendMessage(text);
        const assistantMessage = {
          id: `local-assistant-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          tool_used: data.tool_used,
          tokens_used: data.tokens_used,
          latency_ms: data.latency_ms,
          created_at: new Date().toISOString(),
          justArrived: true, // tells ChatBubble to animate only this one
        };
        addMessage(assistantMessage);
        return assistantMessage;
      } catch (err) {
        setError("Something went wrong sending that message. Please try again.");
        addMessage({
          id: `local-error-${Date.now()}`,
          role: 'assistant',
          content: "Sorry, I couldn't process that. Please try again.",
          created_at: new Date().toISOString(),
          isError: true,
        });
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage]
  );

  const clearMessages = useCallback(async () => {
    try {
      await chatService.clearHistory();
    } finally {
      setMessages([]);
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isLoading,
        currentResponse,
        error,
        addMessage,
        sendMessage,
        loadHistory,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}