// components/charts/Sparkline.js
// A tiny, axis-less trend line — good for a table row or a compact card
// where a full LineTrendChart would be too heavy. Built with LineChart's
// "no decorations" mode rather than a separate library, to keep the
// dependency list short.

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function Sparkline({ data = [], width = 100, height = 40, color = '#667eea' }) {
  if (!data.length) return <View style={{ width, height }} />;

  return (
    <View style={styles.wrapper}>
      <LineChart
        data={{ labels: data.map(() => ''), datasets: [{ data }] }}
        width={width}
        height={height}
        withDots={false}
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLabels={false}
        withHorizontalLabels={false}
        withShadow={false}
        bezier
        chartConfig={{
          backgroundGradientFrom: 'transparent',
          backgroundGradientTo: 'transparent',
          backgroundGradientFromOpacity: 0,
          backgroundGradientToOpacity: 0,
          color: (opacity = 1) => color,
          strokeWidth: 2,
        }}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
  },
  chart: {
    paddingRight: 0,
    paddingLeft: 0,
    marginLeft: -16,
  },
});
