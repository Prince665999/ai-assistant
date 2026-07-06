import React from 'react';
import { View, Text, Dimensions, StyleSheet, Platform } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { chartConfig } from './chartConfig';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, SHADOW } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width;

export default function BarComparison({ title, labels, data }) {
  const hasData = Array.isArray(data) && data.length > 0;
  const chartWidth = Math.min(screenWidth - SPACING.md * 2, 700);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {hasData ? (
        <BarChart
          data={{ labels, datasets: [{ data }] }}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=""
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
