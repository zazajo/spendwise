import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';

export function useLogout() {
  const { logout } = useAuth();
  return useMutation({
    mutationFn: () => logout(),
  });
}
