import React from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { chartConfig } from './chartConfig';

// A tiny, axis-free line chart for compact spaces (e.g. inside a KPI card).
export default function Sparkline({ data, width = 100, height = 40 }) {
  if (!data || data.length < 2) return <View style={{ width, height }} />;

  return (
    <LineChart
      data={{ labels: data.map(() => ''), datasets: [{ data }] }}
      width={width}
      height={height}
      withDots={false}
      withInnerLines={false}
      withOuterLines={false}
      withVerticalLabels={false}
      withHorizontalLabels={false}
      chartConfig={chartConfig}
      bezier
      style={{ paddingRight: 0 }}
    />
  );
}
