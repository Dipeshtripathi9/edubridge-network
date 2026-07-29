'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Award, Bookmark, BookmarkCheck, CalendarClock, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useScholarship } from '@/hooks/use-scholarships';
import { useScholarshipShortlist } from '@/hooks/use-scholarship-shortlist';
import { useMe } from '@/hooks/use-profile';
import { matchPercent } from '@/lib/scholarship-match';

function daysLeft(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export default function ScholarshipDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: scholarship, isLoading } = useScholarship(slug);
  const { data: me } = useMe();
  const { isShortlisted, toggle } = useScholarshipShortlist();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full rounded-[18px]" />
        <Skeleton className="h-24 w-full rounded-[18px]" />
      </div>
    );
  }

  if (!scholarship) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState icon={Award} title="Scholarship not found" description="This scholarship may have been removed." />
      </div>
    );
  }

  const left = daysLeft(scholarship.deadline);
  const pct = matchPercent(scholarship, me?.profile);
  const shortlisted = isShortlisted(scholarship.slug);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button type="button" onClick={() => router.back()} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Scholarship details
      </button>

      <div className="rounded-[22px] border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-marigold-soft text-amber-700">
            <IndianRupee className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-[22px] font-semibold leading-tight">{scholarship.title}</h1>
            <p className="text-sm text-muted-foreground">
              {scholarship.provider} · ₹{scholarship.amountPerYear.toLocaleString()} / year
              {scholarship.renewalYears ? ` · renewable for ${scholarship.renewalYears} years` : ''}
            </p>
          </div>
        </div>
        {pct != null && <p className="mt-3 text-sm font-bold text-green">{pct}% match for your profile</p>}
      </div>

      <div className="rounded-[22px] border border-border bg-card p-6">
        <h2 className="mb-2 font-display text-[17px] font-semibold">Eligibility</h2>
        <p className="text-sm text-muted-foreground">{scholarship.eligibilityText}</p>
      </div>

      <div className="rounded-[22px] border border-border bg-card p-6">
        <h2 className="mb-2 flex items-center gap-2 font-display text-[17px] font-semibold">
          <CalendarClock className="h-4 w-4" /> Deadline
        </h2>
        <p className="text-sm text-muted-foreground">
          Applications close{' '}
          <span className="font-semibold text-foreground">
            {new Date(scholarship.deadline).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          {left > 0 ? ` — ${left} days left` : ' — closed'}
        </p>
      </div>

      <div className="flex gap-3">
        <Button asChild className="flex-1" size="lg">
          <a href={scholarship.applyUrl} target="_blank" rel="noopener noreferrer">
            Apply Now
          </a>
        </Button>
        <Button variant="outline" size="lg" className="gap-1.5" onClick={() => toggle(scholarship.slug)}>
          {shortlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {shortlisted ? 'Shortlisted' : 'Shortlist'}
        </Button>
      </div>
    </div>
  );
}
