import { storage } from '@/services/local-storage';
import type { AuthTokens } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'spendwise_access_token';
const REFRESH_TOKEN_KEY = 'spendwise_refresh_token';

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
