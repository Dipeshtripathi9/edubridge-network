/**
 * A `redirect` value arrives via a query param, so it's attacker-influenceable.
 * Only ever navigate to it if it's an internal relative path — never an
 * absolute/protocol-relative URL — otherwise fall back to `fallback`.
 */
export function sanitizeRedirect(raw: string | null | undefined, fallback: string): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\') || raw.includes('://')) {
    return fallback;
  }
  return raw;
}
