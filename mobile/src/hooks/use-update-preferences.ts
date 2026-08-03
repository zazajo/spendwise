import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';
import { updatePreferences } from '@/services/profile';
import type { UserPreference } from '@/types/auth';

export function useUpdatePreferences(id: number) {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: (payload: Partial<Pick<UserPreference, 'notification_enabled' | 'budget_alert_threshold'>>) =>
      updatePreferences(id, payload),
    onSuccess: () => refreshUser(),
  });
}
