'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, ChevronRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isSafeHttpUrl, cn } from '@/lib/utils';
import type { College } from '@/hooks/use-colleges';
import { useCollegeShortlist } from '@/hooks/use-college-shortlist';
import { useCollegeApplied } from '@/hooks/use-college-applied';

const RING_R = 34;
const RING_CIRC = 2 * Math.PI * RING_R;

// "Fit" is a placeholder derived from the real avgRating until a proper
// fit-scoring system exists — not a fabricated number, just a stand-in scale.
function FitRing({ rating }: { rating: number }) {
  const fitPct = Math.round(Math.max(0, Math.min(1, rating / 5)) * 100);
  const finalOffset = RING_CIRC - (fitPct / 100) * RING_CIRC;
  const [offset, setOffset] = useState(RING_CIRC);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setOffset(finalOffset));
    return () => cancelAnimationFrame(raf);
  }, [finalOffset]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-[76px] w-[76px]">
        <svg viewBox="0 0 76 76" className="-rotate-90">
          <circle cx="38" cy="38" r={RING_R} fill="none" stroke="#EFEBDE" strokeWidth="5" />
          <circle
            cx="38"
            cy="38"
            r={RING_R}
            fill="none"
            stroke="#2B6A53"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-fraunces text-[19px] font-semibold text-foreground">
          {fitPct}
          <sup className="ml-px text-[11px] font-medium">%</sup>
        </div>
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">Fit</div>
    </div>
  );
}

function ReviewLink({ slug, className }: { slug: string; className?: string }) {
  return (
    <Link href={`/colleges/${slug}`} className={className}>
      Review <ChevronRight className="h-3 w-3" />
    </Link>
  );
}

