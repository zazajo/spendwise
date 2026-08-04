import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';
import { removeAvatar, uploadAvatar } from '@/services/profile';

export function useUploadAvatar() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => refreshUser(),
  });
}

export function useRemoveAvatar() {
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: removeAvatar,
    onSuccess: () => refreshUser(),
  });
}
