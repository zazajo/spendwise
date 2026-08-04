import { useMutation } from '@tanstack/react-query';

import { changePassword } from '@/services/profile';

// Nothing to invalidate: the password isn't part of any cached query, and the
// access token keeps working, so the session survives the change.
export function useChangePassword() {
  return useMutation({ mutationFn: changePassword });
}
