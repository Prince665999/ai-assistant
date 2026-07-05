import React, { useEffect, useState, useRef } from 'react';
import { Text } from 'react-native';

export default function StreamingText({ text, speedMs = 15, onDone, style }) {
  const [shown, setShown] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    setShown('');
    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current += 1;
      setShown(text.slice(0, indexRef.current));

      if (indexRef.current >= text.length) {
        clearInterval(interval);
        onDone && onDone();
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text]);

  return <Text style={style}>{shown}</Text>;
}