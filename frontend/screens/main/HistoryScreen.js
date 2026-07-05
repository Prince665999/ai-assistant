import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Header from '../../components/common/Header';
import ToolBadge from '../../components/chat/ToolBadge';
import { getHistory } from '../../services/chat';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'calculator', label: 'Calculator' },
  { key: 'weather', label: 'Weather' },
  { key: 'news', label: 'News' },
  { key: 'search_documents', label: 'Documents' },
  { key: 'no_tool', label: 'No tool' },
];

const PAGE_SIZE = 20;

function groupIntoConversations(rows) {
  // rows come back newest-first from the API; make them chronological first
  const chronological = [...rows].reverse();
  const pairs = [];
  let pending = null;

  chronological.forEach((row) => {
    if (row.role === 'user') {
      pending = { id: row.id, question: row, answer: null };
      pairs.push(pending);
    } else if (row.role === 'assistant' && pending && !pending.answer) {
      pending.answer = row;
    } else {
      // Assistant message with no preceding pending user turn — show it standalone
      pairs.push({ id: row.id, question: null, answer: row });
    }
  });

  return pairs.reverse(); // newest conversation first for display
}

export default function HistoryScreen() {
  const [rawHistory, setRawHistory] = useState([]);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (nextLimit, { silent } = {}) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const data = await getHistory(nextLimit);
      setRawHistory(data);
    } catch (err) {
      setError('Could not load your chat history. Pull down to try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(limit);
  }, [limit]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchHistory(limit, { silent: true });
  };

  const handleLoadMore = () => {
    setLimit((prev) => prev + PAGE_SIZE);
  };

  const conversations = useMemo(() => groupIntoConversations(rawHistory), [rawHistory]);

  const filteredConversations = useMemo(() => {
    if (filter === 'all') return conversations;
    return conversations.filter((pair) => pair.answer?.tool_used === filter);
  }, [conversations, filter]);

  const renderItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const questionText = item.question?.content ?? '';
    const answerText = item.answer?.content ?? '';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
      >
        {item.question && (
          <Text style={styles.question} numberOfLines={isExpanded ? undefined : 1}>
            {questionText}
          </Text>
        )}
        {item.answer && (
          <Text style={styles.answer} numberOfLines={isExpanded ? undefined : 2}>
            {answerText}
          </Text>
        )}
        <View style={styles.metaRow}>
          <ToolBadge tool={item.answer?.tool_used} />
          {item.answer?.created_at && (
            <Text style={styles.timestamp}>
              {new Date(item.answer.created_at).toLocaleString()}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="History" subtitle="Your past conversations" />

      <View style={styles.filterRow}>
        <FlatList
          data={FILTERS}
          horizontal
          keyExtractor={(f) => f.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === item.key && styles.filterChipActive]}
              onPress={() => setFilter(item.key)}
            >
              <Text style={[styles.filterText, filter === item.key && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#667eea" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No conversations match this filter yet.</Text>
            </View>
          }
          ListFooterComponent={
            rawHistory.length >= limit ? (
              <TouchableOpacity style={styles.loadMore} onPress={handleLoadMore}>
                <Text style={styles.loadMoreText}>Load more</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  filterRow: { paddingVertical: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e4ec',
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#667eea', borderColor: '#667eea' },
  filterText: { color: '#1f2333', fontSize: 14 },
  filterTextActive: { color: '#fff', fontWeight: '600' },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e4ec',
    padding: 16,
    marginBottom: 8,
  },
  question: { fontSize: 16, fontWeight: '600', color: '#1f2333' },
  answer: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: { fontSize: 11, color: '#6b7280' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyText: { color: '#6b7280', fontSize: 16, textAlign: 'center' },
  loadMore: { alignItems: 'center', paddingVertical: 16 },
  loadMoreText: { color: '#667eea', fontWeight: '600' },
});