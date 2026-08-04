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

export async function uploadAvatar(image: {
  uri: string;
  mimeType?: string;
  fileName?: string;
}): Promise<Profile> {
  const form = new FormData();
  // React Native's FormData takes this {uri, name, type} shape rather than a
  // Blob - the native layer streams the file straight off disk.
  form.append('avatar', {
    uri: image.uri,
    name: image.fileName || 'avatar.jpg',
    type: image.mimeType || 'image/jpeg',
  } as unknown as Blob);

  const { data } = await api.post<Profile>('/profiles/avatar/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function removeAvatar(): Promise<Profile> {
  const { data } = await api.delete<Profile>('/profiles/avatar/');
  return data;
}

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>('/users/change_password/', payload);
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
