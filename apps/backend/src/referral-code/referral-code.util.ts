// "EBN" + the raw sequence number, no padding: EBN0, EBN1, EBN2, … EBN99,
// EBN100, and so on indefinitely.
export function formatReferralCode(sequence: number): string {
  return `EBN${sequence}`;
}
