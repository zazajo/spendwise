/**
 * Pulls the human-readable message out of a failed API call.
 *
 * DRF sends errors as `{"error": "..."}` (our custom actions), `{"detail": "..."}`
 * (framework-level failures like permissions), or per-field lists such as
 * `{"current_password": ["Current password is incorrect"]}` when a serializer
 * rejects the input - check all three before falling back to the caller's copy.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
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
