import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useStreaming } from '../../hooks/useStreaming';
import { COLORS } from '../../constants/colors';
import { FONT_SIZE } from '../../constants/theme';

// Plays a typewriter animation over `text` once, then stays fully shown.
export default function StreamingText({ text, style }) {
  const { displayedText, start } = useStreaming();

  useEffect(() => {
    start(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <Text style={[styles.text, style]}>{displayedText}</Text>;
}

const styles = StyleSheet.create({
  text: { fontSize: FONT_SIZE.md, color: COLORS.text, lineHeight: 22 },
});
