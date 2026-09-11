// "EBN" + the sequence zero-padded to 4 digits (EBN0001, EBN0002, …).
// Not truncated past 4 digits — padStart just stops padding once the
// sequence itself is wider (EBN10000, EBN10001, …).
export function formatReferralCode(sequence: number): string {
  return `EBN${String(sequence).padStart(4, '0')}`;
}
