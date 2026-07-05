import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect } from '@react-navigation/native';
import UploadProgress from '../../components/admin/UploadProgress';
import DocumentList from '../../components/admin/DocumentList';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { uploadDocument, getAllDocuments } from '../../services/document';


const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export default function UploadScreen() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(null); // { fileName, progress }

  const loadDocuments = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllDocuments();
      setDocuments(data);
    } catch (err) {
      setError('Could not load documents. Pull down to retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [loadDocuments])
  );

  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ALLOWED_TYPES,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    const file = result.assets[0];

    if (file.size && file.size > 10 * 1024 * 1024) {
      Alert.alert('File too large', 'Please choose a file under 10MB.');
      return;
    }

    try {
      setUploading({ fileName: file.name, progress: 0 });
      await uploadDocument(file.uri, file.name, file.mimeType, (percent) => {
        setUploading((prev) => (prev ? { ...prev, progress: percent } : prev));
      });
      setUploading(null);
      await loadDocuments();
    } catch (err) {
      setUploading(null);
      Alert.alert('Upload failed', err?.response?.data?.detail || 'Please try again.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadDocuments} />}
    >
      <Text style={styles.title}>Upload Document</Text>
      <Text style={styles.subtitle}>PDF, DOCX, or TXT — max 10MB</Text>

      <TouchableOpacity style={styles.pickButton} onPress={handlePickFile} disabled={!!uploading}>
        <Text style={styles.pickButtonText}>
          {uploading ? 'Uploading…' : '+ Choose File'}
        </Text>
      </TouchableOpacity>

      {uploading && (
        <UploadProgress fileName={uploading.fileName} progress={uploading.progress} />
      )}

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>All Documents</Text>
      {error ? <ErrorMessage message={error} onRetry={loadDocuments} /> : null}
      <DocumentList documents={documents} />
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
    marginBottom: 20,
  },
  pickButton: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  pickButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
});
