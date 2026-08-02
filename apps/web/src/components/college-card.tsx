import type { ReactNode } from 'react';
import Link from 'next/link';
import { GraduationCap, MapPin, Star } from 'lucide-react';
import type { College } from '@/hooks/use-colleges';

// Shared college card: real fields only (no fabricated match-% or category/
// verified tags — neither exists on the College model). The name links to
// the college hub page (/colleges/[slug]).
// Layout: text column + a cover-photo panel on the right (falls back to a
// muted icon tile when a college has no coverUrl set).
export function CollegeCard({ college, actions }: { college: College; actions: ReactNode }) {
  return (
    <article className="flex overflow-hidden rounded-[18px] border border-border bg-card">
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-5">
        <div className="min-w-0">
          <Link href={`/colleges/${college.slug}`} className="font-display text-[17px] font-semibold hover:underline">
            {college.name}
          </Link>
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
        <div className="mt-auto flex flex-wrap gap-2 [&>*]:flex-1">{actions}</div>
      </div>
      <div className="relative w-[34%] min-w-[96px] shrink-0 sm:w-[220px]">
        {college.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={college.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-accent">
            <GraduationCap className="h-8 w-8 text-primary/30 sm:h-10 sm:w-10" />
          </div>
        )}
      </div>
    </article>
  );
}
