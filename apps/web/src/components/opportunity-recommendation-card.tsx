'use client';

import Link from 'next/link';
import { Bookmark, BookmarkCheck, Briefcase, ChevronRight, Clock, Laptop, PenLine, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isSafeHttpUrl, cn } from '@/lib/utils';
import { OPPORTUNITY_TYPE_LABEL, type InternshipListing, type OpportunityType } from '@/hooks/use-internship-listings';
import { useInternshipListingShortlist } from '@/hooks/use-internship-listing-shortlist';
import { useInternshipListingApplied } from '@/hooks/use-internship-listing-applied';

const TYPE_ICON: Record<OpportunityType, typeof Briefcase> = {
  INTERNSHIP: Briefcase,
  PART_TIME: Clock,
  FREELANCE: Laptop,
  BLOGGING: PenLine,
  STARTUP: Rocket,
};

// Same left-badge/actions/"Up next" layout as CollegeRecommendationCard, for
// visual consistency with /colleges/recommended — but the badge shows the
// listing's real type instead of a fabricated fit score (no rating exists
// for opportunities).
function TypeBadge({ type }: { type: OpportunityType }) {
  const Icon = TYPE_ICON[type] ?? Briefcase;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-[5px] border-[#EFEBDE] bg-[#E7F1EB]">
        <Icon className="h-7 w-7 text-[#2B6A53]" />
      </div>
      <div className="max-w-[76px] text-center text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] text-muted-foreground/70">
        {OPPORTUNITY_TYPE_LABEL[type]}
      </div>
    </div>
  );
}

function DetailsLink({ slug, className }: { slug: string; className?: string }) {
  return (
    <Link href={`/internship/${slug}`} className={className}>
      View details <ChevronRight className="h-3 w-3" />
    </Link>
  );
}

export function OpportunityRecommendationCard({ listing, onQuiz }: { listing: InternshipListing; onQuiz: () => void }) {
  const { isShortlisted, toggle } = useInternshipListingShortlist();
  const shortlisted = isShortlisted(listing.slug);
  const { isApplied, markApplied } = useInternshipListingApplied();
  const applied = isApplied(listing.slug);
  const canApply = isSafeHttpUrl(listing.applyUrl);

  return (
    <article className="grid grid-cols-[72px_1fr] gap-x-4 gap-y-3 rounded-[20px] border border-border bg-card p-[18px_18px_16px] shadow-[0_1px_2px_rgba(24,35,51,0.04),0_8px_24px_rgba(24,35,51,0.06)] min-[900px]:grid-cols-[84px_220px_1fr_1fr_140px] min-[900px]:items-center min-[900px]:gap-x-5 min-[900px]:p-[22px_26px]">
      <div className="row-span-3 flex flex-col items-center gap-1.5 pt-0.5 min-[900px]:row-auto">
        <TypeBadge type={listing.type} />
      </div>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="m-0 mb-[3px] min-w-0 flex-1 truncate font-fraunces text-[19px] font-semibold leading-tight tracking-tight">
            <Link href={`/internship/${listing.slug}`} className="hover:underline">
              {listing.title}
            </Link>
          </h3>
          <DetailsLink
            slug={listing.slug}
            className="mt-[3px] flex flex-none items-center gap-[3px] whitespace-nowrap rounded-full bg-[#E4EFF6] px-2.5 py-1 text-[12.5px] font-semibold text-[#1E5A82] min-[900px]:hidden"
          />
        </div>
        <p className="m-0 mb-2.5 text-[13.5px] text-muted-foreground">
          {listing.company} · {listing.isRemote ? 'Remote' : listing.location}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#E7F1EB] px-2.5 py-1 text-[11.5px] font-semibold text-[#1C4736]">{listing.category}</span>
          <span className="rounded-full bg-[#EFEBDE] px-2.5 py-1 text-[11.5px] font-semibold text-muted-foreground">{listing.duration}</span>
        </div>
      </div>

      <div className="hidden min-w-0 min-[900px]:block">
        <p className="m-0 mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Stipend</p>
        <p className="m-0 font-fraunces text-[17px] font-semibold">
          {listing.stipend ? `₹${listing.stipend.toLocaleString()} / mo` : 'Unpaid'}
        </p>
      </div>

      <div className="hidden min-w-0 min-[900px]:block">
        <p className="m-0 mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">About</p>
        <p className="m-0 line-clamp-2 text-[13.5px] text-muted-foreground">{listing.description}</p>
      </div>

      {listing.stipend != null && (
        <div className="col-span-2 flex items-center gap-2.5 min-[900px]:hidden">
          <span className="rounded-full bg-[#E7F1EB] px-2.5 py-1 font-fraunces text-[13px] font-semibold text-[#1C4736]">
            ₹{listing.stipend.toLocaleString()} / mo
          </span>
        </div>
      )}

      <div className="col-span-2 flex flex-wrap gap-2 min-[900px]:col-span-1 min-[900px]:flex-col min-[900px]:gap-2">
        <DetailsLink
          slug={listing.slug}
          className="hidden items-center justify-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-2 text-[12.5px] font-semibold transition-colors hover:bg-accent min-[900px]:flex"
        />
        <Button
          size="sm"
          variant={shortlisted ? 'default' : 'outline'}
          className="flex-none gap-1.5"
          onClick={() => toggle(listing.slug)}
        >
          {shortlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {shortlisted ? 'Shortlisted' : 'Shortlist'}
        </Button>
        <Button size="sm" variant="outline" className="flex-none" onClick={onQuiz}>
          Ask Expert Guide
        </Button>
      </div>

      <div className="col-span-2 border-t border-border pt-3.5 min-[900px]:col-span-full">
        <p className="m-0 mb-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Up next</p>
        {canApply ? (
          <a
            href={listing.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => !applied && markApplied(listing.slug)}
            className={cn('flex items-center gap-1 font-sans text-[16px] font-bold', applied ? 'text-[#1C4736]' : 'text-foreground')}
          >
            {applied ? (
              '✓ Applied'
            ) : (
              <>
                Apply <ChevronRight className="h-[17px] w-[17px]" />
              </>
            )}
          </a>
        ) : (
          <span className="text-[13px] text-muted-foreground">Application link unavailable</span>
        )}
      </div>
    </article>
  );
}
