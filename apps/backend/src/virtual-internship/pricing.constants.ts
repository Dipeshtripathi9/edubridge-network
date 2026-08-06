import { VirtualInternshipTrack } from '@prisma/client';

/**
 * Hardcoded Virtual Internship fee table (INR). Snapshot onto
 * `VirtualInternshipEnrollment.feeAmount` at enroll time — never re-read this
 * config later, so a price change never retroactively changes what an
 * already-enrolled student owes.
 */
export const VIRTUAL_INTERNSHIP_FEES: Record<VirtualInternshipTrack, number> = {
  [VirtualInternshipTrack.FOUR_WEEK]: 2_790,
  [VirtualInternshipTrack.FOUR_MONTH]: 7_890,
};

export function getVirtualInternshipFee(track: VirtualInternshipTrack): number {
  return VIRTUAL_INTERNSHIP_FEES[track];
}
