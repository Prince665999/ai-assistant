// screens/main/DashboardScreen.js
// Business Analytics Dashboard (mock data) — Step 18.
// KPI cards, revenue trend, active-users trend, region comparison,
// and a tool-usage donut, all re-fetched when the date range changes.
// Data here is deliberately fake (analytics_mock.db): the point of this
// screen is practicing layout and chart reading, not data plumbing.

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import KpiCard from '../../components/charts/KpiCard';
import LineTrendChart from '../../components/charts/LineTrendChart';
import BarComparison from '../../components/charts/BarComparison';
import DonutBreakdown from '../../components/charts/DonutBreakdown';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import {
  getMockKpis,
  getMockRevenue,
  getMockUsers,
  getMockRegions,
  getMockTools,
} from '../../services/analytics';

export default function DashboardScreen() {
  const [range, setRange] = useState(30); // 7 | 30 | 90
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [kpis, setKpis] = useState([]);
  const [revenue, setRevenue] = useState({ labels: [], series: [] });
  const [users, setUsers] = useState({ labels: [], series: [] });
  const [regions, setRegions] = useState({ labels: [], series: [] });
  const [tools, setTools] = useState({ labels: [], data: [] });

  const loadAll = useCallback(async (days) => {
    setError(null);
    try {
      const [kpiRes, revRes, usersRes, regionRes, toolsRes] = await Promise.all([
        getMockKpis(),
        getMockRevenue(days),
        getMockUsers(days),
        getMockRegions(),
        getMockTools(),
      ]);
      setKpis(kpiRes.kpis || []);
      setRevenue(revRes);
      setUsers(usersRes);
      setRegions(regionRes);
      setTools(toolsRes);
    } catch (err) {
      setError('Could not load dashboard data. Pull down to retry.');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadAll(range).finally(() => setLoading(false));
  }, [range, loadAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll(range);
    setRefreshing(false);
  }, [range, loadAll]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Business Analytics</Text>
        <DateRangeFilter value={range} onChange={setRange} />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            trend={kpi.trend}
          />
        ))}
      </View>

      <LineTrendChart
        title={`Revenue trend (${range}d)`}
        labels={revenue.labels}
        series={revenue.series}
      />

      <LineTrendChart
        title={`Active users (${range}d)`}
        labels={users.labels}
        series={users.series}
      />

      <BarComparison
        title="Revenue by region"
        labels={regions.labels}
        series={regions.series}
        seriesIndex={0}
      />

      <DonutBreakdown title="Tool usage breakdown" labels={tools.labels} data={tools.data} />

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f6f7fb',
  },
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f7fb',
  },
  headerRow: {
    marginBottom: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e1e2d',
    marginBottom: 10,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 4,
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 10,
  },
});
