'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { useMe } from '@/hooks/use-profile';
import { useProfileProgress } from '@/stores/profile-progress.store';
import { firstNameOf } from '@/lib/format-name';

const QUICK_ACTIONS = [
  { label: 'Career Quiz', icon: '/poster-quiz.jpg' },
  { label: 'Compare Colleges', icon: '/poster-compare.jpg', href: '/colleges/recommended' },
  { label: 'Scholarships', icon: '/poster-scholarship.jpg', href: '/scholarships' },
  { label: 'Internships', icon: '/poster-internship.jpg', href: '/internship' },
  { label: 'Reviews', icon: '/poster-expert-guide.jpg', href: '/reviews' },
] as const;

// Signed-in top band on /home. Pixel-matched to the requested reference
// design (Fraunces display font, forest/lavender/cream palette, single
// 860px breakpoint that reveals the quick-actions row) via styled-jsx, so
// the exact CSS/media queries survive intact rather than being
// re-derived through Tailwind's breakpoint scale.
export function HomeWelcomePanel({ onQuiz }: { onQuiz: () => void }) {
  const { data: me } = useMe();
  const profilePct = useProfileProgress((s) => s.pct);
  const profile = me?.profile;

  return (
    <div className="banner">
      <div className="welcome-block">
        <Avatar src={profile?.avatarUrl} name={profile?.fullName} className="avatar" />
        <div className="welcome-text">
          <h2>Welcome, {firstNameOf(profile?.fullName)}!</h2>
          <div className="progress-row">
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${profilePct}%` }} />
            </div>
            <span className="progress-label">
              Your profile is <b>{profilePct}%</b> complete
            </span>
          </div>
          <Link href="/onboarding" className="finish-link">
            Finish your profile ›
          </Link>
        </div>
      </div>

      <div className="divider" />

      <div className="quick-actions">
        {QUICK_ACTIONS.map(({ label, icon, ...action }) => {
          const content = (
            <>
              <div className="icon-circle">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon} alt="" />
              </div>
              <span>{label}</span>
            </>
          );
          return 'href' in action ? (
            <Link key={label} href={action.href} className="action-item">
              {content}
            </Link>
          ) : (
            <button key={label} type="button" onClick={onQuiz} className="action-item">
              {content}
            </button>
          );
        })}
      </div>

      <style jsx>{`
        .banner {
          --forest: #1c4736;
          --forest-light: #d9d0bb;
          --lavender: #eae6f7;
          --cream-icon-bg: #f3e4c4;
          --link: #3d3aa8;
          --line: #ece7d8;
          --ink: #182333;
          --ink-soft: #6b7280;
          background: hsl(var(--card));
          border-radius: 24px;
          box-shadow: 0 1px 2px rgba(24, 35, 51, 0.04), 0 10px 28px rgba(24, 35, 51, 0.06);
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          padding: 22px;
          gap: 28px;
        }
        .welcome-block {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1 1 auto;
          min-width: 0;
        }
        .welcome-block :global(.avatar) {
          width: 68px;
          height: 68px;
          border: 1.5px solid var(--forest-light);
          flex-shrink: 0;
        }
        .welcome-text {
          min-width: 0;
          flex: 1 1 auto;
        }
        .welcome-text h2 {
          font-family: var(--font-fraunces), serif;
          font-weight: 700;
          font-size: 22px;
          color: var(--forest);
          margin: 0 0 9px;
          line-height: 1.15;
        }
        .progress-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px 9px;
          margin-bottom: 7px;
        }
        .progress-track {
          width: 110px;
          max-width: 38vw;
          height: 6px;
          background: var(--forest-light);
          border-radius: 100px;
          overflow: hidden;
          flex-shrink: 0;
        }
        .progress-fill {
          height: 100%;
          background: var(--forest);
          border-radius: 100px;
          transition: width 0.7s ease;
        }
        .progress-label {
          font-size: 13px;
          color: var(--ink-soft);
        }
        .progress-label b {
          color: var(--ink);
          font-weight: 700;
        }
        .finish-link {
          font-size: 13px;
          font-weight: 600;
          color: var(--link);
          text-decoration: underline;
        }
        .divider {
          width: 1px;
          align-self: stretch;
          background: var(--line);
          flex-shrink: 0;
          display: none;
        }
        .quick-actions {
          display: none;
          align-items: flex-start;
          gap: 32px;
          flex-shrink: 1;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .quick-actions::-webkit-scrollbar {
          display: none;
        }
        :global(.action-item) {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 9px;
          background: none;
          border: none;
          cursor: pointer;
          flex-shrink: 0;
          text-decoration: none;
        }
        .icon-circle {
          width: 62px;
          height: 62px;
          border-radius: 50%;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
          flex-shrink: 0;
        }
        :global(.action-item:hover) .icon-circle {
          transform: translateY(-3px);
        }
        .icon-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        :global(.action-item span) {
          font-size: 12.5px;
          font-weight: 700;
          color: var(--ink);
          white-space: nowrap;
        }
        @media (min-width: 860px) {
          .welcome-block {
            flex: 0 0 auto;
          }
          .banner {
            padding: 26px 34px;
            gap: 44px;
          }
          .divider {
            display: block;
          }
          .quick-actions {
            display: flex;
          }
          .welcome-block :global(.avatar) {
            width: 80px;
            height: 80px;
          }
          .welcome-text h2 {
            font-size: 26px;
          }
          .progress-track {
            width: 150px;
          }
          .progress-label,
          .finish-link {
            font-size: 14px;
          }
        }
        @media (min-width: 860px) and (max-width: 1080px) {
          .quick-actions {
            gap: 22px;
          }
          .icon-circle {
            width: 54px;
            height: 54px;
          }
          :global(.action-item span) {
            font-size: 11.5px;
          }
        }
      `}</style>
    </div>
  );
}
