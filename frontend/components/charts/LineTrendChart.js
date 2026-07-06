import React from 'react';
import { View, Text, Dimensions, StyleSheet, Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { chartConfig } from './chartConfig';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, SHADOW } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width;

export default function LineTrendChart({ title, labels, data }) {
  const hasData = Array.isArray(data) && data.length > 0;
  const chartWidth = Math.min(screenWidth - SPACING.md * 2, 700);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {hasData ? (
        <LineChart
          data={{ labels: labels?.length ? labels : data.map((_, i) => `${i + 1}`), datasets: [{ data }] }}
          width={chartWidth}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          fromZero
        />
      ) : (
        <Text style={styles.empty}>No data available yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOW,
    ...(Platform.OS === 'web' ? { overflow: 'hidden' } : null),
  },
  title: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  chart: { borderRadius: RADIUS.sm },
  empty: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, paddingVertical: SPACING.lg, textAlign: 'center' },
});
