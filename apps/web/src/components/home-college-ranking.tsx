'use client';

import Link from 'next/link';
import { ChevronRight, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CollegeRecommendationCard } from '@/components/college-recommendation-card';
import { useColleges } from '@/hooks/use-colleges';

// Ranked-colleges preview shown below the signed-in welcome panel on /home.
// Uses only real College fields — no fabricated match-% score (the rating
// ring on each card is real avgRating, not a personalized "fit").
//
// Mobile (<lg) caps the preview to 3 cards, desktop (lg+) to 5 — both send
// "See more recommendations" to the full /colleges/recommended browse page.
export function HomeCollegeRanking({ onQuiz }: { onQuiz: () => void }) {
  const { data, isLoading } = useColleges({ sort: 'rating' });
  const colleges = data?.pages.flatMap((p) => p.data) ?? [];

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

      <h3 className="mb-6 font-fraunces text-[clamp(20px,3vw,24px)] font-semibold">Colleges looking for you</h3>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full rounded-[20px]" />
          <Skeleton className="h-28 w-full rounded-[20px]" />
          <Skeleton className="h-28 w-full rounded-[20px]" />
        </div>
      )}

      {!isLoading && colleges.length === 0 && (
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
              <Link href="/colleges/recommended">
                See more recommendations <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
