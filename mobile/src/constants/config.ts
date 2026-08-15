import Constants from 'expo-constants';

// Prefer an explicit URL (set EXPO_PUBLIC_API_URL in .env) so production/staging
// builds always point somewhere deliberate. In dev without that set, fall back to
// the Metro dev server's own host so physical devices on the same LAN just work.
function resolveApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:8000/api`;
  }

  return 'http://localhost:8000/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

// "Sign in with Google" - both unset just means the button doesn't render
// (see login.tsx/register.tsx), so this project keeps working before anyone
// has walked through the Google Cloud Console setup.
export const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '';
export const GOOGLE_RELAY_URL = process.env.EXPO_PUBLIC_GOOGLE_RELAY_URL ?? '';
