'use client';

import { PageHero } from '@/components/page-hero';
import { ReferralsSection } from '@/components/perks';
import { useAuthStore } from '@/stores/auth.store';

export default function ReferralPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <PageHero
        eyebrow="Referral"
        title="Your career"
        accent="boost."
        sub="Priority access to roles on the platform, and referral opportunities curated by the EduBridge team."
      />

      <ReferralsSection enabled isAdmin={isAdmin} />
    </div>
  );
}
