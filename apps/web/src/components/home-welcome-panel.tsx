'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { HeroContent } from '@/components/home-illustrated';
import { useMe } from '@/hooks/use-profile';
import { useProfileProgress } from '@/stores/profile-progress.store';

function firstNameOf(full?: string | null) {
  return (full ?? 'Student').trim().split(/\s+/)[0];
}

// Signed-in top band on /home: a "Welcome back" card (always visible) paired
// with the same hero content shown to guests, but only from `lg:` up — on
// small screens only the welcome card shows, matching the reference layout.
export function HomeWelcomePanel({ onQuiz }: { onQuiz: () => void }) {
  const { data: me } = useMe();
  const profilePct = useProfileProgress((s) => s.pct);
  const profile = me?.profile;

  const subtitle = [profile?.course, profile?.branch, profile?.year ? `Year ${profile.year}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="flex shrink-0 items-center gap-4 rounded-[22px] border border-border bg-card p-6 shadow-sm lg:w-[320px]">
          <Avatar src={profile?.avatarUrl} name={profile?.fullName} className="h-14 w-14 shrink-0 text-lg" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[22px] font-semibold leading-tight">
              Welcome, {firstNameOf(profile?.fullName)}!
            </h2>
            {subtitle && <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>}
            <div className="mt-3 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-accent">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-marigold transition-[width] duration-700 ease-out"
                  style={{ width: `${profilePct}%` }}
                />
              </div>
              <span className="text-[11px] font-bold tabular-nums text-muted-foreground">{profilePct}%</span>
            </div>
            <Link href="/onboarding" className="mt-2 inline-block text-sm font-semibold text-primary hover:underline">
              Finish your profile →
            </Link>
          </div>
        </div>

        <div className="hidden overflow-hidden rounded-[22px] border border-border bg-background lg:block lg:flex-1">
          <HeroContent onQuiz={onQuiz} />
        </div>
      </section>

      {/* Mobile-only nudge: prompts profile completion before/alongside
          recommendations. Nothing renders once the profile is 100% complete. */}
      {profilePct < 100 && (
        <div className="flex items-center justify-between gap-4 rounded-[18px] bg-foreground px-5 py-4 text-background lg:hidden">
          <p className="text-sm font-semibold">Complete your profile for better recommendations</p>
          <Link href="/onboarding" className="shrink-0 text-sm font-bold underline">
            Complete profile →
          </Link>
        </div>
      )}
    </div>
  );
}
