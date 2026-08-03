import { api } from '@/services/api';
import type { Profile, User, UserPreference } from '@/types/auth';

export async function updateUser(payload: {
  first_name?: string;
  last_name?: string;
  email?: string;
}): Promise<User> {
  const { data } = await api.patch<User>('/users/update_me/', payload);
  return data;
}

export async function updateProfile(payload: {
  currency: string;
  monthly_income: string | null;
}): Promise<Profile> {
  const { data } = await api.put<Profile>('/profiles/update_profile/', payload);
  return data;
}

export async function updatePreferences(
  id: number,
  payload: Partial<Pick<UserPreference, 'notification_enabled' | 'budget_alert_threshold'>>
): Promise<UserPreference> {
  const { data } = await api.patch<UserPreference>(`/preferences/${id}/`, payload);
  return data;
}

export async function logoutAllDevices(): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/token/logout-all/');
  return data;
}
