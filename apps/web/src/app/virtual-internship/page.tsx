'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';
import {
  Award,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Loader2,
  MessageCircle,
  Share2,
  Target,
  X,
} from 'lucide-react';
import { AccountMenu } from '@/components/account-menu';
import { OpportunityRecommendationCard } from '@/components/opportunity-recommendation-card';
import { useInternshipListings } from '@/hooks/use-internship-listings';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { loadRazorpayScript, type RazorpayFailureResponse } from '@/lib/razorpay';
import { cn } from '@/lib/utils';
import styles from './page.module.css';

interface VirtualInternshipEnrollment {
  id: string;
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  track: 'WEEK' | 'MONTH';
  feeAmount: number;
}

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-fraunces',
});
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['600'],
  variable: '--font-jetbrains',
});

type TrackKey = 'month' | 'week';

interface TrackScheduleStep {
  t: string;
  d: string;
}

interface TrackData {
  online: string;
  badge: string;
  name: string;
  tagline: string;
  features: string[];
  priceNow: number;
  priceOld: number;
  hasReferral: boolean;
  detailEyebrow: string;
  buildTitle: string;
  buildCopy: string;
  certCopy: string;
  scheduleLabel: string;
  schedule: TrackScheduleStep[];
}

const TRACKS: Record<TrackKey, TrackData> = {
  month: {
    online: 'ONLINE',
    badge: 'New',
    name: 'Web Development + DevOps (4 Months)',
    tagline: 'The complete career track — 3 minor projects and 1 major project every month.',
    features: [
      'Verified students only',
      '4-month guided track · mentor-reviewed',
      '1:1 mentorship throughout the track',
      'Letter of recommendation',
      'Work presentation (PPT)',
      'Virtual internship certificate',
      '1:1 resume review',
    ],
    priceNow: 7634,
    priceOld: 12999,
    hasReferral: true,
    detailEyebrow: 'Online · 4 months',
    buildTitle: '3 minor projects + 1 major project, 4 months',
    buildCopy:
      "Every month you ship a minor project reviewed by your mentor, and once a month that work builds toward one major, portfolio-grade project taken all the way to production. It's the depth version — more time to get the engineering right, not just the outcome.",
    certCopy:
      "Finish the track and you get a verified internship certificate plus a signed LOR from your mentors — not just a PDF, something you can actually use.",
    scheduleLabel: 'Track schedule',
    schedule: [
      {
        t: 'Month 1 — Onboarding & first minor project',
        d: 'Get matched with your team and project. Set up your repo and tools, then ship your first minor project.',
      },
      {
        t: 'Month 2 — Second minor project',
        d: 'Scope, build, and ship your second minor project, with mentor check-ins along the way.',
      },
      {
        t: 'Month 3 — Third minor project',
        d: "Build the third minor project, sharpening the skills you'll need for the major build in month four.",
      },
      {
        t: 'Month 4 — Major project, review & certify',
        d: "Take everything you've built into one major project, get full mentor review, and receive your certificate + LOR.",
      },
    ],
  },
  week: {
    online: 'ONLINE',
    badge: 'Fast track',
    name: 'Web Development (4 week)',
    tagline: 'The complete beginner-to-industry track — complete 4 real-world, industry-specific projects.',
    features: [
      'Verified students only',
      '4-week guided track · mentor-reviewed',
      'Mentorship throughout the track',
      'Letter of recommendation',
      'Work presentation (PPT)',
      'Virtual internship certificate',
    ],
    priceNow: 2699,
    priceOld: 4999,
    hasReferral: false,
    detailEyebrow: 'Online · 4 weeks',
    buildTitle: '4 real projects, 4 weeks',
    buildCopy:
      "You'll be assigned a real-world project we're already running — no idea-hunting, no scoping from scratch. Submit one minor project every week for 4 consecutive weeks, each one reviewed before you move to the next, so you build a real portfolio, not just a certificate.",
    certCopy:
      "Finish all 4 projects and you get a verified internship certificate plus a signed LOR from your mentors — not just a PDF, something you can actually use.",
    scheduleLabel: 'Track schedule',
    schedule: [
      {
        t: 'Week 1 — Onboarding & team matching',
        d: 'Get matched with your team and your project (your idea, or one we assign). Set up your repo and tools.',
      },
      {
        t: 'Week 2 — Planning & architecture',
        d: 'Scope the build, define milestones, and lock the architecture for your project.',
      },
      {
        t: 'Week 3 — Core build',
        d: 'Build the core features of your project, with mentor check-ins along the way.',
      },
      {
        t: 'Week 4 — Review, submit & certify',
        d: 'Finalize the project, get mentor review, and receive your verified certificate + LOR.',
      },
    ],
  },
};

