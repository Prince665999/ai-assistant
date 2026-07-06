import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, SHADOW } from '../../constants/theme';
import { formatPercent } from '../../utils/formatters';

export default function KpiCard({ label, value, change, trend }) {
  const isUp = trend === 'up';
  const trendColor = isUp ? COLORS.success : COLORS.danger;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {change != null && (
        <Text style={[styles.change, { color: trendColor }]}>
          {isUp ? '▲' : '▼'} {formatPercent(change)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOW,
  },
  label: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  value: { fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text, marginTop: SPACING.xs },
  change: { fontSize: FONT_SIZE.sm, fontWeight: '600', marginTop: SPACING.xs },
});
