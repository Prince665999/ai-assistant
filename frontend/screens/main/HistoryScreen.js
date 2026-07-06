import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ToolBadge from '../../components/chat/ToolBadge';
import * as chatService from '../../services/chat';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, SHADOW } from '../../constants/theme';
import { formatDate, truncate } from '../../utils/formatters';
import { TOOL_LABELS } from '../../utils/constants';

const FILTERS = [{ key: 'all', label: 'All' }, ...Object.entries(TOOL_LABELS).map(([key, label]) => ({ key, label }))];

export default function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(20);

  const load = useCallback(async (currentLimit) => {
    setStatus('loading');
    try {
      const data = await chatService.getHistory(currentLimit);
      setHistory(data || []);
      setStatus('ready');
    } catch (error) {
      console.log('[HistoryScreen] load failed:', error?.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load(limit);
  }, [limit, load]);

  const filtered = filter === 'all' ? history : history.filter((item) => item.tool_used === filter);

  if (status === 'loading' && history.length === 0) {
    return (
      <View style={styles.flex}>
        <Header title="History" subtitle="Your past conversations" />
        <LoadingSpinner label="Loading history…" />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.flex}>
        <Header title="History" subtitle="Your past conversations" />
        <ErrorMessage message="Couldn't load your chat history." onRetry={() => load(limit)} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Header title="History" subtitle="Your past conversations" />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(item) => item.key}
        style={styles.filterRow}
        contentContainerStyle={{ gap: SPACING.sm, paddingHorizontal: SPACING.md }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterPill, filter === item.key && styles.filterPillActive]}
            onPress={() => setFilter(item.key)}
          >
            <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.role}>{item.role === 'user' ? 'You' : 'Assistant'}</Text>
              <Text style={styles.date}>{formatDate(item.created_at)}</Text>
            </View>
            <Text style={styles.content}>{truncate(item.content, 160)}</Text>
            <ToolBadge tool={item.tool_used} />
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No conversations found.</Text>}
        ListFooterComponent={
          history.length >= limit ? (
            <TouchableOpacity style={styles.loadMore} onPress={() => setLimit((l) => l + 20)}>
              <Text style={styles.loadMoreText}>Load more</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  filterRow: { flexGrow: 0, marginBottom: SPACING.sm },
  filterPill: {
    paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  filterPillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: '600' },
  filterTextActive: { color: COLORS.onPrimary },
  list: { padding: SPACING.md },
  card: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOW,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  role: { fontWeight: '700', color: COLORS.text, fontSize: FONT_SIZE.sm },
  date: { color: COLORS.textMuted, fontSize: FONT_SIZE.xs },
  content: { color: COLORS.text, fontSize: FONT_SIZE.sm, lineHeight: 20 },
  empty: { textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.lg },
  loadMore: { alignItems: 'center', padding: SPACING.md },
  loadMoreText: { color: COLORS.primary, fontWeight: '700' },
});
