/**
 * Pulls the human-readable message out of a failed API call.
 *
 * DRF sends errors as either `{"error": "..."}` (our custom actions) or
 * `{"detail": "..."}` (framework-level failures like permissions), so check
 * both before falling back to the caller's copy.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as { response?: { data?: { error?: string; detail?: string } } })?.response
    ?.data;
  return data?.error ?? data?.detail ?? fallback;
}
