import api from './api';

export async function sendMessage(message) {
  const { data } = await api.post('/chat/', { message });
  return data; // { response, tool_used, memory_count, tokens_used, latency_ms }
}

export async function getHistory(limit = 50) {
  const { data } = await api.get('/chat/history', { params: { limit } });
  return data;
}

export async function getMemory() {
  const { data } = await api.get('/chat/memory');
  return data;
}

export async function clearHistory() {
  const { data } = await api.delete('/chat/history');
  return data;
}

export async function exportHistory() {
  const { data } = await api.get('/chat/history/export');
  return data;
}

export default { sendMessage, getHistory, getMemory, clearHistory, exportHistory };
