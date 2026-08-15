import { makeRedirectUri } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';

import { GOOGLE_CLIENT_ID, GOOGLE_RELAY_URL } from '@/constants/config';

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

export class GoogleSignInError extends Error {}

function buildQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

function extractParam(url: string, key: string): string | null {
  const match = url.match(new RegExp(`[?&#]${key}=([^&]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Runs the Google OAuth consent flow in an in-app browser and resolves with
 * the id_token Google issues, or null if the user cancelled.
 *
 * Google's Web application OAuth clients only accept https:// redirect URIs
 * (custom schemes like exp:// are rejected outright), so Google is told to
 * redirect to a small hosted relay page (GOOGLE_RELAY_URL, see
 * mobile/auth-relay/index.html) instead of straight back into the app. That
 * page immediately forwards to this app's own exp://... callback - carried
 * through as `state` since Google won't forward arbitrary extra params -
 * which is what actually closes the in-app browser and returns control here.
 */
export async function signInWithGoogle(): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_RELAY_URL) {
    throw new GoogleSignInError('Google sign-in is not configured');
  }

  const appRedirectUri = makeRedirectUri();
  const nonce = Crypto.randomUUID();

  const authUrl = `${GOOGLE_AUTH_ENDPOINT}?${buildQueryString({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_RELAY_URL,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce,
    state: appRedirectUri,
    prompt: 'select_account',
  })}`;

  const result = await WebBrowser.openAuthSessionAsync(authUrl, appRedirectUri);
  if (result.type !== 'success') return null;

  const idToken = extractParam(result.url, 'id_token');
  if (!idToken) {
    throw new GoogleSignInError('Google did not return an id token');
  }
  return idToken;
}
