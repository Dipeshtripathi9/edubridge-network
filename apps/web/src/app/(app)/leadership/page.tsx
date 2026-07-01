'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Crown,
  Gift,
  Megaphone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { uniqueById } from '@/lib/utils';
import { useCommunities, useManagedCommunities } from '@/hooks/use-communities';
import { useMe } from '@/hooks/use-profile';
import { useAuthStore } from '@/stores/auth.store';
import { ReferralsSection } from '@/components/perks';

const roleLabel = (r: string) => r.replace(/_/g, ' ').toLowerCase();

const typeLabel = (t: string) =>
  t === 'COLLEGE' ? 'College' : t === 'STARTUP' ? 'Startup' : 'Interests';

// Why lead — role value props.
const ROLE_PERKS = [
  {
    icon: Building2,
    title: 'Campus / University leaders',
    desc: 'Lead and manage the students of your own campus.',
  },
  {
    icon: Sparkles,
    title: 'Interest community leaders',
    desc: 'Manage every student of that interest — across all campuses.',
  },
  {
    icon: Rocket,
    title: 'Startup community heads',
    desc: 'Turn your idea into reality and grow your business.',
  },
];

// What every community head gets.
const BENEFITS = [
  {
    icon: Megaphone,
    title: '5 ad cards / week',
    desc: 'Post up to 5 advertisement cards per week in your community — monetize it at a personal level.',
  },
  {
    icon: Gift,
    title: 'Career boost',
    desc: 'Priority access to roles posted on EduBridge, plus guidance on networking your way to a referral — we help where we can.',
  },
  {
    icon: Rocket,
    title: 'Build your startup',
    desc: 'Want to start up? Get your preferred startup community — cross 600+ members and get 45% off website development from us.',
  },
];

function BecomeALeader() {
  const { data: me } = useMe();
  const { data, isLoading } = useCommunities();
  const myCollegeId = me?.profile?.college?.id;
  const verified = (me?.profile as { collegeVerification?: string })?.collegeVerification === 'VERIFIED';
  const all = uniqueById(data?.pages.flatMap((p) => p.data) ?? []);
  // Vacancies relevant to this student: their own college community + any
  // interest/startup community that's currently hiring leaders.
  const vacancies = all.filter(
    (c) => c.hiringOpen && (c.type !== 'COLLEGE' || c.college?.id === myCollegeId),
  );

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10">
        <CardContent className="space-y-1 p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Crown className="h-6 w-6 text-primary" /> Become a community leader
          </h2>
          <p className="text-sm text-muted-foreground">
            Lead a community on EduBridge Network — grow your network, your career, and even your business.
          </p>
        </CardContent>
      </Card>

      {!verified && (
        <Card className="border-amber-400/50 bg-amber-50 dark:bg-amber-500/10">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Verify you&apos;re a college student first</p>
              <p className="text-sm text-muted-foreground">
                Pick your college, then verify with your college email or by uploading your ID card / fee receipt —
                an admin reviews it. Only verified students can lead a community.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/verify">Verify now</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="mb-2 font-semibold">What you can lead</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {ROLE_PERKS.map((r) => (
            <Card key={r.title}>
              <CardContent className="space-y-1 p-4">
                <r.icon className="h-5 w-5 text-primary" />
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-semibold">Perks of being a head</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <Card key={b.title} className="border-primary/20">
              <CardContent className="space-y-1 p-4">
                <b.icon className="h-5 w-5 text-primary" />
                <p className="font-medium">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-semibold">Open positions for you</h3>
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : vacancies.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              No open leadership positions in your college or interest communities right now. Check back
              soon — admins open hiring when positions are available.
            </CardContent>
          </Card>
        ) : (
          <div className="grid items-stretch gap-3 sm:grid-cols-2">
            {vacancies.map((c) => (
              <Card key={c.id} className="h-full border-green-500/30 bg-green-500/5">
                <CardContent className="flex h-full flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate font-medium">{c.name}</p>
                    <Badge variant="secondary" className="shrink-0">
                      {typeLabel(c.type)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" /> {c.memberCount.toLocaleString()} members
                    </span>
                    <span className="rounded-full bg-green-500/15 px-2 py-0.5 font-medium text-green-600">
                      Hiring now
                    </span>
                  </div>
                  <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
                    {c.hiringNote || 'Open leadership position — apply to lead this community.'}
                  </p>
                  <Button asChild size="sm" className="mt-auto w-full">
                    <Link href={`/communities/${c.slug}`}>
                      View &amp; apply <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadershipPage() {
  const { data: managed, isLoading } = useManagedCommunities();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isLeader = (managed?.length ?? 0) > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShieldCheck className="h-6 w-6 text-primary" /> Leadership
        </h1>
        <p className="text-muted-foreground">
          {isLeader
            ? 'Communities you lead or moderate. Open one to manage members, activity, reports & analytics.'
            : 'Lead a community — see open positions and the perks of becoming a head.'}
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : isLeader ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
          {managed!.map((m) => (
            <Card key={m.community.id} className="transition-colors hover:border-primary/50">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{m.community.name}</p>
                  <Badge className="capitalize">{roleLabel(m.role)}</Badge>
                </div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" /> {m.community.memberCount.toLocaleString()} members ·{' '}
                  {typeLabel(m.community.type)}
                </p>
                <Button asChild size="sm" className="w-full">
                  <Link href={`/leadership/${m.community.slug}`}>
                    Manage <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
          </div>
          <ReferralsSection enabled isAdmin={isAdmin} />
        </>
      ) : isAdmin ? (
        <ReferralsSection enabled isAdmin />
      ) : (
        <BecomeALeader />
      )}
    </div>
  );
}
