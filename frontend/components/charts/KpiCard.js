// components/charts/KpiCard.js
// Small "number + trend" card, the pattern every BI dashboard leads with.
// Props: label (string), value (number|string), change (number, e.g. 5.2), trend ('up' | 'down')

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PRIMARY = '#667eea';
const GREEN = '#2ecc71';
const RED = '#e74c3c';

function formatValue(value) {
  if (typeof value !== 'number') return value;
  if (Math.abs(value) >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export default function KpiCard({ label, value, change, trend }) {
  const isUp = trend === 'up';
  const trendColor = isUp ? GREEN : RED;
  const arrow = isUp ? '▲' : '▼';
  const changeText =
    change === undefined || change === null ? null : `${Math.abs(change).toFixed(1)}%`;

  return (
    <View style={styles.card}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.value}>{formatValue(value)}</Text>
      {changeText && (
        <View style={styles.trendRow}>
          <Text style={[styles.arrow, { color: trendColor }]}>{arrow}</Text>
          <Text style={[styles.change, { color: trendColor }]}>{changeText}</Text>
          <Text style={styles.period}> vs prev.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    margin: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontSize: 13,
    color: '#8a8a9e',
    marginBottom: 6,
    fontWeight: '500',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e1e2d',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  arrow: {
    fontSize: 12,
    marginRight: 4,
  },
  change: {
    fontSize: 13,
    fontWeight: '600',
  },
  period: {
    fontSize: 12,
    color: '#a0a0b2',
  },
});
