// Central axios instance used by every service file.
//
// Responsibilities kept here (and only here) so the rest of the app never
// has to think about tokens:
//   1. Attach the access token to every outgoing request.
//   2. If a request comes back 401, try ONE silent refresh, retry the
//      original request, and only give up (logging the user out) if the
//      refresh itself fails.

import axios from 'axios';
import { API_URL } from '../utils/constants';
import * as SecureStore from 'expo-secure-store';

// --- Token storage functions directly in this file ---
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const tokenStorage = {
  getAccessToken: async () => {
    try {
      return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.log('Error getting access token:', error);
      return null;
    }
  },
  getRefreshToken: async () => {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.log('Error getting refresh token:', error);
      return null;
    }
  },
  saveTokens: async (accessToken, refreshToken) => {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
      console.log('Error saving tokens:', error);
    }
  },
  clearTokens: async () => {
    try {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.log('Error clearing tokens:', error);
    }
  },
};

// --- Create axios instance ---
const api = axios.create({
  baseURL: API_URL || 'http://192.168.100.149:8000',
  timeout: 15000,
});

// The AuthContext registers a callback here so this file can trigger a
// logout without importing AuthContext directly (that would create a
// circular import: api.js -> AuthContext -> api.js).
let onAuthFailure = null;
export function registerAuthFailureHandler(fn) {
  onAuthFailure = fn;
}

// --- Request interceptor: attach access token ---
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.log('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Response interceptor: refresh once on 401, then retry ---
let isRefreshing = false;
let pendingRequests = [];

function resolvePending(newToken) {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // If not 401 or already retried, reject
    if (status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If already refreshing, wait for the new token
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((newToken) => {
          if (!newToken) return reject(error);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Plain axios call (not `api`) so this request itself never gets
      // caught by this same interceptor.
      const { data } = await axios.post(`${API_URL || 'http://192.168.100.149:8000'}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      if (!data.access_token) {
        throw new Error('No access token in refresh response');
      }

      await tokenStorage.saveTokens(data.access_token, data.refresh_token);
      resolvePending(data.access_token);

      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      resolvePending(null);
      await tokenStorage.clearTokens();
      if (onAuthFailure) {
        onAuthFailure();
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;