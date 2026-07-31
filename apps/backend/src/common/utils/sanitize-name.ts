const LEADING_HONORIFIC = /^(mr|mrs|ms|miss|mx|dr|shri|smt)\.?\s+/i;

/** Strips a leading honorific ("Mr. Sharma" -> "Sharma") so it's never stored verbatim. */
export function stripLeadingHonorific(fullName: string): string {
  const stripped = fullName.replace(LEADING_HONORIFIC, '').trim();
  return stripped || fullName.trim();
}
