const REF_STORAGE_KEY = 'edubridge-referral-code';

/** Reads ?ref= off the current URL and remembers it for the eventual signup. */
export function captureReferralCodeFromUrl(): void {
  if (typeof window === 'undefined') return;
  try {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref) window.localStorage.setItem(REF_STORAGE_KEY, ref);
  } catch {
    /* localStorage can throw in private-browsing/blocked-storage contexts */
  }
}

/** The referral code captured earlier this session/device, if any. */
export function getStoredReferralCode(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage.getItem(REF_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}
