import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';
import type { LoginPayload } from '@/types/auth';

export function useLogin() {
  const { login } = useAuth();
  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
  });
}
