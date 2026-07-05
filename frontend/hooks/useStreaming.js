import { useState, useEffect, useRef } from 'react';

// The backend's /chat/ endpoint returns the full response in one shot (no
// token-by-token SSE yet), so true streaming isn't available. To still
// practice the streaming UI pattern, this hook reveals the finished text
// progressively on the client, word by word, so it *looks* like it's typing.
export default function useStreaming(fullText, { speedMs = 30, enabled = true } = {}) {
  const [displayedText, setDisplayedText] = useState(enabled ? '' : fullText || '');
  const [isStreaming, setIsStreaming] = useState(!!enabled && !!fullText);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!enabled || !fullText) {
      setDisplayedText(fullText || '');
      setIsStreaming(false);
      return undefined;
    }

    setDisplayedText('');
    setIsStreaming(true);
    indexRef.current = 0;
    const words = fullText.split(' ');

    const interval = setInterval(() => {
      indexRef.current += 1;
      setDisplayedText(words.slice(0, indexRef.current).join(' '));
      if (indexRef.current >= words.length) {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [fullText, enabled, speedMs]);

  return { displayedText, isStreaming };
}