'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Fraunces, IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import {
  Award,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Code2,
  FileText,
  GraduationCap,
  LineChart,
  MessageCircle,
  Share2,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { AccountMenu } from '@/components/account-menu';
import { Button } from '@/components/ui/button';
import { OpportunityRecommendationCard } from '@/components/opportunity-recommendation-card';
import { cn } from '@/lib/utils';
import { useInternshipListings } from '@/hooks/use-internship-listings';
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
  {
    icon: UserPlus,
    tone: 'mint',
    title: 'Enroll',
    desc: 'Pick your track — 4-week or 4-month — and pay via UPI.',
  },
  {
    icon: Code2,
    tone: 'orange',
    title: 'Build',
    desc: 'Get matched to a team and start shipping real projects.',
  },
  {
    icon: Award,
    tone: 'mint',
    title: 'Get certified',
    desc: 'Finish all projects, get mentor sign-off, receive your certificate.',
  },
  {
    icon: Share2,
    tone: 'orange',
    title: 'Referral support',
    desc: 'Unlock referral access and paid remote gigs once you finish.',
  },
];

const MENTORS = [
  { initials: 'AT', name: 'Anurag Tripathi', info: 'JEE Adv. · RGIPT CSE · 2.5+ yrs' },
  { initials: 'T', name: 'Tanishq', info: 'JEE Adv. · MNIT Allahabad CSE · 2+ yrs' },
];
const SUPPORT_TEAM = [
  { initials: 'K', name: 'Kaushilya', info: 'B.Tech CSE · IIT (ISM) Dhanbad' },
  { initials: 'V', name: 'Vikram', info: 'B.Tech CSE · IIIT Guna' },
];

const MONTH_SCHEDULE = [
  {
    num: 1,
    title: 'Month 1',
    sub: 'Foundations + Project 1 — get matched to your team and ship your first minor project.',
    weeks: [
      { accent: 'var(--mint-deep)', title: 'Week 1 — Onboarding & team matching', desc: 'Get matched with your team and your project (your idea, or one we assign). Set up your repo and tools.' },
      { accent: 'var(--green)', title: 'Week 2 — Planning & architecture', desc: 'Scope the build, define milestones, and lock the architecture for Project 1.' },
      { accent: 'var(--orange)', title: 'Week 3 — Core build', desc: 'Build the core features of Project 1, with mentor check-ins along the way.' },
      { accent: 'var(--mint-deep)', title: 'Week 4 — Review & submit Project 1', desc: 'Finalize the project, get mentor review, and sign-off before moving to Month 2.' },
    ],
  },
  {
    num: 2,
    title: 'Month 2',
    sub: 'Project 2 — build in public, with weekly progress updates keeping you accountable.',
    weeks: [
      { accent: 'var(--green)', title: 'Week 1 — Kickoff Project 2', desc: 'New scope, new problem — apply what you learned from Project 1 from day one.' },
      { accent: 'var(--orange)', title: 'Week 2 — Feature development', desc: 'Build out the main functionality. Weekly progress update is due at the end of this week.' },
      { accent: 'var(--mint-deep)', title: 'Week 3 — Testing & iteration', desc: 'Fix bugs, refine based on mentor feedback, and tighten up rough edges.' },
      { accent: 'var(--green)', title: 'Week 4 — Review & submit Project 2', desc: 'Mentor review and sign-off before you move into the deployment-focused month.' },
    ],
  },
  {
    num: 3,
    title: 'Month 3',
    sub: 'Project 3 — deployment focus. This is where it goes live on a real server.',
    weeks: [
      { accent: 'var(--orange)', title: 'Week 1 — Kickoff Project 3', desc: "Scope a project that's specifically meant to go live — not just run on your laptop." },
      { accent: 'var(--mint-deep)', title: 'Week 2 — Build + deployment setup', desc: 'Develop the core features while setting up hosting/server infrastructure in parallel.' },
      { accent: 'var(--green)', title: 'Week 3 — Go live', desc: 'Deploy to a real live server and work through whatever production actually throws at you.' },
      { accent: 'var(--orange)', title: 'Week 4 — Review & submit Project 3', desc: 'Mentor review of the live deployment before moving into your final month.' },
    ],
  },
  {
    num: 4,
    title: 'Month 4',
    sub: 'Project 4 + wrap-up — final project, resume review, certificate & LOR.',
    weeks: [
      { accent: 'var(--mint-deep)', title: 'Week 1 — Kickoff Project 4', desc: 'Your final project of the track — the most ambitious one yet.' },
      { accent: 'var(--green)', title: 'Week 2 — Build & polish', desc: 'Core development plus real attention to UI/UX polish — this is the project people will actually see.' },
      { accent: 'var(--orange)', title: 'Week 3 — Resume & LinkedIn review', desc: 'Mentors personally rework your resume and LinkedIn around the 4 projects you actually shipped.' },
      { accent: 'var(--mint-deep)', title: 'Week 4 — Final review, certificate & LOR', desc: 'Submit your final project and receive your verified internship certificate plus a signed Letter of Recommendation.' },
    ],
  },
];

