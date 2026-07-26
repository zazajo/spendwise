import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';
import type { RegisterPayload } from '@/types/auth';

export function useRegister() {
  const { register } = useAuth();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  });
}
