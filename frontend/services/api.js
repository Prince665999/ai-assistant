// Central axios instance used by every service file.
//
// Responsibilities kept here, and only here, so the rest of the app
// never has to think about tokens:
//   1. Attach the access token to every outgoing request.
//   2. If a request comes back 401, try ONE silent refresh, retry the
//      original request, and only give up (logging the user out) if the
//      refresh itself fails.
import axios from 'axios';
import { API_URL } from '../utils/constants';
import { tokenStorage } from '../utils/storage';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

// AuthContext registers a callback here so this file can trigger a logout
// without importing AuthContext directly (that would create a circular
// import: api.js -> AuthContext -> api.js).
let onAuthFailure = null;
export function registerAuthFailureHandler(fn) {
  onAuthFailure = fn;
}

api.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

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
      if (!refreshToken) throw new Error('No refresh token available');

      // Plain axios call (not `api`) so this request never gets caught
      // by this same interceptor and loops forever.
      const { data } = await axios.post(`${API_URL}/auth/refresh`, {
        refresh_token: refreshToken,
      });

      if (!data?.access_token) throw new Error('No access token in refresh response');

      await tokenStorage.saveTokens(data.access_token, data.refresh_token);
      resolvePending(data.access_token);

      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
      return api(originalRequest);
    } catch (refreshError) {
      resolvePending(null);
      await tokenStorage.clearTokens();
      if (onAuthFailure) onAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
