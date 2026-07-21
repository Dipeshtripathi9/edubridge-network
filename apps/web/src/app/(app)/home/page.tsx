'use client';

import { HomeIllustrated } from '@/components/home-illustrated';

// The home page is the brand landing — an illustrated, calm layout: bridge hero
// with the working Get Expert Guidance form, announcement, why/popular cards,
// students-first Q&A, planning + verified-college insights, and testimonials.
// Personalised feeds live on their own pages (Internship, Saved).
export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <HomeIllustrated />
    </div>
  );
}
