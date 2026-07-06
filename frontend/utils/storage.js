// Platform-aware token storage.
//
// This is the ONLY place in the app that knows how tokens are physically
// stored. Everything else (AuthContext, api.js) calls these functions and
// never touches SecureStore/AsyncStorage directly.
//
// WHY THIS MATTERS FOR WEB:
// expo-secure-store does not work on web. If it's called there it can
// throw or silently fail, which - in a previous version of this app -
// left the auth "checking for a session" state stuck forever, which in
// turn made the whole screen appear blank. Every function below is
// wrapped in try/catch and ALWAYS resolves to a normal value (never
// throws, never hangs), so a storage failure can never freeze the UI.
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEYS } from './constants';

const isWeb = Platform.OS === 'web';

async function getItem(key) {
  try {
    if (isWeb) return await AsyncStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.log(`[storage] getItem(${key}) failed:`, error?.message);
    return null;
  }
}

async function setItem(key, value) {
  try {
    if (isWeb) return await AsyncStorage.setItem(key, value);
    return await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.log(`[storage] setItem(${key}) failed:`, error?.message);
    return null;
  }
}

async function removeItem(key) {
  try {
    if (isWeb) return await AsyncStorage.removeItem(key);
    return await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.log(`[storage] removeItem(${key}) failed:`, error?.message);
    return null;
  }
}

export const tokenStorage = {
  getAccessToken: () => getItem(TOKEN_KEYS.ACCESS),
  getRefreshToken: () => getItem(TOKEN_KEYS.REFRESH),

  async saveTokens(accessToken, refreshToken) {
    await setItem(TOKEN_KEYS.ACCESS, accessToken || '');
    await setItem(TOKEN_KEYS.REFRESH, refreshToken || '');
  },

  async clearTokens() {
    await removeItem(TOKEN_KEYS.ACCESS);
    await removeItem(TOKEN_KEYS.REFRESH);
  },
};

export default tokenStorage;
