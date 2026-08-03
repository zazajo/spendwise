import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';
import { updateProfile } from '@/services/profile';

export function useUpdateProfileSettings() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => refreshUser(),
  });
}
