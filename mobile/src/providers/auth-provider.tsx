import { useQueryClient } from '@tanstack/react-query';
import { createContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { setAccessToken, setSessionExpiredHandler } from '@/services/api';
import * as authService from '@/services/auth';
import { clearStoredTokens, getStoredTokens } from '@/services/tokenStorage';
import type { LoginPayload, RegisterPayload, User } from '@/types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  // The 401 interceptor in services/api.ts calls this when a refresh attempt
  // fails, so an expired/blacklisted refresh token logs the user out from
  // wherever they are, not just from an explicit "Log out" button.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus('unauthenticated');
      queryClient.clear();
    });
    return () => setSessionExpiredHandler(null);
  }, [queryClient]);

  useEffect(() => {
    (async () => {
      const tokens = await getStoredTokens();
      if (!tokens) {
        setStatus('unauthenticated');
        return;
      }

      setAccessToken(tokens.access);
      try {
        const currentUser = await authService.fetchCurrentUser();
        setUser(currentUser);
        setStatus('authenticated');
      } catch {
        setUser(null);
        setStatus('unauthenticated');
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      async login(payload) {
        const data = await authService.login(payload);
        setUser(data.user);
        setStatus('authenticated');
      },
      async register(payload) {
        await authService.register(payload);
        // Registration only returns id/username/email, so hydrate the full
        // profile the same way the bootstrap flow does.
        const currentUser = await authService.fetchCurrentUser();
        setUser(currentUser);
        setStatus('authenticated');
      },
      async logout() {
        const tokens = await getStoredTokens();
        if (tokens) {
          await authService.logout(tokens.refresh);
        }
        await clearStoredTokens();
        setAccessToken(null);
        setUser(null);
        setStatus('unauthenticated');
        queryClient.clear();
      },
    }),
    [status, user, queryClient]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
