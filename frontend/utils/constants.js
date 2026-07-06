// Expo automatically inlines any env var prefixed with EXPO_PUBLIC_ at
// build time, for both native and web - no extra babel plugin needed.
export const API_URL = "https://ai-assistant-d2mk.onrender.com";

export const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const CHAT_HISTORY_PAGE_SIZE = 20;

export const DATE_RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

export const TOOL_LABELS = {
  calculator: 'Calculator',
  weather: 'Weather',
  news: 'News',
  search_documents: 'Documents',
  no_tool: 'Direct Answer',
};

export default { API_URL, TOKEN_KEYS, ROLES, CHAT_HISTORY_PAGE_SIZE, DATE_RANGES, TOOL_LABELS };
