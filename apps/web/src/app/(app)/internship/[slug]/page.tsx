'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, BookmarkCheck, Briefcase, CalendarClock, IndianRupee, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { isSafeHttpUrl } from '@/lib/utils';
import { OPPORTUNITY_TYPE_LABEL, useInternshipListing } from '@/hooks/use-internship-listings';
import { useInternshipListingShortlist } from '@/hooks/use-internship-listing-shortlist';
import { useInternshipListingApplied } from '@/hooks/use-internship-listing-applied';

export default function InternshipListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: listing, isLoading } = useInternshipListing(slug);
  const { isShortlisted, toggle } = useInternshipListingShortlist();
  const { isApplied, markApplied } = useInternshipListingApplied();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-[18px]" />
        <Skeleton className="h-24 w-full rounded-[18px]" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState icon={Briefcase} title="Opportunity not found" description="This opportunity may have been removed." />
      </div>
    );
  }

  const shortlisted = isShortlisted(listing.slug);
  const applied = isApplied(listing.slug);
  const canApply = isSafeHttpUrl(listing.applyUrl);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Opportunity details
      </button>

      <div className="rounded-[22px] border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E7F1EB] text-[#2B6A53]">
            <Briefcase className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-[22px] font-semibold leading-tight">{listing.title}</h1>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              {listing.company}
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {listing.isRemote ? 'Remote' : listing.location}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#E7F1EB] px-2.5 py-1 text-[11.5px] font-semibold text-[#1C4736]">
            {OPPORTUNITY_TYPE_LABEL[listing.type]}
          </span>
          <span className="rounded-full bg-[#EFEBDE] px-2.5 py-1 text-[11.5px] font-semibold text-muted-foreground">{listing.category}</span>
          <span className="rounded-full bg-[#EFEBDE] px-2.5 py-1 text-[11.5px] font-semibold text-muted-foreground">{listing.duration}</span>
        </div>
      </div>

      <div className="rounded-[22px] border border-border bg-card p-6">
        <h2 className="mb-2 font-display text-[17px] font-semibold">About</h2>
        <p className="whitespace-pre-line text-sm text-muted-foreground">{listing.description}</p>
      </div>

      <div className="rounded-[22px] border border-border bg-card p-6">
        <h2 className="mb-2 flex items-center gap-2 font-display text-[17px] font-semibold">
          <IndianRupee className="h-4 w-4" /> Compensation
        </h2>
        <p className="text-sm text-muted-foreground">
          {listing.stipend ? (
            <>
              <span className="font-semibold text-foreground">₹{listing.stipend.toLocaleString()}</span> / month
            </>
          ) : (
            'Unpaid'
          )}
        </p>
      </div>

      {listing.deadline && (
        <div className="rounded-[22px] border border-border bg-card p-6">
          <h2 className="mb-2 flex items-center gap-2 font-display text-[17px] font-semibold">
            <CalendarClock className="h-4 w-4" /> Deadline
          </h2>
          <p className="text-sm text-muted-foreground">
            Apply by{' '}
            <span className="font-semibold text-foreground">
              {new Date(listing.deadline).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </p>
        </div>
      )}

      <div className="flex gap-3">
        {canApply ? (
          <Button asChild className="flex-1" size="lg" disabled={applied} onClick={() => !applied && markApplied(listing.slug)}>
            <a href={listing.applyUrl} target="_blank" rel="noopener noreferrer">
              {applied ? '✓ Applied' : 'Apply Now'}
            </a>
          </Button>
        ) : (
          <Button className="flex-1" size="lg" disabled>
            Application link unavailable
          </Button>
        )}
        <Button variant="outline" size="lg" className="gap-1.5" onClick={() => toggle(listing.slug)}>
          {shortlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {shortlisted ? 'Shortlisted' : 'Shortlist'}
        </Button>
      </div>
    </div>
  );
}
