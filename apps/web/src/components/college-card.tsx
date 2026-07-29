import type { ReactNode } from 'react';
import { MapPin, Star } from 'lucide-react';
import type { College } from '@/hooks/use-colleges';

// Shared college card: real fields only (no fabricated match-% or category/
// verified tags — neither exists on the College model). The name is plain
// text, not a link — there is no /colleges/[slug] detail page in the app yet.
export function CollegeCard({ college, actions }: { college: College; actions: ReactNode }) {
  return (
    <article className="flex flex-col gap-3 rounded-[18px] border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-display text-[17px] font-semibold">{college.name}</p>
        {(college.city || college.state) && (
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {[college.city, college.state].filter(Boolean).join(', ')}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1 text-amber-600">
            <Star className="h-3.5 w-3.5 fill-current" /> {college.avgRating.toFixed(1)} ({college.reviewCount})
          </span>
          {college.nirfRank && <span>NIRF #{college.nirfRank}</span>}
          {college.avgPlacementPackage && <span>₹{college.avgPlacementPackage.toLocaleString()} avg. package</span>}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">{actions}</div>
    </article>
  );
}
