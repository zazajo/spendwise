import { useAuth } from '@/hooks/use-auth';

/**
 * The signed-in user's currency code, or '' before the profile has loaded.
 *
 * Prefer this over threading a `currency` prop down from a screen - every
 * component that renders money already sits under the AuthProvider.
 */
export function useCurrency(): string {
  const { user } = useAuth();
  return user?.profile.currency ?? '';
}
