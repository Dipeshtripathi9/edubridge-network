const HONORIFICS = /^(mr|mrs|ms|miss|mx|dr|shri|smt)\.?$/i;

/** First name for greetings — strips a leading honorific (e.g. "Mr. Sharma" → "Sharma") so it never renders verbatim. */
export function firstNameOf(full?: string | null): string {
  const tokens = (full ?? '').trim().split(/\s+/).filter(Boolean);
  const firstReal = tokens.find((t) => !HONORIFICS.test(t));
  return firstReal ?? 'Student';
}
