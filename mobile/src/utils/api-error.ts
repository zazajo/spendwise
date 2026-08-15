/**
 * Pulls the human-readable message out of a failed API call.
 *
 * DRF sends errors as `{"error": "..."}` (our custom actions), `{"detail": "..."}`
 * (framework-level failures like permissions), or per-field lists such as
 * `{"current_password": ["Current password is incorrect"]}` when a serializer
 * rejects the input - check all three before falling back to the caller's copy.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: unknown } })?.response;
  if (!response) {
    // No response reached us at all: unreachable host, dropped connection, or
    // our own timeout. That's a connectivity problem, not a rejection by the
    // server - saying so avoids it reading as "your password is wrong" when
    // the request never actually got evaluated.
    return "Can't reach the server. Check your connection and try again.";
  }

  const data = response.data;
  if (!data || typeof data !== 'object') return fallback;

  const body = data as Record<string, unknown>;
  if (typeof body.error === 'string') return body.error;
  if (typeof body.detail === 'string') return body.detail;

  for (const value of Object.values(body)) {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  }

  return fallback;
}
