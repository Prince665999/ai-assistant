import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import KpiCard from '../../components/charts/KpiCard';
import BarComparison from '../../components/charts/BarComparison';
import DonutBreakdown from '../../components/charts/DonutBreakdown';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as analyticsService from '../../services/analytics';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/theme';
import { formatNumber } from '../../utils/formatters';

export default function AdminDashboardScreen() {
  const [status, setStatus] = useState('loading');
  const [users, setUsers] = useState(null);
  const [chat, setChat] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [tools, setTools] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [usersRes, chatRes, documentsRes, toolsRes] = await Promise.all([
        analyticsService.adminUsers(),
        analyticsService.adminChat(30),
        analyticsService.adminDocuments(),
        analyticsService.adminTools(),
      ]);
      setUsers(usersRes);
      setChat(chatRes);
      setDocuments(documentsRes);
      setTools(toolsRes);
      setStatus('ready');
    } catch (error) {
      console.log('[AdminDashboardScreen] load failed:', error?.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (status === 'loading') {
    return (
      <View style={styles.flex}>
        <Header title="Admin Dashboard" subtitle="Live usage analytics" />
        <LoadingSpinner label="Loading admin data…" />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.flex}>
        <Header title="Admin Dashboard" subtitle="Live usage analytics" />
        <ErrorMessage message="Couldn't load admin analytics." onRetry={load} />
      </View>
    );
  }

  const toolLabels = (tools?.tools || []).map((t) => t.tool);
  const toolCalls = (tools?.tools || []).map((t) => t.total_calls);
  const messagesLabels = (chat?.messages_per_day || []).map((d) => d.date?.slice(5) || '');
  const messagesData = (chat?.messages_per_day || []).map((d) => d.count);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header title="Admin Dashboard" subtitle="Live usage analytics" />

      <View style={styles.kpiRow}>
        <KpiCard label="Total Users" value={formatNumber(users?.total_users)} />
        <KpiCard label="Active Users" value={formatNumber(users?.active_users)} />
        <KpiCard label="New Today" value={formatNumber(users?.new_users_today)} />
        <KpiCard label="Total Messages" value={formatNumber(chat?.total_messages)} />
        <KpiCard label="Conversations" value={formatNumber(chat?.total_conversations)} />
        <KpiCard label="Documents" value={formatNumber(documents?.total_documents)} />
        <KpiCard label="Chunks Indexed" value={formatNumber(documents?.total_chunks)} />
      </View>

      <BarComparison title="Messages per Day (last 30 days)" labels={messagesLabels} data={messagesData} />
      <DonutBreakdown title="Tool Usage" labels={toolLabels} data={toolCalls} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingTop: 0 },
  kpiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
});
