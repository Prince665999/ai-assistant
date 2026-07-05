// components/charts/BarComparison.js
// Wraps react-native-chart-kit's BarChart for category comparisons
// (region sales, product line, etc). Takes the first series in the
// response by default; pass seriesIndex to plot a different one
// (e.g. units_sold instead of revenue).

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function BarComparison({
  title,
  labels = [],
  series = [],
  seriesIndex = 0,
  height = 220,
}) {
  const dataset = series[seriesIndex]?.data ?? [];
  const seriesName = series[seriesIndex]?.name;
  const hasData = labels.length > 0 && dataset.length > 0;

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {hasData ? (
        <BarChart
          data={{
            labels,
            datasets: [{ data: dataset }],
          }}
          width={screenWidth - 48}
          height={height}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(118, 75, 162, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(90, 90, 110, ${opacity})`,
            propsForBackgroundLines: { stroke: '#eef0f6' },
            barPercentage: 0.6,
          }}
          style={styles.chart}
        />
      ) : (
        <Text style={styles.empty}>No data to compare</Text>
      )}
      {seriesName ? <Text style={styles.caption}>{seriesName}</Text> : null}
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
  caption: {
    textAlign: 'center',
    fontSize: 12,
    color: '#a0a0b2',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#a0a0b2',
    paddingVertical: 40,
  },
});
