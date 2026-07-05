import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../services/api';
import KpiCard from '../../components/charts/KpiCard';
import LineTrendChart from '../../components/charts/LineTrendChart';
import BarComparison from '../../components/charts/BarComparison';
import DonutBreakdown from '../../components/charts/DonutBreakdown';
import DateRangeFilter from '../../components/common/DateRangeFilter';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';


// Real-data equivalent of the mock Business Analytics dashboard (Step 18),
// same components, same layout - just wired to /analytics/admin/* instead of /analytics/mock/*.
export default function AdminDashboardScreen() {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const [userStats, setUserStats] = useState(null);
  const [chatStats, setChatStats] = useState(null);
  const [documentStats, setDocumentStats] = useState(null);
  const [toolStats, setToolStats] = useState(null);

  const loadData = useCallback(async (rangeDays) => {
    try {
      setError(null);
      const [usersRes, chatRes, docsRes, toolsRes] = await Promise.all([
        api.get('/analytics/admin/users'),
        api.get(`/analytics/admin/chat?days=${rangeDays}`),
        api.get('/analytics/admin/documents'),
        api.get('/analytics/admin/tools'),
      ]);
      setUserStats(usersRes.data);
      setChatStats(chatRes.data);
      setDocumentStats(docsRes.data);
      setToolStats(toolsRes.data);
    } catch (err) {
      setError('Could not load admin analytics. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData(days);
    }, [days, loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(days);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Transform backend shapes into the {labels, data/series} shape the chart components expect
  const messagesLabels = chatStats?.messages_per_day?.map((d) => d.date) || [];
  const messagesData = chatStats?.messages_per_day?.map((d) => d.count) || [];

  const toolLabels = chatStats?.tools_usage?.map((t) => t.tool) || [];
  const toolCounts = chatStats?.tools_usage?.map((t) => t.count) || [];

  const docStatusEntries = Object.entries(documentStats?.documents_by_status || {});
  const docStatusLabels = docStatusEntries.map(([status]) => status);
  const docStatusData = docStatusEntries.map(([, count]) => count);

  const toolPerfLabels = toolStats?.tools?.map((t) => t.tool) || [];
  const toolPerfLatency = toolStats?.tools?.map((t) => Math.round(t.avg_latency_ms || 0)) || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Text style={styles.title}>Admin Analytics</Text>
      <Text style={styles.subtitle}>Real usage data from the app database</Text>

      {error ? <ErrorMessage message={error} onRetry={() => loadData(days)} /> : null}

      <View style={styles.kpiRow}>
        <KpiCard label="Total Users" value={userStats?.total_users ?? 0} />
        <KpiCard label="Active Users" value={userStats?.active_users ?? 0} />
        <KpiCard label="New Today" value={userStats?.new_users_today ?? 0} />
      </View>
      <View style={styles.kpiRow}>
        <KpiCard label="Total Messages" value={chatStats?.total_messages ?? 0} />
        <KpiCard label="Conversations" value={chatStats?.total_conversations ?? 0} />
        <KpiCard label="Documents" value={documentStats?.total_documents ?? 0} />
      </View>

      <DateRangeFilter
        selected={days}
        options={[7, 30, 90]}
        onChange={(value) => setDays(value)}
      />

      <View style={styles.chartBlock}>
        <Text style={styles.sectionTitle}>Messages Per Day</Text>
        <LineTrendChart labels={messagesLabels} data={messagesData} title="Chat Volume" />
      </View>

      <View style={styles.chartBlock}>
        <Text style={styles.sectionTitle}>Tool Usage Split</Text>
        <DonutBreakdown labels={toolLabels} data={toolCounts} />
      </View>

      <View style={styles.chartBlock}>
        <Text style={styles.sectionTitle}>Document Processing Status</Text>
        <DonutBreakdown labels={docStatusLabels} data={docStatusData} />
      </View>

      <View style={styles.chartBlock}>
        <Text style={styles.sectionTitle}>Avg Tool Latency (ms)</Text>
        <BarComparison labels={toolPerfLabels} series={[{ name: 'Avg Latency (ms)', data: toolPerfLatency }]} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    marginBottom: 16,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartBlock: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
});
