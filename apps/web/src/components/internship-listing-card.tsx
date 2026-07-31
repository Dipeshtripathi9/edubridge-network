import type { ReactNode } from 'react';
import { MapPin } from 'lucide-react';
import type { InternshipListing } from '@/hooks/use-internship-listings';

export function InternshipListingCard({ listing, actions }: { listing: InternshipListing; actions: ReactNode }) {
  return (
    <article className="flex flex-col gap-3 rounded-[18px] border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-display text-[17px] font-semibold">
          {listing.title} <span className="font-normal text-muted-foreground">· {listing.company}</span>
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {listing.isRemote ? 'Remote' : listing.location}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-semibold text-muted-foreground">
          <span className="inline-flex items-center rounded-full bg-accent px-2.5 py-0.5 text-foreground">
            {listing.category}
          </span>
          <span>{listing.stipend ? `₹${listing.stipend.toLocaleString()}/mo` : 'Unpaid'}</span>
          <span>{listing.duration}</span>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">{actions}</div>
    </article>
  );
}
