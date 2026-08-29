'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Fraunces, Poppins } from 'next/font/google';
import { AccountMenu } from '@/components/account-menu';
import styles from './page.module.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
});
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

const FIELDS = [
  'Software Developer / Engineer',
  'Full-Stack Developer',
  'Mobile App Developer',
  'SEO',
  'AI/ML',
  'Graphic/UI Design',
  'Data Analytics',
  'Automation',
  'Business Analytics',
  'HR Management',
  'Sales/Business Development',
  'Marketing',
  'Digital Analytics',
  'Digital Marketing',
  'Content Writing',
  'Content Creation',
  'Video Editing',
  'Journalism/Research',
  'Public Relations',
  'Community Management',
  'Campus Ambassador',
];

export default function InternshipLandingPage() {
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const findCtaHref = selectedField
    ? `/signup?field=${encodeURIComponent(selectedField)}`
    : '/signup';
  const findCtaLabel = selectedField ? `Find opportunities in ${selectedField}` : 'Find opportunities';

  return (
    <div className={`${styles.page} ${fraunces.variable} ${poppins.variable}`}>
      <header className={styles.header}>
        <div className={`${styles.wrap} ${styles.headerInner}`}>
          <button className={styles.hamburger} aria-label="Menu">
            <span />
            <span />
            <span />
          </button>

          <div className={styles.brand}>
            <Link href="/" className={styles.brandMark}>
              EB
            </Link>
          </div>

          <nav className={styles.navLinks}>
            <a href="#fields">Tracks</a>
            <a href="#">Mentors</a>
            <a href="#">Stories</a>
            <Link href="/colleges">For Colleges</Link>
          </nav>

          <div className={styles.headerActions}>
            <Link href="/signup" className={styles.btnSolidNav}>
              Start Your Journey
            </Link>
            <AccountMenu />
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={`${styles.blob} ${styles.blobA}`} />
        <div className={`${styles.blob} ${styles.blobB}`} />
        <div className={`${styles.wrap} ${styles.heroInner}`}>
          <div>
            <div className={styles.eyebrow}>Virtual Internship &middot; Open Career Program</div>
            <h1 className={styles.headline}>
              They Built Their
              <br />
              <em>Career.</em> You&rsquo;re Next.
            </h1>
            <p className={styles.heroSub}>
              Join the virtual internship, work on real projects, and build the career-ready portfolio they
              did &mdash; not just another certificate.
            </p>
            <Link href="/signup" className={styles.btnCta}>
              Start Your Journey
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <ul className={styles.trustRow}>
              <li className={styles.trustItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9s1.3-6.4 3.8-9z" />
                </svg>
                Virtual &amp; Pan India
              </li>
              <li className={styles.trustItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="13" rx="2" />
                  <path d="M8 21h8M12 18v3" />
                </svg>
                Real-World Projects
              </li>
              <li className={styles.trustItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l7 3v6c0 4.6-3 8.4-7 9-4-.6-7-4.4-7-9V6l7-3z" />
                  <path d="M9.5 12l1.8 1.8L15 10" />
                </svg>
                Verifiable Credentials
              </li>
            </ul>
          </div>

          <div className={styles.stack}>
            <div className={`${styles.card} ${styles.cardLeft}`}>
              <div className={styles.cardMedia}>
                <div className={styles.cardHeader}>
                  <span className={styles.tagPill}>
                    <svg viewBox="0 0 24 24">
                      <path d="M4 4h16v11H8l-4 4V4z" />
                    </svg>
                    Placed
                  </span>
                  <div className={styles.cardName}>Rohan</div>
                </div>
                <div className={styles.imgWrap}>
                  <Image
                    src="/internship-hero-left.jpg"
                    alt="Rohan, a student placed through EduBridge Network"
                    fill
                    sizes="220px"
                  />
                </div>
              </div>
              <div className={styles.trackPills}>
                <span className={styles.trackPill}>Product</span>
                <span className={`${styles.trackPill} ${styles.trackPillAlt}`}>Tech</span>
              </div>
            </div>

            <div className={`${styles.card} ${styles.cardRight}`}>
              <div className={styles.cardMedia}>
                <div className={styles.cardHeader}>
                  <span className={styles.tagPill}>
                    <svg viewBox="0 0 24 24">
                      <path d="M4 4h16v11H8l-4 4V4z" />
                    </svg>
                    Placed
                  </span>
                  <div className={styles.cardName}>Amara</div>
                </div>
                <div className={styles.imgWrap}>
                  <Image
                    src="/internship-hero-right.jpg"
                    alt="Amara, a student placed through EduBridge Network"
                    fill
                    sizes="220px"
                  />
                </div>
              </div>
              <div className={styles.trackPills}>
                <span className={styles.trackPill}>Marketing</span>
              </div>
            </div>

            <div className={`${styles.card} ${styles.cardCenter}`}>
              <div className={styles.cardMedia}>
                <div className={styles.imgWrap}>
                  <Image
                    src="/internship-hero-center.jpg"
                    alt="A student who found career opportunities through EduBridge Network"
                    fill
                    sizes="220px"
                    priority
                  />
                </div>
                <div className={styles.playChip}>
                  <svg viewBox="0 0 24 24">
                    <path d="M6 4l14 8-14 8V4z" />
                  </svg>
                </div>
                <div className={styles.captionPill}>EduBridge helped</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.findSection} id="fields">
        <div className={styles.wrap}>
          <div className={styles.searchCard}>
            <div className={styles.searchField}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Virtual Internship
            </div>
            <div className={styles.searchInput}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              Start searching...
            </div>
            <a href="#fields" className={styles.searchGo}>
              Search &raquo;
            </a>
          </div>

          <div className={styles.findHeader}>
            <div className={styles.findKicker}>EduBridge Network</div>
            <h2 className={styles.findTitle}>Start Your Career Journey</h2>
            <p className={styles.findSub}>
              Select a field that ensures you&rsquo;re matched with the right internship, mentor, and
              opportunity.
            </p>
          </div>

          <div className={styles.fieldGrid}>
            {FIELDS.map((field) => (
              <button
                key={field}
                type="button"
                className={`${styles.fieldPill} ${selectedField === field ? styles.fieldPillActive : ''}`}
                onClick={() => setSelectedField((prev) => (prev === field ? null : field))}
              >
                {field}
              </button>
            ))}
          </div>

          <div className={styles.findCtaRow}>
            <Link href={findCtaHref} className={styles.findCta}>
              {findCtaLabel}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <footer className={styles.siteFooter}>
        <div>EduBridge Open Career Program</div>
        <div>College discovery &rarr; career ecosystem</div>
      </footer>
    </div>
  );
}
