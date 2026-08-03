import type { PropsWithChildren } from 'react';

import { AuthProvider } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemePreferenceProvider } from '@/providers/theme-provider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <ThemePreferenceProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemePreferenceProvider>
    </QueryProvider>
  );
}
