'use client';

import Link from 'next/link';
import { useQueries } from '@tanstack/react-query';
import { Columns3, X } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useCollegeShortlist } from '@/hooks/use-college-shortlist';
import { api } from '@/lib/api';
import type { College } from '@/hooks/use-colleges';
import { cn } from '@/lib/utils';

const ROWS: Array<{ key: keyof College; label: string; format: (c: College) => string; higherIsBetter: boolean }> = [
  { key: 'avgRating', label: 'Rating', format: (c) => `★ ${c.avgRating.toFixed(1)} (${c.reviewCount})`, higherIsBetter: true },
  { key: 'avgPlacementPackage', label: 'Avg. placement package', format: (c) => (c.avgPlacementPackage != null ? `₹${c.avgPlacementPackage.toFixed(1)} LPA` : '—'), higherIsBetter: true },
  { key: 'nirfRank', label: 'NIRF rank', format: (c) => (c.nirfRank != null ? `#${c.nirfRank}` : '—'), higherIsBetter: false },
  { key: 'city', label: 'Location', format: (c) => [c.city, c.state].filter(Boolean).join(', ') || '—', higherIsBetter: false },
];

function bestIndex(colleges: College[], row: (typeof ROWS)[number]) {
  const values = colleges.map((c) => (typeof c[row.key] === 'number' ? (c[row.key] as number) : null));
  if (values.every((v) => v == null)) return -1;
  const valid = values.map((v, i) => [v, i] as const).filter(([v]) => v != null) as Array<[number, number]>;
  if (!valid.length) return -1;
  return row.higherIsBetter
    ? valid.reduce((best, cur) => (cur[0] > best[0] ? cur : best))[1]
    : valid.reduce((best, cur) => (cur[0] < best[0] ? cur : best))[1];
}

export default function ComparePage() {
  const { slugs, toggle, mounted } = useCollegeShortlist();

  const results = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ['college', slug],
      queryFn: () => api.get<College>(`/colleges/${slug}`),
      enabled: mounted,
    })),
  });

  const colleges = results.map((r) => r.data).filter((c): c is College => !!c);
  const loading = mounted && results.some((r) => r.isLoading);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHero
        eyebrow="Compare side by side"
        title="Your shortlist,"
        accent="head to head."
        sub="Instant comparison using our platform data. Want fees, hostel & food verified by a real counselor instead? Try the Compare Colleges quiz."
      />

      {!mounted || loading ? (
        <Skeleton className="h-64 w-full" />
      ) : slugs.length === 0 ? (
        <EmptyState
          icon={Columns3}
          title="Nothing shortlisted yet"
          description="Shortlist a few colleges first, then come back to compare them side by side."
          action={<Button asChild><Link href="/colleges">Browse colleges</Link></Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[560px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="w-40 p-4 font-semibold text-muted-foreground">&nbsp;</th>
                {colleges.map((c) => (
                  <th key={c.id} className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/colleges/${c.slug}`} className="font-display font-extrabold hover:text-primary">
                        {c.name}
                      </Link>
                      <button
                        type="button"
                        aria-label={`Remove ${c.name}`}
                        onClick={() => toggle(c.slug)}
                        className="grid h-6 w-6 flex-none place-items-center rounded-full text-muted-foreground hover:bg-accent"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const best = bestIndex(colleges, row);
                return (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="p-4 font-semibold text-muted-foreground">{row.label}</td>
                    {colleges.map((c, i) => (
                      <td key={c.id} className={cn('p-4', i === best && 'font-bold text-primary')}>
                        {row.format(c)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
