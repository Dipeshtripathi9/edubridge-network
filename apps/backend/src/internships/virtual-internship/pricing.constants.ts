import { VirtualInternshipTrack } from '@prisma/client';

/**
 * Hardcoded track prices (INR, pre-GST). Must match apps/web's TRACKS constant —
 * there is no shared source of truth between the two yet.
 */
export const VIRTUAL_INTERNSHIP_PRICES: Record<VirtualInternshipTrack, { priceNow: number; priceOld: number }> = {
  [VirtualInternshipTrack.WEEK]: { priceNow: 2699, priceOld: 4999 },
  [VirtualInternshipTrack.MONTH]: { priceNow: 7635, priceOld: 12999 },
};

const GST_RATE = 0.18;
export const DONATION_AMOUNT = 19;

/** Rounds to the nearest paisa (2 decimal places) — guards against float drift, not a rupee-level rounding compromise. */
function roundToPaisa(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function computeGst(base: number): number {
  return roundToPaisa(base * GST_RATE);
}

/**
 * Server-side fee computation — never trust a client-supplied amount.
 * Returns the exact amount in rupees (up to 2 decimal places, e.g. 3184.82).
 * Deliberately NOT rounded to a whole rupee, so the Razorpay charge matches
 * the displayed GST breakdown exactly instead of silently rounding up.
 */
export function computeVirtualInternshipFee(track: VirtualInternshipTrack, donateApplied: boolean): number {
  const base = VIRTUAL_INTERNSHIP_PRICES[track].priceNow;
  const gst = computeGst(base);
  return roundToPaisa(base + gst + (donateApplied ? DONATION_AMOUNT : 0));
}

export function getVirtualInternshipPricingInfo() {
  return {
    week: { ...VIRTUAL_INTERNSHIP_PRICES.WEEK, gst: computeGst(VIRTUAL_INTERNSHIP_PRICES.WEEK.priceNow) },
    month: { ...VIRTUAL_INTERNSHIP_PRICES.MONTH, gst: computeGst(VIRTUAL_INTERNSHIP_PRICES.MONTH.priceNow) },
    donationAmount: DONATION_AMOUNT,
  };
}
