'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, GraduationCap } from 'lucide-react';
import { Fraunces, IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import { AccountMenu } from '@/components/account-menu';
import { InternshipBrowseByField } from '@/components/internship-browse-by-field';
import { InternshipBlogTeaser } from '@/components/internship-blog-teaser';
import { OpportunityShortlistDemo } from '@/components/opportunity-shortlist-demo';
import styles from './page.module.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
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

const FAQS = [
  {
    q: 'Do I need to be a verified student to use this?',
    a: 'Yes — the Open Career Program is open only to verified students. Sign up and complete verification once, and you get access to every opportunity, track, and gig on the platform.',
  },
  {
    q: 'Is EduBridge Network free to use?',
    a: 'Signing up, building your profile, and browsing every opportunity is completely free. Only the optional Virtual Internship tracks and a few paid gigs have their own listed pricing.',
  },
  {
    q: "What's the difference between Opportunities and the Virtual Internship?",
    a: 'Opportunities are real internships, gigs, and projects from companies and startups that you apply to directly. The Virtual Internship is our own guided, mentor-reviewed track where you’re matched to a project and build it end-to-end.',
  },
  {
    q: 'How does the Career Path Test help me?',
    a: 'It’s a short quiz that maps your interests and skills to the career paths and opportunity categories most likely to be a fit, so your first search on the platform is already narrowed down.',
  },
];

export default function InternshipLandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add(styles.in);
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll(`.${styles.reveal}`).forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`${styles.page} ${fraunces.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable}`}>
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
        <div className={styles.links}>
          <a href="#opportunities">Opportunities</a>
          <Link href="/virtual-internship">Virtual Internship</Link>
          <Link href="/blog/write">Write Blog</Link>
        </div>
        <div className={styles.navActions}>
          <AccountMenu />
        </div>
      </nav>

      <section className={styles.hero}>
        <svg className={styles.heroCurve} viewBox="0 0 1440 90" preserveAspectRatio="none" style={{ height: 80 }} aria-hidden>
          <path d="M0,0 L1440,0 L1440,20 C1100,90 700,10 340,45 C160,62 60,30 0,55 Z" fill="var(--cream)" />
        </svg>
        <div className={styles.wrap} style={{ display: 'contents' }}>
          <div>
            <div className={styles.eyebrow}>Open only to verified students</div>
            <h1>
              One profile.
              <br />
              <em>Unlimited</em> opportunities.
            </h1>
            <p className={styles.sub}>
              Build your verified student profile once, and discover internships, part-time work, freelance gigs,
              blogging, startup projects and more — matched to where you are in your journey.
            </p>
            <div className={styles.ctaRow}>
              <Link className={styles.btn} href="/signup">
                Sign up for free
              </Link>
              <Link className={`${styles.btn} ${styles.ghostOnGreen}`} href="/career-path-test">
                Take the Career Path Test
              </Link>
            </div>
            <p className={styles.ctaNote} style={{ marginTop: '1.2rem' }}>
              <Link href="/virtual-internship" style={{ color: 'var(--orange)' }}>
                No experience? No problem — Join Virtual Internship and master in-demand skills →
              </Link>
            </p>
          </div>

          <div className={`${styles.demoFrameWrap} ${styles.reveal}`}>
            <OpportunityShortlistDemo />
          </div>
        </div>
        <div className={styles.heroStrip} />
      </section>

      <section className={styles.exploreSection}>
        <div className={styles.wrap}>
          <div className={`${styles.matchStat} ${styles.reveal}`}>
            <div className={styles.statCard}>
              <div className={styles.bigNum}>1,240</div>
              <div className={styles.statLabel}>live internships</div>
            </div>
            <div className={styles.matchCopy}>
              <h2>Find the right opportunity matching your skills and interests</h2>
              <p>
                We search across trusted companies, startups, and career platforms to find the best internships,
                part-time jobs, freelance gigs, startup projects, blogging opportunities, and more. We carefully
                shortlist and rank the most relevant opportunities based on your interests, career goals, and
                skills, helping you build your future faster.
              </p>
              <a className={styles.exploreLink} href="/opportunities?tab=all&category=Technology">
                &gt; Explore Opportunities
              </a>
            </div>
          </div>
        </div>
      </section>

      <InternshipBrowseByField />

      <InternshipBlogTeaser />

      <section className={`${styles.faqSection} ${styles.reveal}`}>
        <h2>Common questions</h2>
        {FAQS.map((f, i) => (
          <div key={f.q} className={styles.faqItem}>
            <button
              type="button"
              className={styles.faqQ}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              {f.q}
              <ChevronDown
                className={`${styles.faqChev} ${openFaq === i ? styles.faqChevOpen : ''}`}
                width={16}
                height={16}
              />
            </button>
            <div className={`${styles.faqA} ${openFaq === i ? styles.faqAOpen : ''}`}>
              <p>{f.a}</p>
            </div>
          </div>
        ))}
      </section>

      <footer className={styles.siteFooter}>
        <div>EduBridge Open Career Program</div>
        <div>College discovery → career ecosystem</div>
      </footer>
    </div>
  );
}
