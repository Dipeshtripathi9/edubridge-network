'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Fraunces, IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import {
  ArrowLeft,
  Award,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock,
  FileText,
  GraduationCap,
  LineChart,
  Lock,
  MessageCircle,
  Share2,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { AccountMenu } from '@/components/account-menu';
import { Button } from '@/components/ui/button';
import { OpportunityRecommendationCard } from '@/components/opportunity-recommendation-card';
import { cn } from '@/lib/utils';
import { useInternshipListings } from '@/hooks/use-internship-listings';
import { useVirtualInternshipPricing, useVirtualInternshipTasks } from '@/hooks/use-virtual-internship';
import styles from './page.module.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-fraunces',
});
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
});

const HOW_STEPS = [
  { img: '/virtual-internship-step-enroll.png', title: 'Enroll' },
  { img: '/virtual-internship-step-build.png', title: 'Build' },
  { img: '/virtual-internship-step-certified.png', title: 'Get Certified' },
  { img: '/virtual-internship-step-referral.png', title: 'Job Referral' },
];

const MENTORS = [
  { initials: 'AT', name: 'Anurag Tripathi', info: 'JEE Adv. · RGIPT CSE · 2.5+ yrs' },
  { initials: 'T', name: 'Tanishq', info: 'JEE Adv. · MNIT Allahabad CSE · 2+ yrs' },
];
const SUPPORT_TEAM = [
  { initials: 'K', name: 'Kaushilya', info: 'B.Tech CSE · IIT (ISM) Dhanbad' },
  { initials: 'V', name: 'Vikram', info: 'B.Tech CSE · IIIT Guna' },
];

// Decorative week-accent rotation only — actual schedule content (title,
// objective, deliverable, steps, hours) is admin-editable, sourced live from
// the backend via useVirtualInternshipTasks() below.
const WEEK_ACCENTS = ['var(--mint-deep)', 'var(--green)', 'var(--orange)', 'var(--mint-deep)'];

interface ScheduleMonthData {
  num: number;
  title: string;
  sub: string;
  duration: string;
  focus: string;
  weeks: { accent: string; title: string; desc: string }[];
}

interface ScheduleWeekData {
  accent: string;
  duration: string;
  hours: string;
  title: string;
  desc: string;
}

// Static "compare-at" anchor prices for the savings note on each track's
// price row — a marketing decision (not derived from any backend field),
// unrelated to the real, GST-inclusive total shown as the current price.
const OLD_PRICE = { FOUR_WEEK: 4999, FOUR_MONTH: 12999 };

const LOCKED_REWARDS = [
  { title: 'Certificate', sub: 'Verified internship certificate' },
  { title: 'Letter of Recommendation', sub: 'Signed by your mentors' },
  { title: 'Referral community', sub: 'Access to job referrals' },
];

const FOUR_MONTH_FEATURES = [
  'Verified students only',
  '4-month guided track · mentor-reviewed',
  '1:1 mentorship throughout the track',
  'Letter of recommendation',
  'Virtual internship certificate',
  'Job referral, if a suitable match is found',
];

const FOUR_WEEK_FEATURES = [
  'Verified students only',
  '4-week guided track · mentor-reviewed',
  '1:1 mentorship throughout the track',
  'Letter of recommendation',
  'Virtual internship certificate',
];

const FAQS = [
  {
    q: 'Is this a paid course, or a real internship?',
    a: 'Both — the track fee (plus GST) covers structured mentorship, review, and certification (like a course), but the actual work is a real internship: you build and deploy real projects with a team, on the same track past students have used to land roles.',
  },
  {
    q: 'What happens if I miss a week?',
    a: 'Your mentor flags it during your monthly 1:1 and helps you catch up. Weekly progress updates exist specifically so drifting off track gets caught early instead of costing you a whole month.',
  },
  {
    q: 'Do I need prior coding/project experience?',
    a: "No. The track is guided, and if you don't have your own project idea, you're assigned one of the in-demand projects we already run — with a team and mentors around you the whole way.",
  },
  {
    q: 'Are the paid remote gigs guaranteed after I finish?',
    a: "They're open exclusively to early enrollees who complete the track — not guaranteed to every graduate, but you get the same shot at them everyone else in your cohort does.",
  },
];

