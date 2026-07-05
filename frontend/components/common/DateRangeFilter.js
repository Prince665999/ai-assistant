// components/common/DateRangeFilter.js
// Simple segmented control for 7d / 30d / 90d. Purely presentational —
// the screen using it owns the selected value and re-fetches on change.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OPTIONS = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '90D', value: 90 },
];

const PRIMARY = '#667eea';

export default function DateRangeFilter({ value, onChange }) {
  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: '#f0f1f7',
    borderRadius: 10,
    padding: 4,
    alignSelf: 'flex-start',
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  pillActive: {
    backgroundColor: PRIMARY,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7a7a90',
  },
  pillTextActive: {
    color: '#ffffff',
  },
});
