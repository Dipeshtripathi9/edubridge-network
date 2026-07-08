'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  Gift,
  GraduationCap,
  LineChart,
  MessageCircle,
  Repeat,
  Rocket,
  Share2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { type Community, useJoinCommunity } from '@/hooks/use-communities';
import {
  cleanName,
  cn,
  seededCollegeMembers,
  seededInterestMembers,
  seededStartupMembers,
} from '@/lib/utils';

// Map a community to its brand-tinted icon + verified line.
function visual(c: Community): { Icon: typeof Rocket; tone: string; verified: string; label: string } {
  if (c.type === 'COLLEGE')
    return { Icon: GraduationCap, tone: 'bg-[hsl(252_30%_92%)] text-foreground', verified: 'Verified students only', label: 'College' };
  if (c.type === 'STARTUP')
    return { Icon: Rocket, tone: 'bg-accent text-primary', verified: 'Backed ideas get built by 99x', label: 'Startup' };
  const n = `${c.name} ${c.topic ?? ''}`.toLowerCase();
  if (n.includes('scholar') || n.includes('opportun'))
    return { Icon: Gift, tone: 'bg-marigold-soft text-amber-600', verified: 'New drops every week', label: c.topic ?? 'Scholarships' };
  if (n.includes('transfer'))
    return { Icon: Repeat, tone: 'bg-green-soft text-green', verified: 'Any verified student can join', label: c.topic ?? 'Transfers' };
  if (n.includes('research') || n.includes('innovat'))
    return { Icon: FlaskConical, tone: 'bg-green-soft text-green', verified: 'Any verified student can join', label: c.topic ?? 'Research' };
  if (n.includes('financ') || n.includes('quant') || n.includes('trad'))
    return { Icon: LineChart, tone: 'bg-marigold-soft text-amber-600', verified: 'Any verified student can join', label: c.topic ?? 'Interests' };
  return { Icon: MessageCircle, tone: 'bg-accent text-primary', verified: 'Any verified student can join', label: c.topic ?? 'Interest' };
}

export function CommunityCard({ community }: { community: Community }) {
  const join = useJoinCommunity(community.slug);
  const router = useRouter();
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const v = visual(community);

  const landingPage =
    community.slug === '99x-developers'
      ? '/startups/99x-developers'
      : community.slug === 'ez-rentbuddy'
        ? '/startups/ez-rentbuddy'
        : null;
  const isShowcase = !!landingPage;

  const href =
    landingPage ??
    (community.type === 'COLLEGE' && community.college?.slug
      ? `/colleges/${community.college.slug}`
      : `/communities/${community.slug}`);

  const members = (
    community.type === 'COLLEGE'
      ? Math.max(community.memberCount, seededCollegeMembers(community.id))
      : community.type === 'TOPIC'
        ? Math.max(community.memberCount, seededInterestMembers(community.id))
        : Math.max(community.memberCount, seededStartupMembers(community.id))
  ).toLocaleString();

  const onShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard
      ?.writeText(`${window.location.origin}${isShowcase ? landingPage : `/communities/${community.slug}`}`)
      .catch(() => {});
    toast.success(isShowcase ? 'Link copied to clipboard' : 'Community link copied to clipboard');
  };

  const onJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    join.mutate(!community.isMember, { onError: (err) => toast.error((err as Error).message) });
  };

  return (
    <Link href={href} className="block h-full">
      <article className="group flex h-full flex-col gap-3 rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-start gap-3.5">
          <span className={cn('grid h-12 w-12 flex-none place-items-center rounded-[15px]', v.tone)}>
            <v.Icon className="h-[22px] w-[22px]" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-[17.5px] font-bold tracking-tight">{cleanName(community.name)}</h3>
              <span className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10.5px] font-bold uppercase tracking-[1.1px] text-muted-foreground">
                {v.label}
              </span>
            </div>
            <span className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-green">
              <CheckCircle2 className="h-[13px] w-[13px]" /> {v.verified}
            </span>
          </div>
          <button
            aria-label="Share"
            onClick={onShare}
            className="grid h-[42px] w-[42px] flex-none place-items-center rounded-[13px] border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-accent hover:text-primary"
          >
            <Share2 className="h-[18px] w-[18px]" />
          </button>
        </div>

        {community.description && (
          <p className="line-clamp-2 flex-1 text-[14.5px] text-muted-foreground">{community.description}</p>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          {isShowcase ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">
              Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground">
              <Users className="h-[15px] w-[15px]" /> {members} members
            </span>
          )}
          {isShowcase ? (
            <span className="rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-foreground">Visit</span>
          ) : (
            <button
              onClick={onJoin}
              disabled={join.isPending}
              className={cn(
                'rounded-full px-5 py-2.5 text-sm font-bold transition-colors disabled:opacity-60',
                community.isMember
                  ? 'bg-green-soft text-green shadow-[inset_0_0_0_1.5px_hsl(var(--green)/.28)]'
                  : 'bg-primary text-primary-foreground shadow-[0_10px_24px_-12px_hsl(var(--primary)/.7)] hover:bg-primary/90',
              )}
            >
              {community.isMember ? 'Joined' : 'Join'}
            </button>
          )}
        </div>
      </article>
    </Link>
  );
}
