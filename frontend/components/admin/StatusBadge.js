import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE } from '../../constants/theme';

const STATUS_STYLES = {
  done: { bg: '#dcfce7', fg: COLORS.success, label: 'Done' },
  processing: { bg: '#fef3c7', fg: COLORS.warning, label: 'Processing' },
  failed: { bg: '#fee2e2', fg: COLORS.danger, label: 'Failed' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_STYLES[status] || { bg: COLORS.background, fg: COLORS.textSecondary, label: status };

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.fg }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  text: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
});
