import api from './api'; // assumes services/api.js exports a configured axios instance
                          // with baseURL + auth header injection (Step 14)

export async function sendMessage(message) {
  const { data } = await api.post('/chat/', { message });
  return data; // { response, tool_used, memory_count, tokens_used, latency_ms }
}

export async function getHistory(limit = 50) {
  const { data } = await api.get('/chat/history', { params: { limit } });
  return data; // [{ id, role, content, tool_used, created_at }]
}

export async function clearHistory() {
  const { data } = await api.delete('/chat/history');
  return data;
}

export async function exportHistory() {
  const { data } = await api.get('/chat/history/export');
  return data;
}