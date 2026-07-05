// Single source of truth for "who is logged in".
//
// AppNavigator reads `isAuthenticated` + `user.role` to decide which stack
// to show (Auth / User / Admin). Screens read `login`/`register`/`logout`
// to change that state.

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { registerAuthFailureHandler } from '../services/api';

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

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearSession = useCallback(async () => {
    await tokenStorage.clearTokens();
    setUser(null);
  }, []);

  // Try to restore a session on app start if we already have tokens saved.
  useEffect(() => {
    (async () => {
      try {
        const accessToken = await tokenStorage.getAccessToken();
        if (accessToken) {
          // Set the token in axios headers
          api.defaults.headers.Authorization = `Bearer ${accessToken}`;
          const response = await api.get('/auth/me');
          setUser(response.data);
        }
      } catch (err) {
        // Token invalid/expired - just start logged out.
        console.log('Session restore failed:', err);
        await clearSession();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [clearSession]);

  // If a background token refresh ever fails (see services/api.js), log
  // the user out cleanly instead of leaving them in a broken state.
  useEffect(() => {
    registerAuthFailureHandler(() => {
      setUser(null);
    });
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Check if response has the expected data
      if (!response.data || !response.data.access_token) {
        throw new Error('Invalid login response from server');
      }
      
      const { access_token, refresh_token } = response.data;
      
      await tokenStorage.saveTokens(access_token, refresh_token);
      
      // Set the token in axios headers for subsequent requests
      api.defaults.headers.Authorization = `Bearer ${access_token}`;
      
      const meResponse = await api.get('/auth/me');
      setUser(meResponse.data);
      
      return { success: true };
    } catch (err) {
      const message =
        err.response?.data?.detail || err.message || 'Login failed. Please try again.';
      setError(message);
      console.error('Login error:', err);
      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/register', { email, password });
      console.log('Registration successful:', response.data);
      
      // Auto-login right after a successful registration.
      return login(email, password);
    } catch (err) {
      const message =
        err.response?.data?.detail || 'Registration failed. Please try again.';
      setError(message);
      console.error('Registration error:', err);
      return { success: false, error: message };
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      }
    } catch (err) {
      // Even if the server call fails, still clear the local session.
      console.warn('Logout request failed, clearing session locally', err);
    } finally {
      await clearSession();
      delete api.defaults.headers.Authorization;
    }
  }, [clearSession]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;