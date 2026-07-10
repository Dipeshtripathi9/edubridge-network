'use client';

import Link from 'next/link';
import { Award, BookOpen, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifiedBadge } from '@/components/verified-badge';
import { useMe } from '@/hooks/use-profile';
import { useAuthStore } from '@/stores/auth.store';

function Tile({ label, value }: { label: string; value?: string | number | null }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

export default function ProfilePage() {
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const { data: me, isLoading } = useMe();

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <b className="block font-display text-lg">Sign in to see your profile</b>
          <p className="mt-1 text-muted-foreground">Your verified status, interests and activity live here.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button asChild variant="outline"><Link href="/login">Sign in</Link></Button>
            <Button asChild><Link href="/signup">Sign up</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-28 w-full rounded-3xl" />
      </div>
    );
  }

  const p = me?.profile;
  const verified = p?.collegeVerification === 'VERIFIED';
  const badges = me?.userBadges ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Identity */}
      <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar src={p?.avatarUrl} name={p?.fullName} className="h-20 w-20 flex-none text-2xl" />
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-2 font-display text-2xl font-extrabold tracking-tight">
              {p?.fullName ?? 'Student'}
              {verified && <VerifiedBadge />}
            </h1>
            {p?.username && <p className="text-muted-foreground">@{p.username}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {p?.college?.name && (
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-primary" /> {p.college.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Award className="h-4 w-4 text-marigold" /> {me?.reputationPoints ?? 0} reputation
              </span>
            </div>
          </div>
        </div>
        {!verified && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-accent p-4">
            <p className="text-sm font-semibold text-primary">
              Get verified with your student ID to unlock every community.
            </p>
            <Button asChild size="sm"><Link href="/verify"><ShieldCheck className="h-4 w-4" /> Get verified</Link></Button>
          </div>
        )}
      </section>

      {/* Bio */}
      {p?.bio && (
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="mb-2 font-display text-lg font-bold">About</h2>
          <p className="whitespace-pre-line text-muted-foreground">{p.bio}</p>
        </section>
      )}

      {/* Academic + location */}
      <section className="rounded-3xl border border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
          <BookOpen className="h-5 w-5 text-primary" /> Academics
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Tile label="Course" value={p?.course} />
          <Tile label="Branch" value={p?.branch} />
          <Tile label="Year" value={p?.year} />
          <Tile label="CGPA" value={p?.cgpa} />
          <Tile label="Location" value={[p?.city, p?.state].filter(Boolean).join(', ') || null} />
        </div>
      </section>

      {/* Interests */}
      {p?.interests?.length ? (
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
            <Sparkles className="h-5 w-5 text-primary" /> Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {p.interests.map((i) => (
              <span key={i} className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-semibold text-muted-foreground">
                {i}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {/* Badges */}
      {badges.length > 0 && (
        <section className="rounded-3xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
            <Award className="h-5 w-5 text-marigold" /> Badges
          </h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-marigold-soft px-3.5 py-1.5 text-sm font-bold text-amber-600">
                <Award className="h-4 w-4" /> {b.badge.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center gap-3 pb-2">
        <Button asChild variant="outline"><Link href="/saved">Saved</Link></Button>
        <Button asChild variant="outline"><Link href="/opportunities?tab=recommended">For you</Link></Button>
      </div>
    </div>
  );
}
