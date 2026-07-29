'use client';

import { useState } from 'react';
import { Bookmark, BookmarkCheck, GraduationCap, Search as SearchIcon, X } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { CollegeCard } from '@/components/college-card';
import { CollegeQuiz } from '@/components/college-quiz';
import { useColleges, useCollege } from '@/hooks/use-colleges';
import { useCollegeShortlist } from '@/hooks/use-college-shortlist';

function ShortlistSection({ onQuiz }: { onQuiz: () => void }) {
  const { slugs, toggle } = useCollegeShortlist();

  if (slugs.length === 0) {
    return <EmptyState icon={Bookmark} title="Nothing shortlisted yet" description="Shortlist colleges below to keep track of your favorites." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {slugs.map((slug) => (
        <ShortlistedCollege key={slug} slug={slug} onQuiz={onQuiz} onRemove={() => toggle(slug)} />
      ))}
    </div>
  );
}

function ShortlistedCollege({ slug, onQuiz, onRemove }: { slug: string; onQuiz: () => void; onRemove: () => void }) {
  const { data: college, isLoading } = useCollege(slug);
  if (isLoading) return <Skeleton className="h-28 w-full rounded-[18px]" />;
  if (!college) return null;

  return (
    <CollegeCard
      college={college}
      actions={
        <>
          <Button size="sm" variant="outline" onClick={onQuiz}>
            Ask Expert Guide
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={onRemove}>
            <X className="h-4 w-4" /> Remove
          </Button>
        </>
      }
    />
  );
}

function AllCollegesSection({ onQuiz }: { onQuiz: () => void }) {
  const [q, setQ] = useState('');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useColleges({ q, sort: 'rating' });
  const { isShortlisted, toggle } = useCollegeShortlist();
  const colleges = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div>
      <div className="relative mb-4">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search colleges by name…" className="pl-9" />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full rounded-[18px]" />
          <Skeleton className="h-28 w-full rounded-[18px]" />
          <Skeleton className="h-28 w-full rounded-[18px]" />
        </div>
      )}

      {!isLoading && colleges.length === 0 && (
        <EmptyState icon={GraduationCap} title="No colleges found" description={q ? `Nothing matched "${q}".` : "Check back soon — we're adding more colleges."} />
      )}

      {colleges.length > 0 && (
        <div className="flex flex-col gap-3">
          {colleges.map((c) => {
            const shortlisted = isShortlisted(c.slug);
            return (
              <CollegeCard
                key={c.id}
                college={c}
                actions={
                  <>
                    <Button size="sm" variant={shortlisted ? 'default' : 'outline'} className="gap-1.5" onClick={() => toggle(c.slug)}>
                      {shortlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                      {shortlisted ? 'Shortlisted' : 'Shortlist'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={onQuiz}>
                      Ask Expert Guide
                    </Button>
                  </>
                }
              />
            );
          })}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-5 text-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function RecommendedCollegesPage() {
  const [quizOpen, setQuizOpen] = useState(false);
  const openQuiz = () => setQuizOpen(true);

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <CollegeQuiz open={quizOpen} onClose={() => setQuizOpen(false)} />

      <PageHero eyebrow="Recommended" title="Find the college that" accent="fits you." sub="Your shortlist, plus every college ranked by real ratings." />

      <section>
        <h2 className="mb-4 font-display text-[20px] font-semibold">Your shortlist</h2>
        <ShortlistSection onQuiz={openQuiz} />
      </section>

      <section>
        <h2 className="mb-4 font-display text-[20px] font-semibold">All colleges</h2>
        <AllCollegesSection onQuiz={openQuiz} />
      </section>
    </div>
  );
}
