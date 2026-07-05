// Central place for "magic strings" used across the app.

// Falls back to localhost if no .env value is picked up by react-native-dotenv.
export const API_URL = 'http://192.168.100.149:8000';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

export const TOOL_NAMES = {
  CALCULATOR: 'calculator',
  WEATHER: 'weather',
  NEWS: 'news',
  SEARCH_DOCUMENTS: 'search_documents',
  NONE: 'no_tool',
};
