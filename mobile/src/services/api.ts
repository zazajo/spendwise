import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL } from '@/constants/config';
import { clearStoredTokens, getStoredTokens, setStoredTokens } from '@/services/tokenStorage';

export const api = axios.create({ baseURL: API_BASE_URL });

// Kept in memory (not read from SecureStore on every request) and mirrored into
// SecureStore whenever it changes via login/refresh/logout.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// Registered by AuthProvider so this module can signal "the session is dead"
// without importing React/context code (would create a circular dependency).
let onSessionExpired: (() => void) | null = null;

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler;
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

// Refresh tokens rotate on every use, so concurrent 401s must share a single
// in-flight refresh call rather than each redeeming (and invalidating) their own.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const stored = await getStoredTokens();
  if (!stored) throw new Error('No refresh token available');

  const { data } = await axios.post<{ access: string; refresh?: string }>(
    `${API_BASE_URL}/token/refresh/`,
    { refresh: stored.refresh }
  );

  const nextTokens = { access: data.access, refresh: data.refresh ?? stored.refresh };
  await setStoredTokens(nextTokens);
  setAccessToken(nextTokens.access);
  return nextTokens.access;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isRefreshCall = originalRequest?.url?.includes('/token/refresh/');

    if (status !== 401 || !originalRequest || originalRequest._retry || isRefreshCall) {
      throw error;
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken();
      }
      const newAccessToken = await refreshPromise;
      originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
      return api(originalRequest);
    } catch (refreshError) {
      await clearStoredTokens();
      setAccessToken(null);
      onSessionExpired?.();
      throw refreshError;
    } finally {
      refreshPromise = null;
    }
  }
);
