import api from './api';

// `file` is expected to be the object returned by expo-document-picker /
// a web <input type="file"> change event, already normalized by the
// calling screen into { uri, name, type } (native) or a native `File` (web).
export async function uploadDocument(file, onProgress) {
  const formData = new FormData();

  if (typeof File !== 'undefined' && file instanceof File) {
    // Web: plain browser File object
    formData.append('file', file);
  } else {
    // Native: expo-document-picker shape
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'upload',
      type: file.mimeType || file.type || 'application/octet-stream',
    });
  }

  const { data } = await api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
}

export async function listAllDocuments() {
  const { data } = await api.get('/documents/');
  return data;
}

export async function listMyDocuments() {
  const { data } = await api.get('/documents/my');
  return data;
}

export async function getDocument(id) {
  const { data } = await api.get(`/documents/${id}`);
  return data;
}

export async function deleteDocument(id) {
  const { data } = await api.delete(`/documents/${id}`);
  return data;
}

export default { uploadDocument, listAllDocuments, listMyDocuments, getDocument, deleteDocument };
