'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useMe } from '@/hooks/use-profile';

// A thin strip shown at the top of every page (except home / the verify pages)
// when the viewer is NOT a verified student — nudging them to verify so they get
// personalised resources and can help juniors with true college insights.
export function VerifyBanner() {
  const pathname = usePathname();
  const { data: me } = useMe();
  const verified = me?.profile?.collegeVerification === 'VERIFIED';

  // Hide on the dashboard, on the verification flow itself, and for verified students.
  if (pathname === '/home' || pathname === '/' || pathname.startsWith('/verify') || verified) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-x-2 gap-y-1 border-b border-primary/20 bg-primary/10 px-4 py-1.5 text-center text-xs text-foreground">
      <ShieldCheck className="hidden h-3.5 w-3.5 shrink-0 text-primary sm:block" />
      <span className="text-muted-foreground">
        Verify yourself to unlock personalised resources — and help new students with your true
        college insights.
      </span>
      <Link
        href="/verify"
        className="inline-flex shrink-0 items-center gap-0.5 font-semibold text-primary hover:underline"
      >
        Verify <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
