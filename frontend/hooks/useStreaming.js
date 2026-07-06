import { useEffect, useRef, useState, useCallback } from 'react';

// The backend returns the full chat response in one go (no token-by-token
// SSE endpoint), so "streaming" here is a lightweight typewriter effect
// purely for a nicer reading experience - not a real network stream.
// Call `start(fullText)` once the full response has arrived.
export function useStreaming(charsPerTick = 3, tickMs = 16) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const intervalRef = useRef(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const start = useCallback((fullText) => {
    stop();
    setDisplayedText('');
    if (!fullText) return;

    setIsStreaming(true);
    let index = 0;
    intervalRef.current = setInterval(() => {
      index += charsPerTick;
      setDisplayedText(fullText.slice(0, index));
      if (index >= fullText.length) {
        stop();
      }
    }, tickMs);
  }, [charsPerTick, tickMs, stop]);

  useEffect(() => () => stop(), [stop]);

  return { displayedText, isStreaming, start, stop };
}

export default useStreaming;
