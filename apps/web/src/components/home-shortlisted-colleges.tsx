'use client';

import { useEffect, useRef } from 'react';
import { BookmarkX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CollegeCard } from '@/components/college-card';
import { useCollege } from '@/hooks/use-colleges';
import { useCollegeShortlist } from '@/hooks/use-college-shortlist';

function ShortlistedCollegeItem({ slug, onRemove }: { slug: string; onRemove: () => void }) {
  const { data: college, isLoading, isError } = useCollege(slug);
  const cleaned = useRef(false);

  // Self-heal: a shortlisted college that's since been deleted/renamed
  // shouldn't leave a permanent gap in the list — drop it silently.
  useEffect(() => {
    if (isError && !cleaned.current) {
      cleaned.current = true;
      onRemove();
    }
  }, [isError, onRemove]);

  if (isLoading) return <Skeleton className="h-28 w-full rounded-[18px]" />;
  if (!college) return null;

  return (
    <CollegeCard
      college={college}
      actions={
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onRemove}>
          <BookmarkX className="h-4 w-4" /> Remove
        </Button>
      }
    />
  );
}

// "My Shortlist" home section — surfaces colleges the student has already
// shortlisted (via the bookmark action on college cards elsewhere in the
// app). Renders nothing once the shortlist is empty.
export function HomeShortlistedColleges() {
  const { slugs, toggle } = useCollegeShortlist();

  if (slugs.length === 0) return null;

  return (
    <section>
      <h2 className="mb-6 font-display text-[clamp(22px,3vw,28px)] font-semibold">My shortlist</h2>
      <div className="flex flex-col gap-3">
        {slugs.map((slug) => (
          <ShortlistedCollegeItem key={slug} slug={slug} onRemove={() => toggle(slug)} />
        ))}
      </div>
    </section>
  );
}
