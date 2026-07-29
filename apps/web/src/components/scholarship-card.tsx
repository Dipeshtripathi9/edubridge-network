import type { ReactNode } from 'react';
import type { Scholarship } from '@/hooks/use-scholarships';

function daysLeft(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function MatchRing({ percent }: { percent: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg viewBox="0 0 44 44" className="h-11 w-11 shrink-0 -rotate-90">
      <circle cx="22" cy="22" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
      <circle
        cx="22"
        cy="22"
        r={r}
        fill="none"
        stroke="hsl(var(--green))"
        strokeWidth="4"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
      <text x="22" y="22" textAnchor="middle" dominantBaseline="central" className="rotate-90" style={{ transformOrigin: '22px 22px' }} fontSize="11" fontWeight="700" fill="hsl(var(--green))">
        {percent}%
      </text>
    </svg>
  );
}

// Real fields only, plus an honestly-computed match-% ring (see
// lib/scholarship-match.ts) that's simply omitted when nothing about the
// student's profile can be checked against this scholarship's criteria.
export function ScholarshipCard({
  scholarship,
  matchPct,
  actions,
}: {
  scholarship: Scholarship;
  matchPct: number | null;
  actions: ReactNode;
}) {
  const left = daysLeft(scholarship.deadline);

  return (
    <article className="flex flex-col gap-3 rounded-[18px] border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        {matchPct != null && <MatchRing percent={matchPct} />}
        <div className="min-w-0">
          <p className="font-display text-[17px] font-semibold">{scholarship.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {scholarship.provider} · ₹{scholarship.amountPerYear.toLocaleString()} / year
            {scholarship.renewalYears ? ` · renewable for ${scholarship.renewalYears} years` : ''}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-semibold">
            <span className="rounded-full bg-accent px-2.5 py-1 text-primary">{scholarship.category}</span>
            <span className={`rounded-full px-2.5 py-1 ${left <= 14 ? 'bg-marigold-soft text-amber-700' : 'bg-muted text-muted-foreground'}`}>
              {left > 0 ? `Due ${new Date(scholarship.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}` : 'Closed'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">{actions}</div>
    </article>
  );
}
