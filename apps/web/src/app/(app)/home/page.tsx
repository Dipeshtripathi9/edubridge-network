'use client';

import { ExpertGuidance } from '@/components/expert-guidance';
import { HomeShowcase } from '@/components/home-showcase';

// The home page is the brand landing: the expert-guidance hero followed by the
// full showcase (verified colleges, how it works, real data, Opportunity Hub,
// builders, review and CTA). Personalised feeds live on their own pages
// (Communities, Opportunities, Saved) reachable from the sidebar.
export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-14 sm:space-y-20">
      <ExpertGuidance />
      <HomeShowcase />
    </div>
  );
}
