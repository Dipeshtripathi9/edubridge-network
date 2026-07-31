'use client';

import Link from 'next/link';
import { Briefcase, Building2, Compass, IndianRupee, Star } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useMe } from '@/hooks/use-profile';
import { useProfileProgress } from '@/stores/profile-progress.store';
import { firstNameOf } from '@/lib/format-name';

// Signed-in top band on /home: one unified card — welcome block + progress on
// the left, a row of quick-action shortcuts on the right (desktop only; on
// mobile just the welcome block shows, recommendations follow below it).
export function HomeWelcomePanel({ onQuiz }: { onQuiz: () => void }) {
  const { data: me } = useMe();
  const profilePct = useProfileProgress((s) => s.pct);
  const profile = me?.profile;

  const subtitle = [profile?.course, profile?.branch, profile?.year ? `Year ${profile.year}` : null]
    .filter(Boolean)
    .join(' · ');

  const quickActions = [
    { label: 'Career Quiz', icon: Compass, onClick: onQuiz },
    { label: 'Compare Colleges', icon: Building2, href: '/colleges/recommended' },
    { label: 'Scholarships', icon: IndianRupee, href: '/scholarships' },
    { label: 'Internships', icon: Briefcase, href: '/internship' },
    { label: 'Reviews', icon: Star, href: '/reviews' },
  ] as const;

  return (
    <div className="space-y-4">
      <section className="flex flex-col overflow-hidden rounded-[22px] border border-border bg-card shadow-sm lg:flex-row lg:items-stretch">
        <div className="flex items-center gap-4 p-6 lg:w-[320px] lg:shrink-0">
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

        <div className="hidden border-t border-border lg:flex lg:flex-1 lg:items-center lg:justify-around lg:gap-2 lg:border-l lg:border-t-0 lg:px-6">
          {quickActions.map(({ label, icon: Icon, ...action }) => {
            const content = (
              <>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-center text-xs font-semibold leading-tight text-muted-foreground">{label}</span>
              </>
            );
            return 'href' in action ? (
              <Link key={label} href={action.href} className="group flex flex-col items-center gap-2 py-4">
                {content}
              </Link>
            ) : (
              <button key={label} type="button" onClick={action.onClick} className="group flex flex-col items-center gap-2 py-4">
                {content}
              </button>
            );
          })}
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
