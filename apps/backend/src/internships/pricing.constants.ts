import { EnrollmentSubtype } from '@prisma/client';

/**
 * Hardcoded Track A fee table (INR). Snapshot onto `TrackAEnrollment.feeAmount`
 * at enroll time — never re-read this config later, so a price change never
 * retroactively changes what an already-enrolled student owes.
 */
export const TRACK_A_FEES: Record<EnrollmentSubtype, number> = {
  [EnrollmentSubtype.GUIDED_LEARNING]: 2_999,
  [EnrollmentSubtype.OWN_PROJECT]: 24_999,
};

export function getTrackAFee(subtype: EnrollmentSubtype): number {
  return TRACK_A_FEES[subtype];
}

/** Public pricing payload for `GET /internships/pricing`. */
export function getPricingInfo() {
  return {
    trackA: {
      GUIDED_LEARNING: {
        feeAmount: TRACK_A_FEES.GUIDED_LEARNING,
        label: 'Guided Learning',
        description: 'Learn with a mentor and complete milestone tasks.',
      },
      OWN_PROJECT: {
        feeAmount: TRACK_A_FEES.OWN_PROJECT,
        label: 'Own Project',
        description: "EduBridge's team builds your own project idea for you.",
      },
    },
    trackB: {
      label: 'Free, merit-based application',
      description:
        'Apply for free — if selected, EduBridge allocates you either paid client work or a skill-building task.',
    },
  };
}
