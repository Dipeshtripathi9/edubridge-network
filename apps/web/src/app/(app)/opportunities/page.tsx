'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  CheckCircle2,
  Code2,
  HeartPulse,
  Palette,
  Search as SearchIcon,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHero } from '@/components/page-hero';
import { OpportunityCard } from '@/components/opportunity-card';
import { InternshipBlogTeaser } from '@/components/internship-blog-teaser';
import { CollegeQuiz } from '@/components/college-quiz';
import { useInternshipListings, useInternshipListing, type InternshipListing } from '@/hooks/use-internship-listings';
import { useInternshipListingShortlist } from '@/hooks/use-internship-listing-shortlist';
import { useInternshipListingApplied } from '@/hooks/use-internship-listing-applied';
import { useMe } from '@/hooks/use-profile';
import { cn } from '@/lib/utils';

type Tab = 'all' | 'shortlist' | 'applied';

const CATEGORIES = [
  {
    key: 'Technology',
    icon: Code2,
    description:
      'Discover software development, AI, data science, cybersecurity, cloud, DevOps, UI/UX, and mobile development opportunities tailored to your technical skills.',
  },
  {
    key: 'Business',
    icon: TrendingUp,
    description:
      'Explore internships and projects in marketing, finance, HR, sales, operations, and business analytics to gain practical business experience.',
  },
  {
    key: 'Healthcare',
    icon: HeartPulse,
    description:
      'Build hands-on experience through clinical, laboratory, radiology, physiotherapy, pharmacy, and hospital administration opportunities.',
  },
  {
    key: 'Creative',
    icon: Palette,
    description:
      'Grow your creative portfolio with opportunities in graphic design, video editing, content writing, social media, branding, and digital media.',
  },
];

function OpportunityBySlug({ slug, actions }: { slug: string; actions: (l: InternshipListing) => React.ReactNode }) {
  const { data: listing, isLoading } = useInternshipListing(slug);
  if (isLoading) return <Skeleton className="h-28 w-full rounded-[20px]" />;
  if (!listing) return null;
  return <OpportunityCard listing={listing} actions={actions(listing)} />;
}

