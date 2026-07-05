// components/charts/DonutBreakdown.js
// Wraps react-native-chart-kit's PieChart for "proportion of a whole" data
// (tool usage split, etc). chart-kit doesn't have a true donut, so this
// renders a standard pie with a legend — same idea, learning-project simple.

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// A small fixed palette so colors stay consistent between chart and legend.
const PALETTE = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

export default function DonutBreakdown({ title, labels = [], data = [] }) {
  const hasData = labels.length > 0 && data.length > 0;

  const chartData = labels.map((label, i) => ({
    name: label,
    population: data[i] ?? 0,
    color: PALETTE[i % PALETTE.length],
    legendFontColor: '#5a5a6e',
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {hasData ? (
        <PieChart
          data={chartData}
          width={screenWidth - 48}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="8"
          hasLegend
        />
      ) : (
        <Text style={styles.empty}>No usage data yet</Text>
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
  empty: {
    textAlign: 'center',
    color: '#a0a0b2',
    paddingVertical: 40,
  },
});
