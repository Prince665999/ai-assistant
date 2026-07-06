import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/auth';
import { registerAuthFailureHandler } from '../services/api';
import { tokenStorage } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore session on app start.
  //
  // IMPORTANT: this effect is guaranteed to end with setIsLoading(false)
  // no matter what happens inside the try block. A previous version of
  // this app could get stuck here forever on web (because expo-secure-store
  // doesn't work there), which produced an invisible, permanently-loading
  // blank screen. tokenStorage already catches its own errors and returns
  // null instead of throwing, and the finally block below is a second
  // safety net.
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const accessToken = await tokenStorage.getAccessToken();
        if (!accessToken) {
          if (isMounted) setUser(null);
          return;
        }
        const me = await authService.fetchMe();
        if (isMounted) setUser(me);
      } catch (error) {
        console.log('[auth] session restore failed:', error?.message);
        await tokenStorage.clearTokens();
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // If api.js ever gives up on a refresh, it calls this to force a clean logout.
  useEffect(() => {
    registerAuthFailureHandler(() => setUser(null));
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    const tokens = await authService.login(email, password);
    await tokenStorage.saveTokens(tokens.access_token, tokens.refresh_token);
    const me = await authService.fetchMe();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(async (email, password) => {
    setAuthError(null);
    await authService.register(email, password);
    // Auto-login right after registering for a smoother first-run experience.
    return login(email, password);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) await authService.logout(refreshToken);
    } catch (error) {
      console.log('[auth] logout request failed (clearing local session anyway):', error?.message);
    } finally {
      await tokenStorage.clearTokens();
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    authError,
    login,
    register,
    logout,
    setAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;
