import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { chartConfig } from './chartConfig';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, SHADOW } from '../../constants/theme';

const screenWidth = Dimensions.get('window').width;

const PALETTE = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.info, COLORS.danger];

export default function DonutBreakdown({ title, labels, data }) {
  const hasData = Array.isArray(data) && data.length > 0;
  const chartWidth = Math.min(screenWidth - SPACING.md * 2, 700);

  const pieData = (labels || []).map((label, index) => ({
    name: label,
    population: data[index] ?? 0,
    color: PALETTE[index % PALETTE.length],
    legendFontColor: COLORS.textSecondary,
    legendFontSize: 12,
  }));

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {hasData ? (
        <PieChart
          data={pieData}
          width={chartWidth}
          height={200}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="8"
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
  },
  title: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  empty: { color: COLORS.textMuted, fontSize: FONT_SIZE.sm, paddingVertical: SPACING.lg, textAlign: 'center' },
});
