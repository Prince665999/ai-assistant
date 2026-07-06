import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import Header from '../../components/common/Header';
import UploadProgress from '../../components/admin/UploadProgress';
import DocumentList from '../../components/admin/DocumentList';
import ErrorMessage from '../../components/common/ErrorMessage';
import * as documentService from '../../services/document';
import { COLORS } from '../../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, SHADOW } from '../../constants/theme';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export default function UploadScreen() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
    try {
      const data = await documentService.listAllDocuments();
      setDocuments(data || []);
    } catch (err) {
      console.log('[UploadScreen] failed to load documents:', err?.message);
    }
  }, []);

  useEffect(() => { loadDocuments(); }, [loadDocuments]);

  const handlePickAndUpload = async () => {
    setError(null);
    const result = await DocumentPicker.getDocumentAsync({
      type: ALLOWED_TYPES,
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;
    const file = result.assets?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setCurrentFileName(file.name);

    try {
      await documentService.uploadDocument(file, setProgress);
      await loadDocuments();
    } catch (err) {
      setError(err?.response?.data?.detail || 'Upload failed. Please try a smaller file or a supported type (PDF, DOCX, TXT).');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      <Header title="Upload Documents" subtitle="PDF, DOCX, or TXT — max 10MB" />

      <TouchableOpacity style={styles.uploadButton} onPress={handlePickAndUpload} disabled={uploading}>
        <Text style={styles.uploadButtonText}>{uploading ? 'Uploading…' : '＋  Choose a file to upload'}</Text>
      </TouchableOpacity>

      {uploading && <UploadProgress fileName={currentFileName} progress={progress} />}
      {!!error && <ErrorMessage message={error} />}

      <Text style={styles.sectionTitle}>All Documents</Text>
      <DocumentList documents={documents} canDelete={false} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.md, paddingTop: 0 },
  uploadButton: {
    backgroundColor: COLORS.surface, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.primary,
    borderRadius: RADIUS.md, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.md, ...SHADOW,
  },
  uploadButtonText: { color: COLORS.primary, fontWeight: '700', fontSize: FONT_SIZE.md },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text, marginVertical: SPACING.md },
});
