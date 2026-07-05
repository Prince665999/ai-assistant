import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DocumentList from '../../components/admin/DocumentList';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { getAllDocuments, deleteDocument } from '../../services/document';


export default function DocumentManagementScreen() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllDocuments();
      setDocuments(data);
    } catch (err) {
      setError('Could not load documents. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [loadDocuments])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadDocuments();
  };

  const handleDelete = (documentId) => {
    const doc = documents.find((d) => d.id === documentId);
    Alert.alert(
      'Delete document',
      `Delete "${doc?.filename || 'this document'}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(documentId);
              setDocuments((prev) => prev.filter((d) => d.id !== documentId));
            } catch (err) {
              Alert.alert('Delete failed', 'Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const doneCount = documents.filter((d) => d.status === 'done').length;
  const processingCount = documents.filter((d) => d.status === 'processing').length;
  const failedCount = documents.filter((d) => d.status === 'failed').length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <Text style={styles.title}>Document Management</Text>

      <View style={styles.summaryRow}>
        <SummaryPill label="Done" value={doneCount} color="#1E8E3E" />
        <SummaryPill label="Processing" value={processingCount} color="#C77700" />
        <SummaryPill label="Failed" value={failedCount} color="#D93025" />
      </View>

      {error ? <ErrorMessage message={error} onRetry={loadDocuments} /> : null}

      <DocumentList
        documents={documents}
        onDelete={handleDelete}
        emptyText="No documents have been uploaded yet."
      />
    </ScrollView>
  );
}

function SummaryPill({ label, value, color }) {
  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.pillValue, { color }]}>{value}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pill: {
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  pillValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  pillLabel: {
    fontSize: 12,
    color:'#888',
    marginTop: 2,
  },
});
