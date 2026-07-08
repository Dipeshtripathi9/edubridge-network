'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Code2, Home, LayoutGrid, Plus, Rocket, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunityCard } from '@/components/community-card';
import { cn, uniqueById } from '@/lib/utils';
import { useCommunities } from '@/hooks/use-communities';

const TABS = [
  { label: 'All', type: undefined },
  { label: 'College / University', type: 'COLLEGE' },
  { label: 'Interests', type: 'TOPIC' },
  { label: 'Startup', type: 'STARTUP' },
];

const ARC = (
  <svg className="absolute -bottom-2 left-0 h-3 w-full text-marigold" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden>
    <path d="M4 16 C 80 2, 220 2, 296 16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
  </svg>
);

function StartupsSection() {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-10">
      <div className="mb-9 max-w-[640px]">
        <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[2.8px] text-primary">
          <span className="h-0.5 w-[22px] rounded-full bg-marigold" /> Startups
        </span>
        <h2 className="mt-4 font-display text-[clamp(24px,4vw,36px)] font-extrabold leading-[1.08] tracking-[-.024em]">
          Student-led startups <span className="text-primary">on the network.</span>
        </h2>
        <p className="mt-3 text-muted-foreground">Launch, join a team, or use their services — every startup here started as a post in Founders Hub.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Code2, flag: 'In-house studio', mint: false, title: '99x Developers', body: (<>Web design, development &amp; digital marketing — <b className="text-foreground">EduBridge&apos;s in-house studio</b> that builds every backed idea.</>), href: '/startups/99x-developers', cta: 'Visit' },
          { icon: Home, flag: 'Backed by EduBridge', mint: true, title: 'EZ-Rentbuddy', body: (<>Student housing — find <b className="text-foreground">PGs, hostels, flats &amp; rooms</b>, or earn cashback by sharing properties.</>), href: '/startups/ez-rentbuddy', cta: 'Visit' },
          { icon: Plus, flag: 'Your startup here?', mint: false, pitch: true, title: 'Pitch your idea', body: (<>Genuine ideas get built by 99x with a <b className="text-primary">30%+ student discount</b> — just like Zomato built District, we built EZ-Rentbuddy.</>), href: '/communities', cta: 'Pitch in Founders Hub' },
        ].map((s) => (
          <article key={s.title} className={cn('flex flex-col gap-3.5 rounded-3xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg', s.pitch ? 'border-dashed border-primary/40 bg-accent' : 'border-border bg-background')}>
            <div className="flex items-center justify-between gap-2.5">
              <span className={cn('grid h-12 w-12 flex-none place-items-center rounded-[15px]', s.pitch ? 'bg-card text-primary' : 'bg-accent text-primary')}>
                <s.icon className="h-[22px] w-[22px]" />
              </span>
              <span className={cn('rounded-full px-2.5 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[1.2px]', s.mint ? 'bg-green-soft text-green' : 'bg-accent text-primary')}>{s.flag}</span>
            </div>
            <h3 className="font-display text-xl font-bold tracking-tight">{s.title}</h3>
            <p className="flex-1 text-[14.5px] text-muted-foreground">{s.body}</p>
            <Button asChild variant={s.pitch ? 'default' : 'outline'} size="sm" className="self-start">
              <Link href={s.href}>{s.cta} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

function VerifyCTA() {
  return (
    <section className="relative overflow-hidden rounded-[30px] bg-primary p-8 text-white sm:p-12">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(44% 65% at 90% 0%, rgba(255,255,255,.16), transparent 60%), radial-gradient(38% 55% at 2% 100%, rgba(36,18,99,.5), transparent 62%)' }} />
      <div className="relative flex flex-wrap items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-[clamp(22px,3.6vw,32px)] font-extrabold leading-[1.12] tracking-[-.022em]">
            Can&apos;t find your college?<br /><span className="text-[#FFD98A]">Let&apos;s fix that.</span>
          </h2>
          <p className="mt-2 max-w-[440px] text-[15.5px] text-[#DCD5F7]">Get verified with your student ID to unlock every community — or request a new one for your campus.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-background text-foreground hover:bg-card"><Link href="/verify"><ShieldCheck className="h-4 w-4" /> Get verified</Link></Button>
          <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90"><Link href="/communities">Request a community</Link></Button>
        </div>
      </div>
    </section>
  );
}

function CommunitiesContent() {
  const params = useSearchParams();
  const initialType = ['COLLEGE', 'TOPIC', 'STARTUP'].includes(params.get('type') ?? '') ? params.get('type')! : undefined;
  const [type, setType] = useState<string | undefined>(initialType);
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useCommunities({ type, q: search || undefined });
  const communities = uniqueById(data?.pages.flatMap((p) => p.data) ?? []);
  const startupCount = communities.filter((c) => c.type === 'STARTUP').length;

  return (
    <div className="mx-auto max-w-6xl space-y-12 sm:space-y-16">
      {/* Hero */}
      <section className="relative pt-2">
        <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[2.8px] text-primary">
          <span className="h-0.5 w-[22px] rounded-full bg-marigold" /> Communities
        </span>
        <h1 className="mt-3 font-display text-[clamp(30px,5.4vw,48px)] font-extrabold leading-[1.06] tracking-[-.026em]">
          Find <span className="relative inline-block text-primary">your people.{ARC}</span>
        </h1>
        <p className="mt-3 max-w-[560px] text-[16.5px] text-muted-foreground">
          Connect with your college and the topics you love — verified students only. Post reviews, ask doubts, share opportunities, find co-founders.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-bold text-muted-foreground shadow-sm">
            <LayoutGrid className="h-[15px] w-[15px] text-primary" /> <b className="font-display text-foreground">{communities.length || '—'}</b> communities
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-bold text-muted-foreground shadow-sm">
            <ShieldCheck className="h-[15px] w-[15px] text-green" /> <b className="font-display text-foreground">200+</b> verified students
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-bold text-muted-foreground shadow-sm">
            <Rocket className="h-[15px] w-[15px] text-marigold" /> <b className="font-display text-foreground">{startupCount}</b> startups live
          </span>
        </div>
      </section>

      {/* Toolbar: search + tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="flex flex-1 items-center gap-2.5 rounded-full border border-border bg-card px-5 py-3 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-accent"
          onSubmit={(e) => { e.preventDefault(); setSearch(q); }}
        >
          <Search className="h-[18px] w-[18px] flex-none text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search communities…"
            aria-label="Search communities"
            className="w-full min-w-0 border-0 bg-transparent text-[15px] font-medium outline-none placeholder:text-muted-foreground"
          />
        </form>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <button
              key={t.label}
              onClick={() => setType(t.type)}
              className={cn(
                'flex-none rounded-full border px-4 py-2.5 text-[13.5px] font-bold transition-colors',
                type === t.type ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-muted-foreground hover:border-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-3xl" />)}
        </div>
      ) : communities.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary"><Search className="h-6 w-6" /></span>
          <b className="block font-display text-lg">No communities found</b>
          <span className="text-muted-foreground">Try a different word — or request a new community below.</span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {communities.map((c) => <CommunityCard key={c.id} community={c} />)}
          </div>
          {hasNextPage && (
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      )}

      <StartupsSection />
      <VerifyCTA />
    </div>
  );
}

export default function CommunitiesPage() {
  return (
    <Suspense fallback={null}>
      <CommunitiesContent />
    </Suspense>
  );
}
