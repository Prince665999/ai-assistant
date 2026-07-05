import api from './api';

// Upload a document (PDF, DOCX, or TXT). onProgress receives 0-100.
export const uploadDocument = async (fileUri, fileName, mimeType, onProgress) => {
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: fileName,
    type: mimeType,
  });

  const response = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      }
    },
  });

  return response.data;
};

// Admin only - list every uploaded document
export const getAllDocuments = async () => {
  const response = await api.get('/documents/');
  return response.data;
};

// List documents uploaded by the current user
export const getMyDocuments = async () => {
  const response = await api.get('/documents/my');
  return response.data;
};

export const getDocumentById = async (documentId) => {
  const response = await api.get(`/documents/${documentId}`);
  return response.data;
};

// Admin only - delete a document
export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
};
