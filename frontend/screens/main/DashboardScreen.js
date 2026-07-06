import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import KpiCard from '../../components/charts/KpiCard';
import LineTrendChart from '../../components/charts/LineTrendChart';
import BarComparison from '../../components/charts/BarComparison';
import DonutBreakdown from '../../components/charts/DonutBreakdown';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as analyticsService from '../../services/analytics';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/theme';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export default function DashboardScreen() {
  const [days, setDays] = useState(30);
  const [status, setStatus] = useState('loading');
  const [kpis, setKpis] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [users, setUsers] = useState(null);
  const [regions, setRegions] = useState(null);
  const [tools, setTools] = useState(null);

  const load = useCallback(async (currentDays) => {
    setStatus('loading');
    try {
      const [kpisRes, revenueRes, usersRes, regionsRes, toolsRes] = await Promise.all([
        analyticsService.mockKpis(),
        analyticsService.mockRevenue(currentDays),
        analyticsService.mockUsers(currentDays),
        analyticsService.mockRegions(),
        analyticsService.mockTools(),
      ]);
      setKpis(kpisRes.kpis || []);
      setRevenue(revenueRes);
      setUsers(usersRes);
      setRegions(regionsRes);
      setTools(toolsRes);
      setStatus('ready');
    } catch (error) {
      console.log('[DashboardScreen] load failed:', error?.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load(days);
  }, [days, load]);

  if (status === 'loading') {
    return (
      <View style={styles.flex}>
        <Header title="Dashboard" subtitle="Business analytics" />
        <LoadingSpinner label="Loading dashboard…" />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.flex}>
        <Header title="Dashboard" subtitle="Business analytics" />
        <ErrorMessage message="Couldn't load analytics data." onRetry={() => load(days)} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header
        title="Dashboard"
        subtitle="Business analytics"
        right={<DateRangeFilter selectedDays={days} onChange={setDays} />}
      />

      <View style={styles.kpiRow}>
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={typeof kpi.value === 'number' && kpi.label.toLowerCase().includes('revenue')
              ? formatCurrency(kpi.value)
              : formatNumber(kpi.value)}
            change={kpi.change}
            trend={kpi.trend}
          />
        ))}
      </View>

      <LineTrendChart title="Revenue Trend" labels={revenue?.labels} data={revenue?.series?.[0]?.data || []} />
      <LineTrendChart title="Active Users Trend" labels={users?.labels} data={users?.series?.[0]?.data || []} />
      <BarComparison title="Revenue by Region" labels={regions?.labels} data={regions?.series?.[0]?.data || []} />
      <DonutBreakdown title="Tool Usage Breakdown" labels={tools?.labels} data={tools?.data || []} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingTop: 0 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
});