export function CollegeRecommendationCard({
  college,
  onQuiz,
}: {
  college: College;
  onQuiz: () => void;
}) {
  const { isShortlisted, toggle } = useCollegeShortlist();
  const shortlisted = isShortlisted(college.slug);
  const { isApplied, markApplied } = useCollegeApplied();
  const applied = isApplied(college.slug);

  return (
    <article className="grid grid-cols-[72px_1fr] gap-x-4 gap-y-3 rounded-[20px] border border-border bg-card p-[18px_18px_16px] shadow-[0_1px_2px_rgba(24,35,51,0.04),0_8px_24px_rgba(24,35,51,0.06)] min-[900px]:grid-cols-[84px_220px_1fr_1fr_1fr_140px] min-[900px]:items-center min-[900px]:gap-x-5 min-[900px]:p-[22px_26px]">
      <div className="row-span-3 flex flex-col items-center gap-1.5 pt-0.5 min-[900px]:row-auto">
        <FitRing rating={college.avgRating} />
      </div>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2.5">
          <h3 className="m-0 mb-[3px] min-w-0 flex-1 truncate font-fraunces text-[19px] font-semibold leading-tight tracking-tight">
            <Link href={`/colleges/${college.slug}`} className="hover:underline">
              {college.name}
            </Link>
          </h3>
          <ReviewLink
            slug={college.slug}
            className="mt-[3px] flex flex-none items-center gap-[3px] whitespace-nowrap rounded-full bg-[#E7F1EB] px-2.5 py-1 text-[12.5px] font-semibold text-[#1C4736] min-[900px]:hidden"
          />
        </div>
        {(college.city || college.state) && (
          <p className="m-0 mb-2.5 text-[13.5px] text-muted-foreground">
            {[college.city, college.state].filter(Boolean).join(', ')}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {college.type && (
            <span className="rounded-full bg-[#E7F1EB] px-2.5 py-1 text-[11.5px] font-semibold text-[#1C4736]">
              {college.type}
            </span>
          )}
          {college.nirfRank && (
            <span className="rounded-full bg-[#EFEBDE] px-2.5 py-1 text-[11.5px] font-semibold text-muted-foreground">
              NIRF #{college.nirfRank}
            </span>
          )}
          {college.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E4EFF6] px-2.5 py-1 text-[11.5px] font-semibold text-[#1E5A82]">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
          )}
        </div>
      </div>

      {/* These three columns are always present as grid items (even when
          empty) so the actions column stays pinned to the 6th slot on
          desktop — conditionally omitting a whole grid item here would
          shift every column after it via auto-placement. */}
      <div className="hidden min-w-0 min-[900px]:block">
        {college.accreditation && (
          <>
            <p className="m-0 mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">About</p>
            <p className="m-0 mb-1 text-[14.5px] font-semibold">{college.accreditation}</p>
            {college.website && isSafeHttpUrl(college.website) && (
              <a
                href={college.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12.5px] font-semibold text-[#2B6A53] hover:underline"
              >
                Know more →
              </a>
            )}
          </>
        )}
      </div>

      <div className="hidden min-w-0 min-[900px]:block">
        {(college.admissionPrimary || college.admissionSecondary) && (
          <>
            <p className="m-0 mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
              Admission criteria
            </p>
            {college.admissionPrimary && <p className="m-0 mb-1 text-[14.5px] font-semibold">{college.admissionPrimary}</p>}
            {college.admissionSecondary && <p className="m-0 text-[13px] text-muted-foreground">{college.admissionSecondary}</p>}
          </>
        )}
      </div>

      <div className="hidden min-w-0 min-[900px]:block">
        {college.tuitionFeePerYear && (
          <>
            <p className="m-0 mb-1.5 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
              Total tuition fee
            </p>
            <p className="m-0 mb-1 font-fraunces text-[17px] font-semibold">
              ₹{college.tuitionFeePerYear.toLocaleString()} / yr
            </p>
            {college.hasScholarship && (
              <p className="m-0 flex items-center gap-1 text-xs font-semibold text-[#A9761F]">🎓 Scholarship available</p>
            )}
          </>
        )}
      </div>

      {(college.tuitionFeePerYear || college.hasScholarship) && (
        <div className="col-span-2 flex items-center gap-2.5 min-[900px]:hidden">
          {college.tuitionFeePerYear && (
            <span className="rounded-full bg-[#E7F1EB] px-2.5 py-1 font-fraunces text-[13px] font-semibold text-[#1C4736]">
              ₹{college.tuitionFeePerYear.toLocaleString()} / yr
            </span>
          )}
          {college.hasScholarship && (
            <span className="text-[12px] font-semibold text-[#A9761F]">🎓 Scholarship</span>
          )}
        </div>
      )}

      <div className="col-span-2 flex flex-wrap gap-2 min-[900px]:col-span-1 min-[900px]:flex-col min-[900px]:gap-2">
        <ReviewLink
          slug={college.slug}
          className="hidden items-center justify-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-2 text-[12.5px] font-semibold transition-colors hover:bg-accent min-[900px]:flex"
        />
        <Button
          size="sm"
          variant={shortlisted ? 'default' : 'outline'}
          className="flex-none gap-1.5 min-[900px]:flex-none"
          onClick={() => toggle(college.slug)}
        >
          {shortlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {shortlisted ? 'Shortlisted' : 'Shortlist'}
        </Button>
        <Button size="sm" variant="outline" className="flex-none min-[900px]:flex-none" onClick={onQuiz}>
          Ask Expert Guide
        </Button>
      </div>

      <div className="col-span-2 border-t border-border pt-3.5 min-[900px]:col-span-full">
        <p className="m-0 mb-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">Up next</p>
        <button
          type="button"
          disabled={applied}
          onClick={() => markApplied(college.slug)}
          className={cn(
            'flex items-center gap-1 bg-transparent p-0 font-sans text-[16px] font-bold',
            applied ? 'cursor-default text-[#1C4736]' : 'cursor-pointer text-foreground',
          )}
        >
          {applied ? (
            '✓ Applied'
          ) : (
            <>
              Apply <ChevronRight className="h-[17px] w-[17px]" />
            </>
          )}
        </button>
      </div>
    </article>
  );
}
