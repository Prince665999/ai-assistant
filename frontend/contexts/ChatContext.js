import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

// Holds the live chat conversation in memory for the current session.
// Persisted history (across app restarts) is fetched separately from the
// backend via services/chat.js - this context is just the "live view".
export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState(null);

  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, ...message }]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentResponse(null);
  }, []);

  const value = {
    messages,
    isLoading,
    currentResponse,
    setIsLoading,
    setCurrentResponse,
    addMessage,
    clearMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within a ChatProvider');
  return ctx;
}

export default ChatContext;
