'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Fraunces, Poppins } from 'next/font/google';
import { AccountMenu } from '@/components/account-menu';
import { BrandLockup } from '@/components/brand-lockup';
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

const TRACK_CARDS = [
  {
    label: 'Software Development',
    icon: (
      <>
        <path d="M8 9l-4 3 4 3" />
        <path d="M16 9l4 3-4 3" />
        <path d="M14 6l-4 12" />
      </>
    ),
  },
  {
    label: 'Marketing',
    icon: (
      <>
        <path d="M3 11l18-5v12L3 13v-2z" />
        <path d="M11.6 16.5l.9 3.5h-3l-.9-3" />
      </>
    ),
  },
  {
    label: 'Design (UI/UX)',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.2 2.4 3.5 5.6 3.5 9s-1.3 6.6-3.5 9c-2.2-2.4-3.5-5.6-3.5-9s1.3-6.6 3.5-9z" />
      </>
    ),
  },
  {
    label: 'Data Analytics',
    icon: (
      <>
        <path d="M4 20V10" />
        <path d="M12 20V4" />
        <path d="M20 20v-7" />
      </>
    ),
  },
  {
    label: 'HR Management',
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
        <circle cx="18" cy="9" r="2.3" />
        <path d="M16.2 14.8c1.9.5 3.3 2.2 3.3 4.2" />
      </>
    ),
  },
  {
    label: 'Business Development',
    icon: (
      <>
        <path d="M2 12l5-5 3 3 4-4 3 3 5-5" />
        <path d="M17 4h5v5" />
      </>
    ),
  },
  {
    label: 'Content Creation',
    icon: (
      <>
        <rect x="2" y="6" width="14" height="12" rx="1.5" />
        <path d="M16 10l6-3v10l-6-3z" />
      </>
    ),
  },
  {
    label: 'AI & Automation',
    icon: (
      <>
        <rect x="7" y="7" width="10" height="10" rx="1.5" />
        <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
      </>
    ),
  },
  {
    label: 'Campus Ambassador',
    icon: <path d="M4 21V4l14 6-14 6" />,
  },
];

export default function InternshipLandingPage() {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [openTrackIndex, setOpenTrackIndex] = useState<number | null>(null);
  const tracksTrackRef = useRef<HTMLDivElement>(null);

  const scrollTracks = (direction: 1 | -1) => {
    const el = tracksTrackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };

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
            <BrandLockup />
          </div>

          <nav className={styles.navLinks}>
            <a href="#fields">Tracks</a>
            <a href="#">Mentors</a>
            <a href="#">Stories</a>
            <Link href="/colleges">
              For Colleges
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </Link>
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
            <div className={styles.eyebrow}>
              Virtual Internship
              <br />
              Open Career Program
            </div>
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
                <span className={styles.trackPill}>Web Developer</span>
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

      <section className={styles.tracksSection}>
        <div className={styles.tracksBg} />
        <div className={styles.wrap}>
          <h2 className={styles.tracksTitle}>Expertise Across Tracks</h2>
          <p className={styles.tracksSub}>
            Our internships span 9+ career tracks, including software development, design, data
            analytics, marketing, and business.
          </p>
          <div className={styles.tracksTrack} ref={tracksTrackRef}>
            {TRACK_CARDS.map((track, index) => (
              <div key={track.label} className={styles.trackCard}>
                <div className={styles.trackPattern} />
                <div className={styles.trackIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {track.icon}
                  </svg>
                </div>
                <div className={styles.trackLabel}>{track.label}</div>
                <button
                  type="button"
                  className={`${styles.trackGo} ${openTrackIndex === index ? styles.trackGoOpen : ''}`}
                  aria-label={`Explore ${track.label}`}
                  onClick={() => setOpenTrackIndex((prev) => (prev === index ? null : index))}
                >
                  <span className={styles.trackGoLabel}>Know More</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className={styles.tracksNav}>
            <button
              type="button"
              className={styles.tracksArrow}
              aria-label="Previous tracks"
              onClick={() => scrollTracks(-1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.tracksArrow}
              aria-label="Next tracks"
              onClick={() => scrollTracks(1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <section className={styles.campDesktopSection}>
        <div className={styles.campDesktopGrid}>
          <div className={styles.campCopy}>
            <h2 className={styles.campHeading}>
              <span className={styles.campHeadingGold}>Become an EduBridge Network</span>
              <span className={styles.campHeadingDark}>Campus Ambassador</span>
            </h2>
            <p className={styles.campDesc}>
              Join the largest student ambassador community across colleges and universities. Gain
              real-world experience, leadership skills, and perks that&rsquo;ll make your resume shine.
            </p>
            <div className={styles.campBtnRow}>
              <button type="button" className={styles.campBtnOutline}>
                Know More
              </button>
              <Link href="/signup" className={styles.campBtn}>
                Sign Me Up
              </Link>
            </div>
          </div>
          <div className={styles.campPhotoWrap}>
            <Image
              src="/internship-campus-ambassador.jpg"
              alt="EduBridge Network Campus Ambassador"
              fill
              sizes="(max-width: 900px) 0px, 50vw"
              className={styles.campPhotoImg}
            />
          </div>
        </div>
      </section>

      <section className={styles.campMobileSection}>
        <div className={styles.campAvatar}>
          <Image src="/internship-campus-ambassador.jpg" alt="EduBridge Network Campus Ambassador" fill sizes="84px" />
        </div>
        <h2 className={styles.campMobileHeading}>
          <span className={styles.campHeadingLineMobile}>Become an EduBridge Network</span>
          <span className={styles.campHeadingGoldMobile}>Campus Ambassador</span>
        </h2>
        <p className={styles.campMobileDesc}>
          Join the largest student ambassador community across colleges and universities. Gain
          real-world experience, leadership skills, and perks that&rsquo;ll make your resume shine.
        </p>
        <Link href="/signup" className={styles.campMobileBtn}>
          Sign Me Up
        </Link>
      </section>

      <footer className={styles.siteFooter}>
        <div>EduBridge Open Career Program</div>
        <div>College discovery &rarr; career ecosystem</div>
      </footer>
    </div>
  );
}
