import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TOOL_LABELS = {
  calculator: '🧮 Calculator',
  weather: '🌤️ Weather',
  news: '📰 News',
  search: '🔎 Search',
  search_documents: '📄 Documents',
  no_tool: null,
};

export default function ToolBadge({ tool }) {
  if (!tool || tool === 'no_tool') return null;
  const label = TOOL_LABELS[tool] ?? `🔧 ${tool}`;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#764ba222',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    marginTop: 4,
  },
  text: {
    fontSize: 12,
    color: '#764ba2',
    fontWeight: '600',
  },
});