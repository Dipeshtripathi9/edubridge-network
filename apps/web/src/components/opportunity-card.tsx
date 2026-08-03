import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { isSafeHttpUrl } from '@/lib/utils';
import { OPPORTUNITY_TYPE_LABEL, type InternshipListing } from '@/hooks/use-internship-listings';

// Same rich card layout as ScholarshipCard/CollegeRecommendationCard, for
// visual consistency across the Open Career Program's opportunities list.
export function OpportunityCard({ listing, actions }: { listing: InternshipListing; actions: ReactNode }) {
  return (
    <article className="grid grid-cols-1 gap-y-3 rounded-[20px] border border-border bg-card p-[18px] shadow-[0_1px_2px_rgba(24,35,51,0.04),0_8px_24px_rgba(24,35,51,0.06)] min-[900px]:grid-cols-[1fr_1fr_1fr_168px] min-[900px]:items-center min-[900px]:gap-x-5 min-[900px]:p-[22px_26px]">
      <div className="min-w-0">
        <h3 className="m-0 mb-[3px] truncate font-fraunces text-[19px] font-semibold leading-tight tracking-tight">{listing.title}</h3>
        <p className="m-0 mb-2.5 text-[13.5px] text-muted-foreground">
          {listing.company} · {listing.isRemote ? 'Remote' : listing.location}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#E4EFF6] px-2.5 py-1 text-[11.5px] font-semibold text-[#1E5A82]">
            {OPPORTUNITY_TYPE_LABEL[listing.type]}
          </span>
          <span className="rounded-full bg-[#E7F1EB] px-2.5 py-1 text-[11.5px] font-semibold text-[#1C4736]">{listing.category}</span>
        </div>
      </div>

      <div className="hidden min-w-0 min-[900px]:block">
        <p className="m-0 mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Stipend</p>
        <p className="m-0 mb-1 font-fraunces text-[17px] font-semibold">
          {listing.stipend ? `₹${listing.stipend.toLocaleString()} / mo` : 'Unpaid'}
        </p>
        <p className="m-0 text-[13px] text-muted-foreground">{listing.duration}</p>
      </div>

      <div className="hidden min-w-0 min-[900px]:block">
        <p className="m-0 mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">About</p>
        <p className="m-0 line-clamp-2 text-[13.5px] text-muted-foreground">{listing.description}</p>
      </div>

      <div className="col-span-1 flex flex-wrap gap-2 min-[900px]:flex-col min-[900px]:gap-2">{actions}</div>

      {isSafeHttpUrl(listing.applyUrl) && (
        <div className="col-span-1 border-t border-border pt-3.5 min-[900px]:col-span-full">
          <p className="m-0 mb-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Up next</p>
          <a
            href={listing.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-sans text-[16px] font-bold text-foreground"
          >
            Apply <ChevronRight className="h-[17px] w-[17px]" />
          </a>
        </div>
      )}
    </article>
  );
}
