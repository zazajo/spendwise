import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthTokens } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'spendwise_access_token';
const REFRESH_TOKEN_KEY = 'spendwise_refresh_token';

// expo-secure-store only implements iOS/Android/tvOS; calling it on web throws
// ("getValueWithKeyAsync is not a function"). Fall back to localStorage there -
// it's still local-only, just without SecureStore's native keychain encryption.
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof localStorage === 'undefined' ? null : localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

export async function getStoredTokens(): Promise<AuthTokens | null> {
  const [access, refresh] = await Promise.all([
    storage.getItem(ACCESS_TOKEN_KEY),
    storage.getItem(REFRESH_TOKEN_KEY),
  ]);

  if (!access || !refresh) return null;
  return { access, refresh };
}

export async function setStoredTokens(tokens: AuthTokens): Promise<void> {
  await Promise.all([
    storage.setItem(ACCESS_TOKEN_KEY, tokens.access),
    storage.setItem(REFRESH_TOKEN_KEY, tokens.refresh),
  ]);
}

export async function clearStoredTokens(): Promise<void> {
  await Promise.all([storage.removeItem(ACCESS_TOKEN_KEY), storage.removeItem(REFRESH_TOKEN_KEY)]);
}