const HOW_STEPS = [
  { img: '/virtual-internship-step-enroll.jpg', title: 'Enroll' },
  { img: '/virtual-internship-step-build.jpg', title: 'Build' },
  { img: '/virtual-internship-step-certified.jpg', title: 'Get Certified' },
  { img: '/virtual-internship-step-referral.jpg', title: 'Job Referral' },
];

const MENTORS = [
  { initials: 'AT', name: 'Anurag Tripathi', info: 'JEE Adv. · RGIPT CSE · 2.5+ yrs' },
  { initials: 'T', name: 'Tanishq', info: 'JEE Adv. · MNNIT Allahabad CSE · 2+ yrs' },
];
const SUPPORT_TEAM = [
  { initials: 'K', name: 'Kaushilya', info: 'B.Tech CSE · IIT (ISM) Dhanbad' },
  { initials: 'V', name: 'Vikram', info: 'B.Tech CSE · IIIT Guna' },
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

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

/** Same as money(), but always shows paisa precision (e.g. ₹485.82) instead of rounding to a whole rupee. */
function moneyPrecise(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatInternshipDate(d: Date) {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function PersonRow({ people }: { people: { initials: string; name: string; info: string }[] }) {
  return (
    <div className={styles.peopleRow}>
      {people.map((p) => (
        <div key={p.name} className={styles.person}>
          <div className={styles.av}>{p.initials}</div>
          <div className={styles.personTxt}>
            <b>{p.name}</b>
            <span>{p.info}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function GigsSection() {
  const { data, isLoading } = useInternshipListings({ category: 'Virtual Internship Gigs' });
  const listings = data?.pages.flatMap((p) => p.data) ?? [];

  if (!isLoading && listings.length === 0) return null;

  return (
    <section className={styles.gigsSection}>
      <div className={styles.gigsSectionHead}>
        <h2>All opportunities</h2>
        <span className={styles.gigsMatchCount}>{listings.length} matches</span>
      </div>
      <div className={styles.gigsList}>
        {listings.slice(0, 4).map((listing) => (
          <OpportunityRecommendationCard key={listing.id} listing={listing} />
        ))}
      </div>
      {listings.length > 4 && (
        <div className={styles.moreGigsRow}>
          <Link href="/opportunities?tab=all&category=Virtual+Internship+Gigs" className={styles.btnMore}>
            See more recommendations <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}

export default function VirtualInternshipPage() {
  const router = useRouter();
  const [view, setView] = useState<'landing' | 'detail' | 'checkout'>('landing');
  const [currentTrackKey, setCurrentTrackKey] = useState<TrackKey>('month');
  const cameFromDetailRef = useRef(false);
  const [stickyVisible, setStickyVisible] = useState(false);

  const [referralApplied, setReferralApplied] = useState(false);
  const [donateChecked, setDonateChecked] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [confirmDates, setConfirmDates] = useState<{ start: string; end: string } | null>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const track = TRACKS[currentTrackKey];

  useEffect(() => {
    if (view !== 'landing') {
      setStickyVisible(false);
      return;
    }
    const onScroll = () => setStickyVisible(window.scrollY > 420);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [view]);

  const bill = useMemo(() => {
    // Paisa-precise GST — matches the backend's computeVirtualInternshipFee exactly,
    // rather than each rounding to a whole rupee independently and drifting apart.
    const roundToPaisa = (n: number) => Math.round(n * 100) / 100;
    const platformFeeOld = 49;
    const gst = roundToPaisa(track.priceNow * 0.18);
    const referralValue = 1999;
    const donateAmt = donateChecked ? 19 : 0;
    const toPay = roundToPaisa(track.priceNow + gst + donateAmt);
    const mrpSavings = track.priceOld - track.priceNow;
    const referralSavings = referralApplied ? referralValue : 0;
    const totalSavings = mrpSavings + platformFeeOld + referralSavings;
    return { platformFeeOld, gst, referralValue, donateAmt, toPay, mrpSavings, referralSavings, totalSavings };
  }, [track, referralApplied, donateChecked]);

  const showDetail = (key: TrackKey) => {
    setCurrentTrackKey(key);
    cameFromDetailRef.current = true;
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const showLanding = () => {
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const showCheckout = (key: TrackKey) => {
    setCurrentTrackKey(key);
    setReferralApplied(false);
    setDonateChecked(false);
    setView('checkout');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const backFromCheckout = () => {
    if (cameFromDetailRef.current) {
      setView('detail');
    } else {
      showLanding();
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const closePaymentModal = () => {
    setPaymentOpen(false);
    setConfirmDates(null);
  };

  const showConfirmation = () => {
    const start = new Date();
    const end = new Date(start);
    if (currentTrackKey === 'month') {
      end.setMonth(end.getMonth() + 4);
    } else {
      end.setDate(end.getDate() + 28);
    }
    setConfirmDates({ start: formatInternshipDate(start), end: formatInternshipDate(end) });
    setPaymentOpen(true);
  };

  const startPayment = async () => {
    if (!useAuthStore.getState().accessToken) {
      toast.error('Sign in to enroll');
      router.push('/login');
      return;
    }

    setIsProcessingPayment(true);
    try {
      let enrollment: VirtualInternshipEnrollment;
      try {
        // Idempotent server-side: reuses an existing same-track pending
        // enrollment as-is, or 409s if the pending one is for the OTHER
        // track — never silently substitutes the wrong course/amount here.
        enrollment = await api.post<VirtualInternshipEnrollment>('/internships/virtual/enroll', {
          track: currentTrackKey.toUpperCase(),
          referralApplied,
          donateApplied: donateChecked,
        });
      } catch (e) {
        if (e instanceof ApiError && e.status === 409) {
          toast.error(e.message);
          return;
        }
        throw e;
      }

      const [order, scriptReady] = await Promise.all([
        api.post<{ orderId: string; amount: number; currency: string; keyId: string }>(
          `/internships/virtual/enrollments/${enrollment.id}/checkout`,
        ),
        loadRazorpayScript(),
      ]);
      if (!scriptReady || !window.Razorpay) {
        toast.error('Could not load Razorpay checkout — check your connection and try again');
        return;
      }

      const user = useAuthStore.getState().user;
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'EduBridge Network',
        // Razorpay's Standard Checkout modal has no structured price-breakdown
        // UI — this description line is the only place inside their hosted
        // panel we can surface the GST split to the customer during payment.
        description: donateChecked
          ? `Base ${money(track.priceNow)} + GST ${moneyPrecise(bill.gst)} + Donation ${money(bill.donateAmt)} = ${moneyPrecise(bill.toPay)}`
          : `Base ${money(track.priceNow)} + GST ${moneyPrecise(bill.gst)} = ${moneyPrecise(bill.toPay)}`,
        prefill: { name: user?.profile?.fullName, email: user?.email ?? undefined },
        theme: { color: '#F2A31B' },
        handler: (response) => {
          api
            .post(`/internships/virtual/enrollments/${enrollment.id}/verify-payment`, response)
            .then(() => showConfirmation())
            .catch((e) => toast.error((e as Error).message));
        },
        modal: {
          ondismiss: () => toast('Payment cancelled — you can try again anytime'),
        },
      });
      rzp.on('payment.failed', (response: RazorpayFailureResponse) => {
        toast.error(response.error.description || 'Payment failed — please try again');
      });
      rzp.open();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const trackCard = (key: TrackKey, alt: boolean) => {
    const t = TRACKS[key];
    return (
      <div key={key} className={cn(styles.trackCard, alt && styles.trackCardAlt)}>
        <div>
          <div className={styles.trackTop}>
            <span className={styles.onlinePill}>{t.online}</span>
            <span className={styles.typePill}>{t.badge}</span>
          </div>
          <div className={styles.trackName}>{t.name}</div>
          <div className={styles.trackDesc}>{t.tagline}</div>
          <ul className={styles.trackFeatures}>
            {t.features.map((f) => (
              <li key={f} className={styles.tf}>
                <Check className="h-[15px] w-[15px]" strokeWidth={2.6} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className={styles.trackPriceRow}>
            <span className={styles.priceNow}>{money(t.priceNow)}</span>
            <span className={styles.priceOld}>{money(t.priceOld)}</span>
          </div>
          <p className={styles.priceSave}>
            Save {money(t.priceOld - t.priceNow)} · one-time payment
          </p>
          <div className={styles.trackActions}>
            <button type="button" className={cn(styles.btnTrack, styles.explore)} onClick={() => showDetail(key)}>
              Explore
            </button>
            <button type="button" className={cn(styles.btnTrack, styles.join)} onClick={() => showCheckout(key)}>
              Join track
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.page} ${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
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
        <AccountMenu />
      </nav>

      <div
        className={cn(styles.stickyBar, stickyVisible && styles.stickyBarVisible)}
        aria-hidden={!stickyVisible}
      >
        <div>
          <h3>Virtual Internship</h3>
          <p>
            4-week {money(TRACKS.week.priceNow)} · 4-month {money(TRACKS.month.priceNow)}
          </p>
        </div>
        <button type="button" className={styles.stickyJoinBtn} onClick={() => showDetail('month')}>
          Join track
        </button>
      </div>

      {view === 'landing' && (
        <>
          <div className={styles.hero}>
            <div className={styles.badgePill}>
              <span className={styles.dot} /> Virtual Internship
            </div>
            <h1>
              Don&apos;t just apply.
              <br />
              Earn the internship instead.
            </h1>
            <p>
              Skip the idea-hunting. Get matched to a real, running project, ship it with mentor review, and walk
              away with a certificate and a signed letter of recommendation.
            </p>
          </div>

          <section className={styles.howSection}>
            <h2>How it works</h2>
            <div className={styles.howGrid}>
              {HOW_STEPS.map((s) => (
                <div key={s.title} className={styles.howCard}>
                  <div className={styles.howImgWrap}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={s.img} alt={s.title} />
                  </div>
                  <h3>{s.title}</h3>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section} id="tracks">
            <h2 className={styles.sectionTitle}>Choose your track</h2>
            <div className={styles.tracksGrid}>
              {trackCard('week', false)}
              {trackCard('month', true)}
            </div>
          </section>

          <div className={styles.ctaStrip}>
            <a
              href="#tracks"
              className={styles.btnPillNav}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('tracks')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Virtual Internships
              <ChevronRight className="h-[17px] w-[17px]" />
            </a>
          </div>

          <GigsSection />

          <section className={styles.faqSection}>
            <h2>Common questions</h2>
            {FAQS.map((f, i) => (
              <div key={f.q} className={styles.faqItem}>
                <button type="button" className={styles.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {f.q}
                  <ChevronDown
                    className={cn(styles.faqChev, openFaq === i && styles.faqChevOpen)}
                    width={16}
                    height={16}
                  />
                </button>
                <div className={cn(styles.faqA, openFaq === i && styles.faqAOpen)}>
                  <p>{f.a}</p>
                </div>
              </div>
            ))}
          </section>

          <footer className={styles.footer}>
            <div>EduBridge Open Career Program</div>
            <div>Virtual Internship — real projects, real mentors</div>
          </footer>
        </>
      )}

      {view === 'detail' && (
        <div>
          <div className={styles.detailHero}>
            <button type="button" className={styles.backBtn} onClick={showLanding}>
              <ChevronLeft className="h-4 w-4" /> Back to tracks
            </button>
            <div className={styles.detailHeroTitle}>
              <span className={styles.eyebrow}>{track.detailEyebrow}</span>
              <h2>{track.name}</h2>
            </div>
          </div>

          <div className={styles.detailBody}>
            <div className={styles.dBlock}>
              <span className={styles.dEyebrow}>What you build</span>
              <div className={cn(styles.dItem, styles.dItemFirst)}>
                <div className={styles.dIcon}>
                  <ClipboardCheck className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </div>
                <div>
                  <h3>{track.buildTitle}</h3>
                  <p>{track.buildCopy}</p>
                </div>
              </div>
            </div>

            <div className={styles.dBlock}>
              <span className={styles.dEyebrow}>{track.scheduleLabel}</span>
              <div className={styles.scheduleList}>
                {track.schedule.map((s, i) => (
                  <div key={s.t} className={styles.schItem}>
                    <div className={styles.schNum}>{i + 1}</div>
                    <div>
                      <h4>{s.t}</h4>
                      <p>{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.dBlock}>
              <span className={styles.dEyebrow}>Who supports you</span>
              <div className={cn(styles.dItem, styles.dItemFirst)}>
                <div className={styles.dIcon}>
                  <Target className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </div>
                <div>
                  <h3>Track designed by IITians</h3>
                  <p>The curriculum is built by:</p>
                  <PersonRow people={MENTORS} />
                </div>
              </div>
              <div className={styles.dItem}>
                <div className={styles.dIcon}>
                  <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </div>
                <div>
                  <h3>Doubts solved on WhatsApp</h3>
                  <p>
                    Stuck on something? You&apos;re in direct touch with your doubt-support team, plus regular
                    check-ins with industry experts:
                  </p>
                  <PersonRow people={SUPPORT_TEAM} />
                </div>
              </div>
            </div>

            <div className={styles.dBlock}>
              <span className={styles.dEyebrow}>What you get</span>
              <div className={cn(styles.dItem, styles.dItemFirst)}>
                <div className={styles.dIcon}>
                  <Award className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </div>
                <div>
                  <h3>Certificate + Letter of Recommendation</h3>
                  <p>{track.certCopy}</p>
                </div>
              </div>
              {track.hasReferral && (
                <div className={styles.dItem}>
                  <div className={styles.dIcon}>
                    <Share2 className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3>Referral program included</h3>
                    <p>
                      Finish the track and get access to our referral program — a real head start when you&apos;re
                      applying for your next role.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.detailCta}>
              <div>
                <div className={styles.trackPriceRow}>
                  <span className={styles.priceNow}>{money(track.priceNow)}</span>
                  <span className={styles.priceOld}>{money(track.priceOld)}</span>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>
                  Save {money(track.priceOld - track.priceNow)} · one-time, GST included
                </div>
              </div>
              <button
                type="button"
                className={cn(styles.btnTrack, styles.join)}
                onClick={() => showCheckout(currentTrackKey)}
              >
                Join track — {money(track.priceNow)}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'checkout' && (
        <div>
          <div className={styles.coHeader}>
            <button type="button" className={styles.backBtn} onClick={backFromCheckout}>
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <div style={{ textAlign: 'right' }}>
              <div className={styles.coSub}>Checkout</div>
              <div className={styles.coTitle}>{track.name}</div>
            </div>
          </div>

          <div className={styles.coBody}>
            <div className={styles.coSavingsBanner}>
              <CheckCircle2 className="h-4 w-4" />
              <span>You&apos;re saving {money(bill.totalSavings)} on this plan</span>
            </div>

            <div className={styles.coCard}>
              <div className={styles.coCardTitle}>
                <span className={styles.ic}>🎟️</span>
                Coupons &amp; offers
              </div>

              <div className={styles.offerRow}>
                <div className={styles.offerLeft}>
                  <div className={cn(styles.offerIcon, styles.scholarshipIcon)}>
                    <GraduationCap className="h-[18px] w-[18px] text-white" strokeWidth={1.8} />
                  </div>
                  <div>
                    <div className={styles.offerTitle}>100% Scholarship</div>
                    <div className={cn(styles.offerSub, styles.offerSubLocked)}>
                      Open for the first 150 students only — applications closed for this cohort
                    </div>
                  </div>
                </div>
                <button type="button" className={styles.btnLocked} disabled>
                  Locked
                </button>
              </div>

              <div className={styles.offerRow}>
                <div className={styles.offerLeft}>
                  <div className={styles.offerIcon}>₹</div>
                  <div>
                    <div className={styles.offerTitle}>Get ₹1,999 job referral support (5 years) at ₹0</div>
                    <div className={styles.offerSub}>
                      Apply once to unlock long-term placement support at no extra cost
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={cn(styles.btnApply, referralApplied && styles.btnApplyApplied)}
                  onClick={() => setReferralApplied(true)}
                >
                  {referralApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
            </div>

            <div className={styles.coCard}>
              <div className={styles.coCardTitle}>
                <span className={styles.ic}>💼</span>
                What you&apos;re getting
              </div>
              <ul className={styles.planList}>
                {track.features.map((f) => (
                  <li key={f} className={styles.planItem}>
                    <span className={styles.planTick}>•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.coCard}>
              <div className={styles.coCardTitle}>
                <span className={styles.ic}>
                  <FileText className="h-[15px] w-[15px]" strokeWidth={1.8} />
                </span>
                Price Summary
              </div>
              <div className={styles.billRow}>
                <span>Course Price</span>
                <span>
                  <span className={styles.vOld}>{money(track.priceOld)}</span>
                  <span>{moneyPrecise(track.priceNow)}</span>
                </span>
              </div>
              <div className={styles.billRow}>
                <span>Platform Fee</span>
                <span>
                  <span className={styles.vOld}>{money(bill.platformFeeOld)}</span>
                  <span className={styles.vFree}>FREE</span>
                </span>
              </div>
              {referralApplied && (
                <div className={cn(styles.billRow, styles.referralRow)}>
                  <span>Job Referral Support (5 years)</span>
                  <span>
                    <span className={styles.vOld}>{money(bill.referralValue)}</span>
                    <span className={styles.vFree}>FREE</span>
                  </span>
                </div>
              )}
              <div className={styles.billRow}>
                <span>GST (18%)</span>
                <span>+ {moneyPrecise(bill.gst)}</span>
              </div>
              {donateChecked && (
                <div className={styles.billRow}>
                  <span>Donation for a student</span>
                  <span>+ {money(bill.donateAmt)}</span>
                </div>
              )}
              <div className={cn(styles.billRow, styles.billTotal)}>
                <span>Total Payable</span>
                <span>{moneyPrecise(bill.toPay)}</span>
              </div>
            </div>

            <div className={styles.coCard}>
              <div className={styles.savingsHead}>
                <div className={styles.coCardTitle} style={{ marginBottom: 0 }}>
                  <span className={styles.ic}>₹</span>
                  Savings on this plan
                </div>
                <span className={styles.savingsPill}>{money(bill.totalSavings)}</span>
              </div>
              <div className={styles.saveRow}>
                <span className={styles.labelRow}>
                  <span className={styles.saveRowIc}>%</span>Discount on MRP
                </span>
                <span className={styles.amt}>{money(bill.mrpSavings)}</span>
              </div>
              <div className={styles.saveRow}>
                <span className={styles.labelRow}>
                  <span className={styles.saveRowIc}>₹</span>Platform fee waived
                </span>
                <span className={styles.amt}>{money(bill.platformFeeOld)}</span>
              </div>
              <div className={cn(styles.saveRow, !referralApplied && styles.dim)}>
                <span className={styles.labelRow}>
                  <span className={styles.saveRowIc}>5y</span>5-Year Job Referral
                </span>
                <span className={styles.amt}>{money(bill.referralSavings)}</span>
              </div>
            </div>

            <div className={styles.donateRow}>
              <div className={styles.donateLeft}>
                <div
                  role="checkbox"
                  aria-checked={donateChecked}
                  tabIndex={0}
                  className={cn(styles.donateCheck, donateChecked && styles.donateCheckChecked)}
                  onClick={() => setDonateChecked((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setDonateChecked((v) => !v);
                  }}
                >
                  {donateChecked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </div>
                <div className={styles.donateText}>
                  <b>Add ₹19 to fund a scholarship seat</b>
                  <span>100% of this goes toward another student&apos;s internship fee</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.coBottombar}>
            <div>
              <div className={styles.coTopayK}>To Pay</div>
              <div className={styles.coTopayV}>{moneyPrecise(bill.toPay)}</div>
            </div>
            <button type="button" className={styles.btnPay} onClick={startPayment} disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" style={{ marginRight: 8 }} />
                  Opening checkout…
                </>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </div>
        </div>
      )}

      <div className={cn(styles.paymentModalOverlay, paymentOpen && styles.paymentModalOverlayOpen)}>
        <div className={styles.paymentModal}>
          <button type="button" className={styles.pmClose} aria-label="Close" onClick={closePaymentModal}>
            <X className="h-4 w-4" />
          </button>

          {confirmDates && (
            <div>
              <div className={styles.pmConfirmIcon}>
                <Check className="h-[26px] w-[26px] text-white" strokeWidth={2.6} />
              </div>
              <h3 className={styles.pmTitle}>You&apos;re in!</h3>
              <p className={styles.pmHint}>Your virtual internship runs from</p>
              <div className={styles.pmDates}>
                {confirmDates.start} <span className={styles.pmDatesArrow}>→</span> {confirmDates.end}
              </div>
              <p className={styles.pmHint} style={{ marginTop: 14 }}>
                It&apos;ll go live within 4 hours, once your payment is verified.
              </p>
              <button type="button" className={styles.btnPmDone} onClick={closePaymentModal}>
                Done
              </button>
              <div className={styles.pmHelpRow}>
                <a href="mailto:support@edubridge.com" className={styles.pmHelpLink}>
                  Need help?
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
