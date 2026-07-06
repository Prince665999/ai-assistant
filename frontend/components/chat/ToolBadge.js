import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';
import { TOOL_LABELS } from '../../utils/constants';

export default function ToolBadge({ tool }) {
  if (!tool || tool === 'no_tool') return null;
  const label = TOOL_LABELS[tool] || tool;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>🔧 {label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginTop: SPACING.xs,
  },
  text: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: '600' },
});
