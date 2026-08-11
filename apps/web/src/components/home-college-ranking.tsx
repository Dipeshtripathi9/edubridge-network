'use client';

import Link from 'next/link';
import { ChevronRight, GraduationCap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CollegeRecommendationCard } from '@/components/college-recommendation-card';
import { useColleges } from '@/hooks/use-colleges';
import { useMyProfileLead } from '@/hooks/use-profile-leads';

const PROFILE_UNLOCK_PCT = 75;

// Ranked-colleges preview shown below the signed-in welcome panel on /home.
// Uses only real College fields — no fabricated match-% score (the rating
// ring on each card is real avgRating, not a personalized "fit").
//
// Mobile (<lg) caps the preview to 3 cards, desktop (lg+) to 5 — both send
// "See more recommendations" to the full /colleges/recommended browse page.
export function HomeCollegeRanking({ onQuiz }: { onQuiz: () => void }) {
  const { data } = useColleges({ sort: 'rating' });
  const colleges = data?.pages.flatMap((p) => p.data) ?? [];
  // Server truth for THIS logged-in user's own saved College Admissions
  // profile — not the client-only progress store, which is per-device.
  const { data: myLead } = useMyProfileLead();
  const profilePct = myLead?.completionPct ?? 0;
  const locked = myLead !== undefined && profilePct < PROFILE_UNLOCK_PCT;

  return (
    // pb-8: HomeTools' own top divider cancels the outer space-y gap before
    // it (needed for the logged-out hero->tools flush transition), which
    // otherwise leaves this section's "See more" button flush against it.
    <section className="pb-8">
      <div className="mb-7 border-b border-border pb-7">
        <div className="mb-2 flex items-center gap-2 text-[#1C4736]">
          <GraduationCap className="h-5 w-5" />
          <h2 className="font-fraunces text-[22px] font-semibold sm:text-[26px]">My College Recommendations</h2>
        </div>
        <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Find the college that fits you best. Personalized lists of the best colleges for you based on what&rsquo;s
          important to you.
        </p>
      </div>

      {myLead === undefined ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full rounded-[20px]" />
          <Skeleton className="h-28 w-full rounded-[20px]" />
          <Skeleton className="h-28 w-full rounded-[20px]" />
        </div>
      ) : locked ? (
        <EmptyState
          icon={Lock}
          title="Complete your profile to unlock recommendations"
          description={`Finish at least ${PROFILE_UNLOCK_PCT}% of your College Admissions profile (you're at ${profilePct}%) to see colleges matched to you.`}
          action={
            <Button asChild className="rounded-full bg-[#1C4736] px-6 hover:bg-[#1C4736]/90">
              <Link href="/profile">Complete your profile</Link>
            </Button>
          }
        />
      ) : (
        <>
          <h3 className="mb-6 font-fraunces text-[clamp(20px,3vw,24px)] font-semibold">Colleges looking for you</h3>

          {/* Check `data` rather than `isLoading` here and below — with
              PersistQueryClientProvider, `isLoading` is briefly false during the
              client's cache-restore phase (before the persisted cache or a fresh
              fetch has resolved), a phase SSR never has, so branching on it made
              this flicker between skeleton/empty-state/list right at hydration.
              `data` stays undefined in both the SSR pass and the client's
              pre-restore paint, so it doesn't drift. */}
          {!data && (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-28 w-full rounded-[20px]" />
              <Skeleton className="h-28 w-full rounded-[20px]" />
              <Skeleton className="h-28 w-full rounded-[20px]" />
            </div>
          )}

          {data && colleges.length === 0 && (
            <EmptyState icon={GraduationCap} title="No colleges yet" description="Check back soon — we're adding more colleges." />
          )}

          {colleges.length > 0 && (
            <>
              <div className="flex flex-col gap-3 lg:hidden">
                {colleges.slice(0, 3).map((c) => (
                  <CollegeRecommendationCard key={c.id} college={c} onQuiz={onQuiz} />
                ))}
              </div>
              <div className="hidden flex-col gap-3 lg:flex">
                {colleges.slice(0, 5).map((c) => (
                  <CollegeRecommendationCard key={c.id} college={c} onQuiz={onQuiz} />
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  className="gap-1.5 rounded-full border-[#1C4736] px-6 text-[#1C4736] hover:bg-[#E7F1EB] hover:text-[#1C4736]"
                  asChild
                >
                  <Link href="/colleges/recommended?tab=all">
                    See more recommendations <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
}
