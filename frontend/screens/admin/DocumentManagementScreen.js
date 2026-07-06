import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Header from '../../components/common/Header';
import DocumentList from '../../components/admin/DocumentList';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as documentService from '../../services/document';
import { COLORS } from '../../constants/colors';

export default function DocumentManagementScreen() {
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await documentService.listAllDocuments();
      setDocuments(data || []);
      setStatus('ready');
    } catch (error) {
      console.log('[DocumentManagementScreen] load failed:', error?.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    try {
      await documentService.deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    } catch (error) {
      console.log('[DocumentManagementScreen] delete failed:', error?.message);
    }
  };

  if (status === 'loading') {
    return (
      <View style={styles.flex}>
        <Header title="Manage Documents" subtitle="View and delete uploaded files" />
        <LoadingSpinner label="Loading documents…" />
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.flex}>
        <Header title="Manage Documents" subtitle="View and delete uploaded files" />
        <ErrorMessage message="Couldn't load documents." onRetry={load} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <Header title="Manage Documents" subtitle="View and delete uploaded files" />
      <View style={styles.content}>
        <DocumentList documents={documents} onDelete={handleDelete} canDelete />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingTop: 0, flex: 1 },
});
