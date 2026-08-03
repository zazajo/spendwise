import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';
import { updateUser } from '@/services/profile';

export function useUpdateUser() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => refreshUser(),
  });
}
