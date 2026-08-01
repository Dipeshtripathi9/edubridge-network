'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/avatar';
import { useMe } from '@/hooks/use-profile';
import { useProfileProgress } from '@/stores/profile-progress.store';
import { firstNameOf } from '@/lib/format-name';

function QuizIcon() {
  return (
    <svg viewBox="0 0 40 40">
      <rect x="9" y="8" width="20" height="27" rx="3" fill="#FFFFFF" stroke="#3D2E7C" strokeWidth="1.6" />
      <rect x="14" y="4" width="10" height="7" rx="2" fill="#6C5DD3" />
      <text x="19" y="17" textAnchor="middle" fontFamily="Inter" fontSize="6" fontWeight="800" fill="#6C5DD3">
        QUIZ
      </text>
      <rect x="13" y="21" width="3" height="3" rx="0.7" fill="none" stroke="#3D2E7C" strokeWidth="1.3" />
      <line x1="18.5" y1="22.5" x2="26" y2="22.5" stroke="#3D2E7C" strokeWidth="1.3" />
      <rect x="13" y="27" width="3" height="3" rx="0.7" fill="none" stroke="#3D2E7C" strokeWidth="1.3" />
      <line x1="18.5" y1="28.5" x2="24" y2="28.5" stroke="#3D2E7C" strokeWidth="1.3" />
      <path d="M24 30l6 6M30 36l4-9" stroke="#6C5DD3" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg viewBox="0 0 40 40">
      <rect x="6" y="9" width="16" height="21" rx="2.5" fill="#FFFFFF" stroke="#7A5A17" strokeWidth="1.5" transform="rotate(-8 14 19)" />
      <rect x="17" y="6" width="16" height="21" rx="2.5" fill="#FFFFFF" stroke="#7A5A17" strokeWidth="1.5" />
      <path d="M22 12h9M22 15h6" stroke="#C9922C" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M22.5 22l2-3 2 2 3.5-4" stroke="#C9922C" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="27" cy="30" r="6.5" fill="#FBF6EC" stroke="#7A5A17" strokeWidth="1.6" />
      <circle cx="27" cy="30" r="2.6" fill="none" stroke="#7A5A17" strokeWidth="1.4" />
      <line x1="31.2" y1="34.2" x2="35" y2="38" stroke="#7A5A17" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function ScholarshipIcon() {
  return (
    <svg viewBox="0 0 40 40">
      <rect x="10" y="6" width="20" height="26" rx="2.5" fill="#FFFFFF" stroke="#7A5A17" strokeWidth="1.6" />
      <path d="M15 3l5 4 5-4v9l-5 3-5-3z" fill="#182333" />
      <text x="20" y="21" textAnchor="middle" fontFamily="Fraunces" fontSize="4.6" fontWeight="700" fill="#7A5A17">
        SCHOLARSHIP
      </text>
      <line x1="14" y1="24" x2="26" y2="24" stroke="#E4D4AC" strokeWidth="1.2" />
      <line x1="14" y1="27" x2="22" y2="27" stroke="#E4D4AC" strokeWidth="1.2" />
      <circle cx="29" cy="27" r="5.5" fill="#6C5DD3" />
      <text x="29" y="29.3" textAnchor="middle" fontFamily="Inter" fontSize="6.5" fontWeight="800" fill="#fff">
        i
      </text>
    </svg>
  );
}

function InternshipIcon() {
  return (
    <svg viewBox="0 0 40 40">
      <rect x="6" y="15" width="28" height="18" rx="3" fill="#182333" />
      <rect x="8.5" y="17.5" width="23" height="13" rx="1.5" fill="#FBF6EC" />
      <path d="M15 15v-3a3 3 0 013-3h4a3 3 0 013 3v3" fill="none" stroke="#182333" strokeWidth="2.2" />
      <rect x="6" y="22" width="28" height="4.5" fill="#182333" />
      <rect x="18" y="22.5" width="4" height="3.6" rx="0.8" fill="#FBF6EC" />
      <path d="M14.5 24.5l3 3.4 8-8" stroke="#7A5A17" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <svg viewBox="0 0 40 40">
      <rect x="7" y="7" width="26" height="26" rx="4" fill="#FFFFFF" stroke="#7A5A17" strokeWidth="1.6" />
      <path
        d="M20 12.5l2.6 5.4 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9z"
        fill="#E8A23D"
        stroke="#7A5A17"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const QUICK_ACTIONS = [
  { label: 'Career Quiz', icon: QuizIcon, bg: 'lavender' },
  { label: 'Compare Colleges', icon: CompareIcon, bg: 'cream', href: '/colleges/recommended' },
  { label: 'Scholarships', icon: ScholarshipIcon, bg: 'cream', href: '/scholarships' },
  { label: 'Internships', icon: InternshipIcon, bg: 'lavender', href: '/internship' },
  { label: 'Reviews', icon: ReviewIcon, bg: 'cream', href: '/reviews' },
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
        {QUICK_ACTIONS.map(({ label, icon: Icon, bg, ...action }) => {
          const content = (
            <>
              <div className={`icon-circle ${bg}`}>
                <Icon />
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
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
          flex-shrink: 0;
        }
        :global(.action-item:hover) .icon-circle {
          transform: translateY(-3px);
        }
        .icon-circle svg {
          width: 56%;
          height: 56%;
        }
        .icon-circle.lavender {
          background: var(--lavender);
        }
        .icon-circle.cream {
          background: var(--cream-icon-bg);
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
