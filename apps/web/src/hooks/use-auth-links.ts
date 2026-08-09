'use client';

import { usePathname } from 'next/navigation';

/**
 * Sign-in/sign-up hrefs that carry the current page as a `redirect` param, so
 * the auth pages can send the user back here once they're done. Deliberately
 * pathname-only (no query string) — "same page", not "same exact state".
 */
export function useAuthLinks() {
  const pathname = usePathname();
  const redirect = encodeURIComponent(pathname);
  return {
    loginHref: `/login?redirect=${redirect}`,
    signupHref: `/signup?redirect=${redirect}`,
  };
}
