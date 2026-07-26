import { api, setAccessToken } from '@/services/api';
import { setStoredTokens } from '@/services/tokenStorage';
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse, User } from '@/types/auth';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/token/', payload);
  await setStoredTokens({ access: data.access, refresh: data.refresh });
  setAccessToken(data.access);
  return data;
}

export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>('/register/', payload);
  await setStoredTokens({ access: data.access, refresh: data.refresh });
  setAccessToken(data.access);
  return data;
}

export async function logout(refreshToken: string): Promise<void> {
  // Best-effort: even if the blacklist call fails (e.g. offline), the caller
  // still clears local tokens so the app treats the session as ended.
  await api.post('/token/logout/', { refresh: refreshToken }).catch(() => undefined);
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>('/users/me/');
  return data;
}