const WEEK_SCHEDULE = [
  { accent: 'var(--mint-deep)', title: 'Week 1 — Onboarding & team matching', desc: 'Get matched with your team and your project (your idea, or one we assign). Set up your repo and tools.' },
  { accent: 'var(--green)', title: 'Week 2 — Planning & architecture', desc: 'Scope the build, define milestones, and lock the architecture for your project.' },
  { accent: 'var(--orange)', title: 'Week 3 — Core build', desc: 'Build the core features of your project, with mentor check-ins along the way.' },
  { accent: 'var(--mint-deep)', title: 'Week 4 — Review, submit & certify', desc: 'Finalize the project, get mentor review, and receive your verified certificate + LOR.' },
];

const FAQS = [
  {
    q: 'Is this a paid course, or a real internship?',
    a: 'Both — the fee (₹2,790 for the 4-week track, ₹7,890 for the 4-month track) covers structured mentorship, review, and certification (like a course), but the actual work is a real internship: you build and deploy real projects with a team, on the same track past students have used to land roles.',
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

function ScheduleMonth({
  month,
  open,
  onToggle,
}: {
  month: (typeof MONTH_SCHEDULE)[number];
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

  return (
    <div className={`${styles.page} ${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
      <div className={cn(styles.stickyBar, showSticky && styles.stickyBarShow)}>
        <div className={styles.stickyBarInner}>
          <div className={styles.stickyBarTitle}>
            Virtual Internship
            <span>4-week ₹2,790 · 4-month ₹7,890</span>
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
          <div className={styles.howGrid}>
            {HOW_STEPS.map((step) => (
              <div key={step.title} className={styles.howStep}>
                <span className={cn(styles.howStepIcon, step.tone === 'orange' && styles.howStepIconOrange)}>
                  <step.icon className="h-5 w-5" />
                </span>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
                <ChevronRight className={styles.howArrow} width={20} height={20} />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.trackSection}>
          <h2>Choose your track</h2>
          <div className={styles.trackCards}>
            {/* 4-Month */}
            <div className={styles.trackCard}>
              <span className={styles.ribbonOnline}>Online</span>
              <div className={styles.trackCardHead}>
                <h3>4-Month Track</h3>
                <span className={styles.fastBadge}>New</span>
              </div>
              <p className={styles.tagline}>
                The full track — 4 real projects, deployed live, with mentors reviewing every month.
              </p>
              <div className={styles.metaRow}>
                <Users className="h-3.5 w-3.5" /> Verified students only
              </div>
              <div className={styles.metaRow}>
                <Calendar className="h-3.5 w-3.5" /> 4-month guided track · mentor-reviewed
              </div>
              <div className={styles.priceBlock}>
                <span className="now">₹7,890</span>
                <span className="was">₹12,999</span>
              </div>
              <span className={styles.discountTag}>✓ Save ₹5,109</span>
              <div className={styles.trackCardBtns}>
                <button
                  type="button"
                  className={cn(styles.btn, styles.btnGhost, openTrack === 'month' && styles.exploreOpen)}
                  onClick={() => setOpenTrack(openTrack === 'month' ? null : 'month')}
                >
                  {openTrack === 'month' ? 'Hide details' : 'Explore'}
                  <ChevronDown className={styles.exploreChev} width={12} height={12} />
                </button>
                <Link href={enrollHref.month} className={cn(styles.btn, styles.btnDark)}>
                  Join track
                </Link>
              </div>
            </div>

            {/* 4-Week */}
            <div className={styles.trackCard}>
              <span className={styles.ribbonOnline}>Online</span>
              <div className={styles.trackCardHead}>
                <h3>4-Week Track</h3>
                <span className={styles.fastBadge}>Fast track</span>
              </div>
              <p className={styles.tagline}>
                The fast-track version — same outcome, same certificate, in a quarter of the time.
              </p>
              <div className={styles.metaRow}>
                <Users className="h-3.5 w-3.5" /> Verified students only
              </div>
              <div className={styles.metaRow}>
                <Calendar className="h-3.5 w-3.5" /> 4-week guided track · mentor-reviewed
              </div>
              <div className={styles.priceBlock}>
                <span className="now">₹2,790</span>
                <span className="was">₹4,999</span>
              </div>
              <span className={styles.discountTag}>✓ Save ₹2,209</span>
              <div className={styles.trackCardBtns}>
                <button
                  type="button"
                  className={cn(styles.btn, styles.btnGhost, openTrack === 'week' && styles.exploreOpen)}
                  onClick={() => setOpenTrack(openTrack === 'week' ? null : 'week')}
                >
                  {openTrack === 'week' ? 'Hide details' : 'Explore'}
                  <ChevronDown className={styles.exploreChev} width={12} height={12} />
                </button>
                <Link href={enrollHref.week} className={cn(styles.btn, styles.btnDark)}>
                  Join track
                </Link>
              </div>
            </div>
          </div>

          {/* 4-Month details */}
          <div className={cn(styles.trackDetails, openTrack === 'month' && styles.trackDetailsOpen)}>
            <div className={styles.trackDetailsInner}>
              <p className={styles.featureGroupLabel}>What you build</p>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <ClipboardCheck className="h-4 w-4" />
                </span>
                <div>
                  <h4>4 real projects, 4 months</h4>
                  <p>
                    One minor project every month for 4 months — your own idea, or one of the most in-demand
                    projects currently used in the market if you don&apos;t have one. Built with a team, deployed on
                    a live server, and reviewed and signed off before you move to the next — so you leave with a
                    real portfolio, not just a certificate.
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
                    A live group session every week for the full 4 months — beyond the WhatsApp support, so nothing
                    you&apos;re stuck on waits until next month.
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
                    Your mentors personally review and rework your resume and LinkedIn once you&apos;re through the
                    track — built around the projects you actually shipped.
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
                    Finish all 4 projects and you get a verified internship certificate plus a signed LOR from your
                    mentors — not just a PDF, something you can actually use.
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
                    Finish the track and get access to our referral program — a real head start when you&apos;re
                    applying for your next role.
                  </p>
                </div>
              </div>

              <div className={styles.scheduleSection}>
                <h4>Track Schedule</h4>
                {MONTH_SCHEDULE.map((m) => (
                  <ScheduleMonth
                    key={m.num}
                    month={m}
                    open={openMonth === m.num}
                    onToggle={() => setOpenMonth(openMonth === m.num ? null : m.num)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 4-Week details */}
          <div className={cn(styles.trackDetails, openTrack === 'week' && styles.trackDetailsOpen)}>
            <div className={styles.trackDetailsInner}>
              <p className={styles.featureGroupLabel}>What you build</p>
              <div className={styles.feature}>
                <span className={styles.featureIcon}>
                  <ClipboardCheck className="h-4 w-4" />
                </span>
                <div>
                  <h4>4 real projects, 4 weeks</h4>
                  <p>
                    You&apos;ll be assigned a real-world project we&apos;re already running — no idea-hunting, no
                    scoping from scratch. Submit one minor project every week for 4 consecutive weeks, each one
                    reviewed before you move to the next, so you build a real portfolio, not just a certificate. The
                    fast-track version of the internship, for students who want the same outcome in a quarter of the
                    time.
                  </p>
                </div>
              </div>

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
                    Finish all 4 projects and you get a verified internship certificate plus a signed LOR from your
                    mentors — not just a PDF, something you can actually use.
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
                    Finish the track and get access to our referral program — a real head start when you&apos;re
                    applying for your next role.
                  </p>
                </div>
              </div>

              <div className={styles.scheduleSection}>
                <h4>Track Schedule</h4>
                <div className={styles.flatWeekList}>
                  {WEEK_SCHEDULE.map((w) => (
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
          </div>
        </section>
      </div>

      <GigsSection />

      <div className={styles.wrap}>
        <section className={styles.faqSection}>
          <h2>Common questions</h2>
          {FAQS.map((f, i) => (
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

        <div className={styles.finalCta}>
          <h2>Ready to stop applying and start building?</h2>
          <p>4 months. 4 real projects. One certificate that actually means something.</p>
          <div className={styles.finalCtaBtnRow}>
            <button
              type="button"
              className={cn(styles.btn, styles.btnGhostOnGreen)}
              onClick={() => setOpenTrack('month')}
            >
              Explore the track
            </button>
            <Link href={enrollHref.week} className={styles.btn}>
              Join from ₹2,790
            </Link>
          </div>
        </div>
      </div>

      <footer className={styles.siteFooter}>
        <div>EduBridge Open Career Program</div>
        <div>Virtual Internship — real projects, real mentors</div>
      </footer>
    </div>
  );
}
