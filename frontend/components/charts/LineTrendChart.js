// components/charts/LineTrendChart.js
// Wraps react-native-chart-kit's LineChart for trend-over-time data
// (revenue, active users, etc). Screens just pass { labels, series } as-is
// from the API response — no data munging needed here.

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const PRIMARY = '#667eea';
const screenWidth = Dimensions.get('window').width;

export default function LineTrendChart({ title, labels = [], series = [], height = 220 }) {
  const dataset = series[0]?.data ?? [];
  const hasData = labels.length > 0 && dataset.length > 0;

  // Chart-kit gets noisy with too many x-axis labels, so thin them out.
  const maxLabels = 6;
  const step = Math.max(1, Math.ceil(labels.length / maxLabels));
  const thinnedLabels = labels.map((l, i) => (i % step === 0 ? l : ''));

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {hasData ? (
        <LineChart
          data={{
            labels: thinnedLabels,
            datasets: [{ data: dataset }],
          }}
          width={screenWidth - 48}
          height={height}
          bezier
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(90, 90, 110, ${opacity})`,
            propsForDots: { r: '3', strokeWidth: '2', stroke: PRIMARY },
            propsForBackgroundLines: { stroke: '#eef0f6' },
          }}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.empty}>No data for this range</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginVertical: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e1e2d',
    marginBottom: 8,
    marginLeft: 4,
  },
  chart: {
    borderRadius: 12,
  },
  empty: {
    textAlign: 'center',
    color: '#a0a0b2',
    paddingVertical: 40,
  },
});
