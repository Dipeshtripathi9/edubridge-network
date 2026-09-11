'use client';

import { useEffect } from 'react';
import { captureReferralCodeFromUrl } from '@/lib/referral';

// Mounted once at the root so a ?ref=<code> is remembered no matter which
// page a referral link lands on, ready for whichever signup method the
// visitor eventually uses.
export function ReferralCapture() {
  useEffect(() => {
    captureReferralCodeFromUrl();
  }, []);
  return null;
}
