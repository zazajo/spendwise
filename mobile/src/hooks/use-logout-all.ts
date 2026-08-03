import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';
import { logoutAllDevices } from '@/services/profile';

// The current device's own session is blacklisted too (it's an outstanding
// token like any other), so a successful call always ends with a local logout.
export function useLogoutAll() {
  const { logout } = useAuth();
  return useMutation({
    mutationFn: logoutAllDevices,
    onSuccess: () => logout(),
  });
}