function MentorAvatars({ people }: { people: { initials: string; name: string; info: string }[] }) {
  return (
    <div className={styles.mentorAvatars}>
      {people.map((p) => (
        <div key={p.name} className={styles.mentorChip}>
          <span className={styles.initials}>{p.initials}</span>
          <span className={styles.info}>
            <b>{p.name}</b>
            {p.info}
          </span>
        </div>
      ))}
    </div>
  );
}

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className={styles.schMeta}>
      <span className={styles.schMetaIcon}>
        <Icon className="h-3 w-3" />
      </span>
      <span className={styles.schMetaTextWrap}>
        <span className={styles.metaKey}>{label}</span>
        <span className={styles.metaVal}>{value}</span>
      </span>
    </div>
  );
}

function ScheduleMonth({
  month,
  open,
  onToggle,
}: {
  month: ScheduleMonthData;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles.monthBlock}>
      <button type="button" className={styles.monthHeading} onClick={onToggle}>
        <div className={styles.monthHeadingInner}>
          <span className={styles.monthNum}>M{month.num}</span>
          <div className={styles.monthHeadingText}>
            <h5>{month.title}</h5>
            <span>{month.sub}</span>
            <div className={styles.schMetaRow}>
              <MetaChip icon={Clock} label="Duration" value={month.duration} />
              <MetaChip icon={Target} label="Focus" value={month.focus} />
            </div>
          </div>
        </div>
        <span className={cn(styles.monthChev, open && styles.monthChevOpen)}>
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </button>
      <div className={cn(styles.weeksPanel, open && styles.weeksPanelOpen)}>
        <div className={styles.weeksInner}>
          {month.weeks.map((w) => (
            <div key={w.title} className={styles.weekRow} style={{ '--accent': w.accent } as React.CSSProperties}>
              <div className={styles.weekMain}>
                <h5>{w.title}</h5>
                <p>{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LockedRewards() {
  return (
    <div className={styles.lockedRow}>
      {LOCKED_REWARDS.map((item) => (
        <div key={item.title} className={styles.lockedItem}>
          <span className={styles.lockedIcon}>
            <Lock className="h-4 w-4" />
          </span>
          <span className={styles.lockedTxt}>
            <b>{item.title}</b>
            <span>{item.sub}</span>
          </span>
          <span className={styles.lockedAction}>Unlocks on completion</span>
        </div>
      ))}
    </div>
  );
}

function GigsSection() {
  const { data } = useInternshipListings({ category: 'Virtual Internship Gigs' });
  const listings = data?.pages.flatMap((p) => p.data) ?? [];

  if (listings.length === 0) return null;

  return (
    <section className={styles.gigsSection}>
      <div className={styles.wrap}>
        <div className={styles.gigsHead}>
          <h2>Paid remote gigs</h2>
          <p>
            Exclusive to students who enroll early in the Virtual Internship — a way to keep earning and building
            experience once your track is complete.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {listings.map((gig) => (
            <OpportunityRecommendationCard key={gig.id} listing={gig} />
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            className="gap-1.5 rounded-full border-[#1C4736] px-6 text-[#1C4736] hover:bg-[#E7F1EB] hover:text-[#1C4736]"
            asChild
          >
            <Link href="/opportunities">
              See more recommendations <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default function VirtualInternshipPage() {
  const [openTrack, setOpenTrack] = useState<'month' | 'week' | null>(null);
  const [openMonth, setOpenMonth] = useState<number | null>(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const { data: pricing } = useVirtualInternshipPricing();
  const { data: monthTaskList } = useVirtualInternshipTasks('FOUR_MONTH');
  const { data: weekTaskList } = useVirtualInternshipTasks('FOUR_WEEK');

  const monthSchedule = useMemo<ScheduleMonthData[]>(() => {
    if (!monthTaskList) return [];
    return [1, 2, 3, 4]
      .map((num) => {
        const tasks = monthTaskList.filter((t) => t.monthNum === num).sort((a, b) => a.weekNum - b.weekNum);
        if (!tasks.length) return null;
        return {
          num,
          title: `Month ${num}`,
          sub: tasks[0].monthDesc ?? '',
          duration: '1 month',
          focus: tasks[0].monthTitle ?? '',
          weeks: tasks.map((t, i) => ({
            accent: WEEK_ACCENTS[i % WEEK_ACCENTS.length],
            title: `Week ${t.weekNum} — ${t.title}`,
            desc: t.objective,
          })),
        };
      })
      .filter((m): m is ScheduleMonthData => m !== null);
  }, [monthTaskList]);

  const weekSchedule = useMemo<ScheduleWeekData[]>(() => {
    if (!weekTaskList) return [];
    return [...weekTaskList]
      .sort((a, b) => a.weekNum - b.weekNum)
      .map((t, i) => ({
        accent: WEEK_ACCENTS[i % WEEK_ACCENTS.length],
        duration: '1 week',
        hours: t.hours,
        title: `Week ${t.weekNum} — ${t.title}`,
        desc: t.objective,
      }));
  }, [weekTaskList]);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 480);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const enrollHref = useMemo(
    () => ({
      month: '/virtual-internship/enroll?track=FOUR_MONTH',
      week: '/virtual-internship/enroll?track=FOUR_WEEK',
    }),
    [],
  );

  const monthPricing = pricing?.find((p) => p.track === 'FOUR_MONTH');
  const weekPricing = pricing?.find((p) => p.track === 'FOUR_WEEK');
  const activePricing = openTrack === 'month' ? monthPricing : openTrack === 'week' ? weekPricing : undefined;
  const activeEnrollHref = openTrack === 'month' ? enrollHref.month : enrollHref.week;

  const showDetail = (track: 'month' | 'week') => {
    setOpenTrack(track);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const showLanding = () => {
    setOpenTrack(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const faqs = useMemo(() => {
    if (!weekPricing || !monthPricing) return FAQS;
    const list = [...FAQS];
    list[0] = {
      ...list[0],
      a: `Both — the fee (₹${weekPricing.totalAmount.toLocaleString()} for the 4-week track, ₹${monthPricing.totalAmount.toLocaleString()} for the 4-month track, GST included) covers structured mentorship, review, and certification (like a course), but the actual work is a real internship: you build and deploy real projects with a team, on the same track past students have used to land roles.`,
    };
    return list;
  }, [weekPricing, monthPricing]);

  return (
    <div className={`${styles.page} ${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
      <div className={cn(styles.stickyBar, showSticky && styles.stickyBarShow)}>
        <div className={styles.stickyBarInner}>
          <div className={styles.stickyBarTitle}>
            Virtual Internship
            {weekPricing && monthPricing && (
              <span>
                4-week ₹{weekPricing.totalAmount.toLocaleString()} · 4-month ₹
                {monthPricing.totalAmount.toLocaleString()}
              </span>
            )}
          </div>
          <Link href={enrollHref.week} className={cn(styles.btn)}>
            Join track
          </Link>
        </div>
      </div>

      <nav className={styles.nav}>
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight text-foreground">EduBridge Network</span>
            <span className="block text-xs font-semibold text-foreground">Open Career Program</span>
          </span>
        </Link>
        <div className={styles.navActions}>
          <AccountMenu />
        </div>
      </nav>

      {!openTrack && (
      <>
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <span className={styles.eyebrow}>Virtual Internship</span>
          <div className={styles.headlineRow}>
            <h1>Don&apos;t just apply. Earn the internship instead.</h1>
            <p className={styles.introCopy}>
              No applications to send, no companies to research. Pick a project we&apos;re already running, join the
              team, and start shipping — with mentors checking your work every step of the way.
            </p>
          </div>
        </section>

        <section className={styles.howSection}>
          <h2>How it works</h2>
          <div className={styles.howScroller}>
            <div className={styles.howGrid}>
              {HOW_STEPS.map((step) => (
                <div key={step.title} className={styles.howStep}>
                  <div className={styles.howStepImgWrap}>
                    <img src={step.img} alt={step.title} />
                  </div>
                  <h4>{step.title}</h4>
                </div>
              ))}
            </div>
            <div className={styles.howFade} aria-hidden />
          </div>
        </section>

        <section className={styles.trackSection}>
          <h2>Choose your track</h2>
          <div className={styles.trackCards}>
            {/* 4-Month */}
            <div className={styles.trackCard}>
              <div className={styles.trackTop}>
                <span className={styles.onlineBadge}>Online</span>
                <span className={styles.fastBadge}>New</span>
              </div>
              <h3>4-Month Track</h3>
              <p className={styles.tagline}>
                The full track — 3 minor projects and 1 major project, every month.
              </p>
              <div className={styles.featureList}>
                {FOUR_MONTH_FEATURES.map((f) => (
                  <div key={f} className={styles.featureRow}>
                    <Check className="h-3.5 w-3.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className={styles.priceBlock}>
                <span className={styles.now}>{monthPricing ? `₹${monthPricing.totalAmount.toLocaleString()}` : '···'}</span>
                <span className={styles.old}>₹{OLD_PRICE.FOUR_MONTH.toLocaleString()}</span>
              </div>
              {monthPricing && (
                <div className={styles.priceNote}>
                  Save ₹{(OLD_PRICE.FOUR_MONTH - monthPricing.totalAmount).toLocaleString()} · one-time payment
                </div>
              )}
              <span className={styles.discountTag}>
                ✓ Includes {monthPricing?.gstPercent ?? 18}% GST
              </span>
              <div className={styles.trackCardBtns}>
                <button type="button" className={cn(styles.btn, styles.btnGhost)} onClick={() => showDetail('month')}>
                  Explore
                </button>
                <button type="button" className={cn(styles.btn, styles.btnDark)} onClick={() => showDetail('month')}>
                  Join track
                </button>
              </div>
            </div>

            {/* 4-Week */}
            <div className={styles.trackCard}>
              <div className={styles.trackTop}>
                <span className={styles.onlineBadge}>Online</span>
                <span className={styles.fastBadge}>Fast track</span>
              </div>
              <h3>4-Week Track</h3>
              <p className={styles.tagline}>
                The fast-track version — same outcome, same certificate, a quarter of the time.
              </p>
              <div className={styles.featureList}>
                {FOUR_WEEK_FEATURES.map((f) => (
                  <div key={f} className={styles.featureRow}>
                    <Check className="h-3.5 w-3.5" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <div className={styles.priceBlock}>
                <span className={styles.now}>{weekPricing ? `₹${weekPricing.totalAmount.toLocaleString()}` : '···'}</span>
                <span className={styles.old}>₹{OLD_PRICE.FOUR_WEEK.toLocaleString()}</span>
              </div>
              {weekPricing && (
                <div className={styles.priceNote}>
                  Save ₹{(OLD_PRICE.FOUR_WEEK - weekPricing.totalAmount).toLocaleString()} · one-time payment
                </div>
              )}
              <span className={styles.discountTag}>
                ✓ Includes {weekPricing?.gstPercent ?? 18}% GST
              </span>
              <div className={styles.trackCardBtns}>
                <button type="button" className={cn(styles.btn, styles.btnGhost)} onClick={() => showDetail('week')}>
                  Explore
                </button>
                <button type="button" className={cn(styles.btn, styles.btnDark)} onClick={() => showDetail('week')}>
                  Join track
                </button>
              </div>
            </div>
          </div>

        </section>
      </div>

      <GigsSection />

      <div className={styles.wrap}>
        <section className={styles.faqSection}>
          <h2>Common questions</h2>
          {faqs.map((f, i) => (
            <div key={f.q} className={styles.faqItem}>
              <button
                type="button"
                className={styles.faqQ}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {f.q}
                <ChevronDown className={cn(styles.faqChev, openFaq === i && styles.faqChevOpen)} width={16} height={16} />
              </button>
              <div className={cn(styles.faqA, openFaq === i && styles.faqAOpen)}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
      </>
      )}

      {openTrack && (
        <>
          <div className={styles.detailHero}>
            <button type="button" className={styles.backBtn} onClick={showLanding}>
              <ArrowLeft className="h-4 w-4" /> Back to tracks
            </button>
            <div className={styles.detailHeroTitle}>
              <span className={styles.detailEyebrow}>
                {openTrack === 'month' ? 'Online · 4 months' : 'Online · 4 weeks'}
              </span>
              <h2>{openTrack === 'month' ? '4-Month Track' : '4-Week Track'}</h2>
            </div>
          </div>

          <div className={cn(styles.wrap, styles.detailBody)}>
            {openTrack === 'month' ? (
              <>
                <p className={styles.featureGroupLabel}>What you build</p>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <ClipboardCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>3 real minor projects and 1 major project, every month</h4>
                    <p>
                      Each month, you&apos;re assigned real-world projects we&apos;re already running — 3 minor
                      projects plus 1 major project, no idea-hunting required. Submit them across 4 weeks, each one
                      reviewed before you move to the next, so every month adds real, deployed work to your
                      portfolio — not just a certificate.
                    </p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <LineChart className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>Weekly progress updates</h4>
                    <p>
                      You report progress every week, so mentors can catch you drifting off track early — not after
                      you&apos;ve already lost a month.
                    </p>
                  </div>
                </div>

                <div className={styles.scheduleSection}>
                  <h4>Track Schedule</h4>
                  {monthSchedule.map((m) => (
                    <ScheduleMonth
                      key={m.num}
                      month={m}
                      open={openMonth === m.num}
                      onToggle={() => setOpenMonth(openMonth === m.num ? null : m.num)}
                    />
                  ))}
                </div>

                <p className={styles.featureGroupLabel}>Unlocked when you finish</p>
                <LockedRewards />

                <p className={styles.featureGroupLabel}>Who supports you</p>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>Designed by people who&apos;ve actually built this</h4>
                    <p>The curriculum is built by:</p>
                    <MentorAvatars people={MENTORS} />
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>Doubts solved on WhatsApp</h4>
                    <p>
                      Stuck on something? You&apos;re in direct touch with your doubt-support team, plus regular
                      check-ins with industry experts:
                    </p>
                    <MentorAvatars people={SUPPORT_TEAM} />
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <Users className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>Weekly live doubt-solving sessions</h4>
                    <p>
                      A live group session every week for the full 4 months — beyond the WhatsApp support, so
                      nothing you&apos;re stuck on waits until next month.
                    </p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <Users className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>Monthly 1:1 mentor call</h4>
                    <p>
                      One-on-one with your mentor at the end of every month to review your project, your progress,
                      and what to focus on next.
                    </p>
                  </div>
                </div>

                <p className={styles.featureGroupLabel}>What you get</p>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>Resume &amp; LinkedIn review</h4>
                    <p>
                      Your mentors personally review and rework your resume and LinkedIn once you&apos;re through
                      the track — built around the projects you actually shipped.
                    </p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <Award className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>Certificate + Letter of Recommendation</h4>
                    <p>
                      Finish all 4 projects and you get a verified internship certificate plus a signed LOR from
                      your mentors — not just a PDF, something you can actually use.
                    </p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <Share2 className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>Referral program included</h4>
                    <p>
                      Finish the track and get access to our referral program — a real head start when
                      you&apos;re applying for your next role.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className={styles.featureGroupLabel}>What you build</p>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <ClipboardCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>4 real major projects, 4 weeks</h4>
                    <p>
                      You&apos;ll be assigned a real-world project we&apos;re already running — no idea-hunting, no
                      scoping from scratch. Submit one minor project every week for 4 consecutive weeks, each one
                      reviewed before you move to the next, so you build a real portfolio, not just a certificate.
                    </p>
                  </div>
                </div>

                <div className={styles.scheduleSection}>
                  <h4>Track Schedule</h4>
                  <div className={styles.flatWeekList}>
                    {weekSchedule.map((w, i) => (
                      <div key={w.title} className={styles.schItem}>
                        <div className={styles.schItemTop}>
                          <span className={styles.schNum} style={{ background: w.accent }}>
                            {i + 1}
                          </span>
                          <h5>{w.title}</h5>
                        </div>
                        <div className={styles.schMetaRow}>
                          <MetaChip icon={Clock} label="Duration" value={w.duration} />
                          <MetaChip icon={Target} label="Effort" value={w.hours} />
                        </div>
                        <p className={styles.schDesc}>{w.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <p className={styles.featureGroupLabel}>Unlocked when you finish</p>
                <LockedRewards />

                <p className={styles.featureGroupLabel}>Who supports you</p>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>Track designed by IITians</h4>
                    <p>The curriculum is built by:</p>
                    <MentorAvatars people={MENTORS} />
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <MessageCircle className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>Doubts solved on WhatsApp</h4>
                    <p>
                      Stuck on something? You&apos;re in direct touch with your doubt-support team, plus regular
                      check-ins with industry experts:
                    </p>
                    <MentorAvatars people={SUPPORT_TEAM} />
                  </div>
                </div>

                <p className={styles.featureGroupLabel}>What you get</p>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <Award className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>Certificate + Letter of Recommendation</h4>
                    <p>
                      Finish all 4 projects and you get a verified internship certificate plus a signed LOR from
                      your mentors — not just a PDF, something you can actually use.
                    </p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>
                    <Share2 className="h-4 w-4" />
                  </span>
                  <div>
                    <h4>Referral program included</h4>
                    <p>
                      Finish the track and get access to our referral program — a real head start when
                      you&apos;re applying for your next role.
                    </p>
                  </div>
                </div>
              </>
            )}

            <div className={styles.detailCta}>
              <div>
                <div className={styles.priceBlock}>
                  <span className={styles.now}>
                    {activePricing ? `₹${activePricing.totalAmount.toLocaleString()}` : '···'}
                  </span>
                  <span className={styles.old}>
                    ₹{(openTrack === 'month' ? OLD_PRICE.FOUR_MONTH : OLD_PRICE.FOUR_WEEK).toLocaleString()}
                  </span>
                </div>
                {activePricing && (
                  <div className={styles.priceNote}>
                    Save ₹
                    {(
                      (openTrack === 'month' ? OLD_PRICE.FOUR_MONTH : OLD_PRICE.FOUR_WEEK) - activePricing.totalAmount
                    ).toLocaleString()}{' '}
                    · one-time payment
                  </div>
                )}
                <span className={styles.discountTag}>✓ Includes {activePricing?.gstPercent ?? 18}% GST</span>
              </div>
              <Link href={activeEnrollHref} className={cn(styles.btn, styles.btnDark)}>
                Join track
              </Link>
            </div>
          </div>
        </>
      )}

      <footer className={styles.siteFooter}>
        <div>EduBridge Open Career Program</div>
        <div>Virtual Internship — real projects, real mentors</div>
      </footer>
    </div>
  );
}
