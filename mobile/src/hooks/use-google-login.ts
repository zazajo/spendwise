import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/hooks/use-auth';
import { signInWithGoogle } from '@/services/google-auth';

export function useGoogleLogin() {
  const { loginWithGoogle } = useAuth();
  return useMutation({
    mutationFn: async () => {
      const idToken = await signInWithGoogle();
      if (!idToken) return; // user closed the browser before finishing - not an error
      await loginWithGoogle(idToken);
    },
  });
}
