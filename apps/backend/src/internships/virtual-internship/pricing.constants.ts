import { VirtualInternshipTrack } from '@prisma/client';

/**
 * Hardcoded track prices (INR, pre-GST). Must match apps/web's TRACKS constant —
 * there is no shared source of truth between the two yet.
 */
// TEMPORARY: WEEK price dropped to ₹1 for a live-payment smoke test — revert before merging anything else.
export const VIRTUAL_INTERNSHIP_PRICES: Record<VirtualInternshipTrack, { priceNow: number; priceOld: number }> = {
  [VirtualInternshipTrack.WEEK]: { priceNow: 1, priceOld: 4999 },
  [VirtualInternshipTrack.MONTH]: { priceNow: 7634, priceOld: 12999 },
};

const GST_RATE = 0.18;
export const DONATION_AMOUNT = 19;

/** Server-side fee computation — never trust a client-supplied amount. */
export function computeVirtualInternshipFee(track: VirtualInternshipTrack, donateApplied: boolean): number {
  const base = VIRTUAL_INTERNSHIP_PRICES[track].priceNow;
  const gst = Math.round(base * GST_RATE);
  return base + gst + (donateApplied ? DONATION_AMOUNT : 0);
}

export function getVirtualInternshipPricingInfo() {
  return {
    week: { ...VIRTUAL_INTERNSHIP_PRICES.WEEK, gst: Math.round(VIRTUAL_INTERNSHIP_PRICES.WEEK.priceNow * GST_RATE) },
    month: {
      ...VIRTUAL_INTERNSHIP_PRICES.MONTH,
      gst: Math.round(VIRTUAL_INTERNSHIP_PRICES.MONTH.priceNow * GST_RATE),
    },
    donationAmount: DONATION_AMOUNT,
  };
}