function useCardActions() {
  const { isShortlisted, toggle } = useInternshipListingShortlist();
  const { isApplied, markApplied } = useInternshipListingApplied();

  function renderActions(listing: InternshipListing) {
    const shortlisted = isShortlisted(listing.slug);
    const applied = isApplied(listing.slug);
    return (
      <>
        <Button size="sm" variant={shortlisted ? 'default' : 'outline'} className="gap-1.5" onClick={() => toggle(listing.slug)}>
          {shortlisted ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          {shortlisted ? 'Shortlisted' : 'Shortlist'}
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/internship/${listing.slug}`}>View details</Link>
        </Button>
        {!applied && (
          <Button size="sm" variant="ghost" onClick={() => markApplied(listing.slug)}>
            Mark applied
          </Button>
        )}
      </>
    );
  }

  return renderActions;
}

function AllTab({ category }: { category?: string }) {
  const [q, setQ] = useState('');
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInternshipListings({ category, q: q || undefined });
  const listings = data?.pages.flatMap((p) => p.data) ?? [];
  const cardActions = useCardActions();

  return (
    <div>
      <div className="relative mb-4">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search opportunities by name…" className="pl-9" />
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-28 w-full rounded-[20px]" />
          <Skeleton className="h-28 w-full rounded-[20px]" />
          <Skeleton className="h-28 w-full rounded-[20px]" />
        </div>
      )}

      {!isLoading && listings.length === 0 && (
        <EmptyState icon={Briefcase} title="No opportunities found" description="Check back soon — we're adding more opportunities." />
      )}

      {listings.length > 0 && (
        <div className="flex flex-col gap-3">
          {listings.map((l) => (
            <OpportunityCard key={l.id} listing={l} actions={cardActions(l)} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="mt-5 text-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

function ShortlistTab() {
  const { slugs } = useInternshipListingShortlist();
  const cardActions = useCardActions();

  if (slugs.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="Nothing shortlisted yet"
        description="Shortlist opportunities from the All Opportunities tab to keep track of them."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {slugs.map((slug) => (
        <OpportunityBySlug key={slug} slug={slug} actions={cardActions} />
      ))}
    </div>
  );
}

function AppliedTab() {
  const { slugs } = useInternshipListingApplied();
  const cardActions = useCardActions();

  if (slugs.length === 0) {
    return (
      <EmptyState icon={CheckCircle2} title="No applications yet" description="Once you apply to an opportunity, mark it applied and it'll show up here." />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {slugs.map((slug) => (
        <OpportunityBySlug key={slug} slug={slug} actions={cardActions} />
      ))}
    </div>
  );
}

function OpenCareerProgramInner() {
  const { data: me, isLoading: meLoading } = useMe();
  const params = useSearchParams();
  const router = useRouter();
  const [quizOpen, setQuizOpen] = useState(false);
  const initialTab = params.get('tab');
  const [tab, setTab] = useState<Tab>(initialTab === 'shortlist' || initialTab === 'applied' ? initialTab : 'all');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { slugs: shortlistSlugs } = useInternshipListingShortlist();
  const { slugs: appliedSlugs } = useInternshipListingApplied();

  const verified = me?.profile?.collegeVerification === 'VERIFIED';

  if (!meLoading && !verified) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <EmptyState
          icon={CheckCircle2}
          title="Open only to verified students"
          description="The Open Career Program is unlocked once your student profile is verified."
        />
        <Button className="mt-4" onClick={() => router.push('/verify')}>
          Get verified
        </Button>
      </div>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All Opportunities' },
    { key: 'shortlist', label: `Shortlist${shortlistSlugs.length > 0 ? ` (${shortlistSlugs.length})` : ''}` },
    { key: 'applied', label: `Applied${appliedSlugs.length > 0 ? ` (${appliedSlugs.length})` : ''}` },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <CollegeQuiz open={quizOpen} onClose={() => setQuizOpen(false)} />

      {/* Hero */}
      <section className="relative -mx-4 -mt-4 overflow-hidden rounded-b-[32px] bg-[hsl(var(--violet-deep))] px-6 py-14 text-primary-foreground sm:-mx-6 sm:mt-6 sm:rounded-[32px] sm:px-12">
        <span className="mb-4 inline-flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-[2.8px] text-amber-300">
          Open only to verified students
        </span>
        <h1 className="font-display text-[clamp(32px,5vw,52px)] font-extrabold leading-[1.05] tracking-tight">
          One profile.
          <br />
          <span className="text-amber-300">Unlimited</span>
          <br />
          opportunities.
        </h1>
        <p className="mt-5 max-w-md text-[16px] leading-relaxed text-primary-foreground/85">
          Build your verified student profile once, and discover internships, part-time work, freelance gigs,
          blogging, startup projects and more — matched to where you are in your journey.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button
            className="bg-amber-400 text-[#1B1633] hover:bg-amber-300"
            onClick={() => document.getElementById('opportunities-list')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Browse opportunities
          </Button>
          <Button variant="outline" className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setQuizOpen(true)}>
            Take the Career Path Test
          </Button>
        </div>
      </section>

      {/* Category cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {CATEGORIES.map(({ key, icon: Icon, description }) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setCategory(key);
              setTab('all');
              document.getElementById('opportunities-list')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={cn(
              'flex flex-col gap-2 rounded-[20px] border border-border bg-card p-5 text-left transition-colors hover:border-primary/40',
              category === key && 'border-primary bg-accent',
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <span className="font-display text-[17px] font-bold">{key}</span>
            <span className="text-[13.5px] leading-relaxed text-muted-foreground">{description}</span>
          </button>
        ))}
      </div>

      {/* From the community */}
      <div className="mt-10">
        <InternshipBlogTeaser />
      </div>

      {/* Opportunities list */}
      <div id="opportunities-list" className="mt-10 scroll-mt-20">
        <PageHero
          eyebrow="Recommended"
          title="Find opportunities that"
          accent="fit you."
          sub="Your shortlist, plus every opportunity matched to your profile."
          className="mb-6"
        />

        <div className="sticky top-16 z-20 -mx-4 mb-6 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6">
          <div className="flex gap-2 rounded-full border border-border bg-card p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  tab === t.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {category && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            Filtering by <span className="font-semibold text-foreground">{category}</span>
            <button type="button" className="underline" onClick={() => setCategory(undefined)}>
              Clear
            </button>
          </div>
        )}

        <div className="pb-10">
          {tab === 'all' && <AllTab category={category} />}
          {tab === 'shortlist' && <ShortlistTab />}
          {tab === 'applied' && <AppliedTab />}
        </div>
      </div>
    </div>
  );
}

export default function OpenCareerProgramPage() {
  return (
    <Suspense fallback={null}>
      <OpenCareerProgramInner />
    </Suspense>
  );
}
