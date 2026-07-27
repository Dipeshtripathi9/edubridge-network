'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap } from 'lucide-react';
import { Fraunces, IBM_Plex_Mono, Space_Grotesk } from 'next/font/google';
import { AccountMenu } from '@/components/account-menu';
import { OpportunityShortlistDemo } from '@/components/opportunity-shortlist-demo';
import { usePricing } from '@/hooks/use-internships';
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

const STEPS = [
  {
    num: '01',
    title: 'Create your profile',
    desc: 'Resume, skills, college, year, interests, portfolio, GitHub, LinkedIn, languages and availability — entered once.',
  },
  {
    num: '02',
    title: 'AI reads your profile',
    desc: 'Resume, skills and experience are analysed together to produce a single Career Score out of 100.',
  },
  {
    num: '03',
    title: 'Opportunities come to you',
    desc: 'Internships, part-time jobs, freelance work, blogging slots and campus roles are recommended automatically.',
  },
  {
    num: '04',
    title: 'Not ready? Get a path',
    desc: 'Short skill challenges unlock the exact internships you were missing — instead of a rejection.',
  },
];

const OPPORTUNITIES = [
  { tag: 'Paid', title: 'Internships', desc: 'Matched on skills, college and resume — not keyword search.' },
  { tag: 'Paid', title: 'Part-time jobs', desc: 'Campus executive, tutor, content writer, social media, sales, support.' },
  { tag: 'Paid', title: 'Freelancing', desc: 'Website builds, UI design, Python, video editing, marketing gigs.' },
  { tag: 'Grow reputation', title: 'Blogging', desc: 'College reviews, placement stories, scholarship guides, campus life.' },
  { tag: 'Grow reputation', title: 'Campus leader', desc: 'Community head, campus ambassador, moderator roles for trusted students.' },
  { tag: 'Build', title: 'Startup projects', desc: 'Live briefs from startups — React, design, marketing, content, Python.' },
  { tag: 'Build', title: 'Open source & research', desc: 'Contribute to real codebases and academic projects, credited on your profile.' },
  { tag: 'Compete', title: 'Hackathons & competitions', desc: 'Team up and get discovered through what you actually built.' },
  { tag: 'Belong', title: 'Clubs, mentorship & NGOs', desc: 'Student clubs, fellowships, mentorship and volunteering, all on one profile.' },
];

const CHECKLIST = [
  { label: 'HTML Challenge', done: true },
  { label: 'Communication Challenge', done: true },
  { label: 'Python Challenge', done: false },
  { label: 'Resume Improvement', done: false },
  { label: 'Portfolio Creation', done: false },
];

const BADGES = [
  { stars: '★★★★★', label: 'Verified React Developer' },
  { stars: '★★★★☆', label: 'Python Test — Passed' },
  { stars: '★★★★★', label: 'Communication — Verified' },
  { stars: '★★★★☆', label: 'SQL Test — Passed' },
  { stars: '★★★★★', label: 'Campus Content Lead' },
];

const BLOG_POSTS = [
  { k: 'Placements', title: 'What the 2026 placement season actually looked like' },
  { k: 'Hostels', title: "A first-year's honest hostel review" },
  { k: 'Scholarships', title: 'The scholarship guide nobody hands you at orientation' },
  { k: 'Campus life', title: 'Clubs worth joining in your first semester' },
  { k: 'Internships', title: 'How I landed my internship through EOCP' },
  { k: 'Exams', title: 'A realistic exam-prep timeline that worked' },
];

const COMPARE_ROWS = [
  { platform: 'LinkedIn', purpose: 'Networking' },
  { platform: 'Internshala', purpose: 'Internships' },
  { platform: 'Medium', purpose: 'Blogging' },
  { platform: 'Fiverr', purpose: 'Freelancing' },
  { platform: 'GitHub', purpose: 'Code' },
  { platform: 'Handshake', purpose: 'Campus recruiting' },
];

const FLOW_NODES = [
  'Discover',
  'Learn',
  'Build skills',
  'Get verified',
  'Join communities',
  'Write blogs',
  'Real projects',
  'Internships',
  'Earn money',
  'Build your career',
];

export default function InternshipLandingPage() {
  const { data: pricing } = usePricing();
  const guidedFee = pricing?.trackA.GUIDED_LEARNING.feeAmount ?? 2_999;
  const ownProjectFee = pricing?.trackA.OWN_PROJECT.feeAmount ?? 24_999;

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
          <Link href="/upskill-courses">Upskill Courses</Link>
          <a href="#blog">Write Blog</a>
          <a href="#different">Why EduBridge</a>
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
              <a className={styles.btn} href="#pricing">
                Sign up for free
              </a>
              <Link className={`${styles.btn} ${styles.ghostOnGreen}`} href="/career-path-test">
                Take the Career Path Test
              </Link>
            </div>
            <p className={styles.ctaNote} style={{ marginTop: '1.2rem' }}>
              <Link href="/upskill-courses" style={{ color: 'var(--orange)' }}>
                No experience? No problem — Join Upskill Courses and master in-demand skills →
              </Link>
            </p>
          </div>

          <div className={`${styles.demoFrameWrap} ${styles.reveal}`}>
            <OpportunityShortlistDemo />
          </div>
        </div>
        <div className={styles.heroStrip} />
      </section>

      <section className={styles.journey} id="journey">
        <div className={styles.wrap}>
          <div className={`${styles.eyebrow} ${styles.onCream}`}>The student journey</div>
          <h2>From a blank profile to a matched opportunity — in four moves.</h2>
          <div className={styles.steps}>
            {STEPS.map((s) => (
              <div key={s.num} className={`${styles.step} ${styles.reveal}`}>
                <div className={styles.num}>{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.opps} id="opportunities">
        <div className={styles.wrap}>
          <div className={`${styles.eyebrow} ${styles.onCream}`}>Career opportunities</div>
          <h2>Fifteen kinds of opportunity. One inbox.</h2>
          <p>
            Instead of a single &ldquo;Internships&rdquo; tab, EOCP treats every way a student earns, learns or builds
            reputation as one connected category.
          </p>
          <div className={styles.oppGrid}>
            {OPPORTUNITIES.map((o) => (
              <div key={o.title} className={`${styles.oppCell} ${styles.reveal}`}>
                <div className={styles.tag}>{o.tag}</div>
                <h4>{o.title}</h4>
                <p>{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className={styles.wrap}>
          <div className={`${styles.gapCallout} ${styles.reveal}`}>
            <div>
              <div className={styles.eyebrow} style={{ color: 'var(--pink)' }}>
                Skill gap, not rejection
              </div>
              <h3>&ldquo;You&apos;re almost ready.&rdquo;</h3>
              <p>
                When a student doesn&apos;t yet meet an internship&apos;s bar, EOCP never just says no. It shows the
                exact gap and the shortest path to close it.
              </p>
            </div>
            <div className={styles.checklist}>
              {CHECKLIST.map((c) => (
                <div key={c.label} className={`${styles.item} ${c.done ? styles.done : ''}`}>
                  <span className={styles.box} /> {c.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className={styles.wrap}>
          <div className={`${styles.eyebrow} ${styles.onCream}`}>Choose your path</div>
          <h2 style={{ margin: '0.8rem 0 0.6rem', maxWidth: '34rem', color: 'var(--green)' }}>
            Two ways to start, and one way to go all-in.
          </h2>
          <p style={{ color: 'var(--ink-soft)', maxWidth: '36rem' }}>
            Not qualified yet, or already sure what you want to build? Every path ends at the same place — a verified
            certificate — but gets there differently.
          </p>

          <div className={styles.pricingGrid}>
            <div className={`${styles.priceCard} ${styles.reveal}`}>
              <div className={styles.optNum}>Option 1</div>
              <h3>Learn &amp; Build with Guidance</h3>
              <p className={styles.tagline}>
                Perfect for students who want to learn, get certified, and grow through guided tasks — or their own
                idea, built by a professional team.
              </p>
              <div className={styles.featList}>
                <div className={styles.feat}>
                  <h5>Guided learning with tasks</h5>
                  <p>Real-world tasks with mentor feedback at every step.</p>
                </div>
                <div className={styles.feat}>
                  <h5>Work on your own project</h5>
                  <p>Your idea, built with guidance — team up to 8, each member taught according to the role they choose.</p>
                </div>
                <div className={styles.feat}>
                  <h5>Certification &amp; learning</h5>
                  <p>A verified certificate on completion, either track.</p>
                </div>
              </div>
              <div className={styles.includes}>
                <div className={styles.k}>What you get</div>
                <ul>
                  <li>Expert guidance</li>
                  <li>Tasks &amp; feedback</li>
                  <li>Skill development</li>
                  <li>Verified certification</li>
                  <li>Completion letter</li>
                </ul>
              </div>
              <div className={styles.feeList}>
                <div className={styles.feeRow}>
                  <span>Guided Learning Program</span>
                  <span className={styles.amt}>₹{guidedFee.toLocaleString()}</span>
                </div>
                <div className={styles.feeRow}>
                  <span>Own Project Support</span>
                  <span className={styles.amt}>₹{ownProjectFee.toLocaleString()}</span>
                </div>
              </div>
              <Link className={styles.btn} href="/internship/dashboard/enroll">
                Choose Option 1
              </Link>
            </div>

            <div className={`${styles.priceCard} ${styles.reveal}`}>
              <div className={styles.optNum}>Option 2</div>
              <h3>Work on Live Projects</h3>
              <p className={styles.tagline}>Apply for real client or startup work — paid or unpaid, always told upfront.</p>
              <div className={styles.featList}>
                <div className={styles.feat}>
                  <h5>Apply &amp; get shortlisted</h5>
                  <p>Apply for real client or startup work.</p>
                </div>
                <div className={styles.feat}>
                  <h5>Work allocation</h5>
                  <p>Matched to work based on your skills.</p>
                </div>
                <div className={styles.feat}>
                  <h5>Paid / unpaid</h5>
                  <p>Paid or unpaid — always told upfront, never a surprise.</p>
                  <div className={styles.note}>
                    If not selected or not skilled enough yet → guided skill-building task instead, same certificate at
                    the end.
                  </div>
                </div>
              </div>
              <div className={styles.includes}>
                <div className={styles.k}>Certification for all</div>
                <ul>
                  <li>Every intern gets a verified certificate</li>
                  <li>Awarded for paid work — or the completed task</li>
                </ul>
              </div>
              <div className={styles.feeList}>
                <div className={styles.feeRow}>
                  <span>Application &amp; selection</span>
                  <span className={styles.amt}>Free</span>
                </div>
              </div>
              <Link className={styles.btn} href="/internship/dashboard/apply">
                Choose Option 2
              </Link>
            </div>
          </div>

          <div className={`${styles.premiumBanner} ${styles.reveal}`}>
            <div>
              <div className={styles.eyebrow} style={{ color: 'var(--pink)' }}>
                Premium service
              </div>
              <h3>Build Your Own Project with Your Own Team</h3>
              <p>
                Want to build your own project with your own team? We&apos;ll build and ship a professional website for
                your idea — a qualified team of up to 8, each teaching you the exact role you take on as it&apos;s
                built.
              </p>
              <div className={styles.premiumFeats}>
                <span>Qualified expert team</span>
                <span>Best-in-class website</span>
                <span>1 year maintenance</span>
                <span>Team of up to 8</span>
              </div>
            </div>
            <div className={styles.premiumSide}>
              <div className={styles.from}>Starting from</div>
              <div className={styles.amt}>₹{ownProjectFee.toLocaleString()}</div>
              <Link className={styles.btn} href="/internship/dashboard/enroll">
                Build my project
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="dashboards">
        <div className={styles.wrap}>
          <div className={`${styles.eyebrow} ${styles.onCream}`}>Company &amp; recruiter view</div>
          <h2 style={{ margin: '0.8rem 0 2.4rem', maxWidth: '32rem', color: 'var(--green)' }}>
            Companies post once. The right students surface themselves.
          </h2>
          <div className={styles.dashPair}>
            <div className={`${styles.panel} ${styles.reveal}`}>
              <div className={styles.panelHead}>
                <span>Company Dashboard</span>
                <span>New posting</span>
              </div>
              <div className={styles.panelBody}>
                <div className={styles.postCard}>
                  <h4>React Intern</h4>
                  <div className={styles.chipRow}>
                    <span className={styles.chip}>HTML</span>
                    <span className={styles.chip}>CSS</span>
                    <span className={styles.chip}>React</span>
                  </div>
                  <div className={styles.postRow}>
                    <span>3 months · Paid</span>
                    <span>₹12,000/month</span>
                  </div>
                </div>
                <div className={styles.postCard}>
                  <h4>Content Writer — Part-time</h4>
                  <div className={styles.chipRow}>
                    <span className={styles.chip}>Writing</span>
                    <span className={styles.chip}>SEO basics</span>
                  </div>
                  <div className={styles.postRow}>
                    <span>Remote · Flexible hours</span>
                    <span>₹8,000/month</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${styles.panel} ${styles.reveal}`}>
              <div className={styles.panelHead}>
                <span>Recruiter Dashboard</span>
                <span>Recommended for you</span>
              </div>
              <div className={styles.panelBody}>
                <div className={styles.candCard}>
                  <div className={styles.candAvatar}>D</div>
                  <div>
                    <div className={styles.candName}>Dipesh</div>
                    <div className={styles.candMeta}>React · Leadership · Portfolio linked</div>
                  </div>
                  <span className={styles.verifiedPill}>92% · Verified</span>
                </div>
                <div className={styles.candCard}>
                  <div className={styles.candAvatar}>A</div>
                  <div>
                    <div className={styles.candName}>Ananya</div>
                    <div className={styles.candMeta}>Content writing · 4 published blogs</div>
                  </div>
                  <span className={styles.verifiedPill}>88% · Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.reputation} id="reputation">
        <div className={styles.wrap}>
          <div className={styles.eyebrow} style={{ color: 'var(--pink)' }}>
            Reputation &amp; skill verification
          </div>
          <h2>Career Points turn contribution into access.</h2>
          <p>
            Blogging, helping the community, finishing internships, certifications, skill tests and referrals all add
            up. A higher score unlocks better-matched, better-paid opportunities — and a verified badge tells
            recruiters your skill is tested, not just claimed.
          </p>
          <div className={styles.badgeStrip}>
            {BADGES.map((b) => (
              <div key={b.label} className={styles.badge}>
                <span className={styles.star}>{b.stars}</span> {b.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="blog">
        <div className={styles.wrap}>
          <div className={`${styles.eyebrow} ${styles.onCream}`}>Blogging ecosystem</div>
          <h2 style={{ margin: '0.8rem 0 1.6rem', maxWidth: '32rem', color: 'var(--green)' }}>
            Every college gets its own student-written hub.
          </h2>
          <div className={`${styles.blogHub} ${styles.reveal}`}>
            <span className={styles.collegeTag}>IIT Delhi</span>
            <div className={styles.blogGrid}>
              {BLOG_POSTS.map((p) => (
                <div key={p.title} className={styles.blogCard}>
                  <div className={styles.k}>{p.k}</div>
                  <h5>{p.title}</h5>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="different" className={styles.compare}>
        <div className={styles.wrap}>
          <div className={`${styles.eyebrow} ${styles.onCream}`}>Why EduBridge</div>
          <h2 style={{ margin: '0.8rem 0 0.6rem', maxWidth: '32rem', color: 'var(--green)' }}>
            Most platforms do one job. EOCP does the whole journey.
          </h2>
          <table>
            <thead>
              <tr>
                <th>Platform</th>
                <th>What it&apos;s for</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((r) => (
                <tr key={r.platform}>
                  <td>{r.platform}</td>
                  <td>{r.purpose}</td>
                </tr>
              ))}
              <tr className={styles.highlight}>
                <td>EduBridge EOCP</td>
                <td>All of the above — one student profile, matched by an AI Career Score</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.flow}>
        <div className={styles.wrap}>
          <div className={styles.eyebrow} style={{ justifyContent: 'center', color: 'var(--pink)' }}>
            The full arc
          </div>
          <h2>
            Discover → Learn → Build Skills → Get Verified → Join Communities → Write Blogs → Work on Real Projects →
            Get Internships → Earn Money → Build Your Career
          </h2>
          <div className={styles.ribbon}>
            {FLOW_NODES.map((node, i) => (
              <span key={node} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={styles.node}>{node}</span>
                {i < FLOW_NODES.length - 1 && <span className={styles.arrow}>→</span>}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <svg className={styles.seal} viewBox="0 0 200 200" aria-hidden>
          <path
            d="M100 10 L112 30 L136 20 L138 46 L164 50 L155 74 L178 88 L158 106 L172 128 L146 132 L148 158 L122 152 L112 176 L100 158 L88 176 L78 152 L52 158 L54 132 L28 128 L42 106 L22 88 L45 74 L36 50 L62 46 L64 20 L88 30 Z"
            fill="var(--navy)"
            stroke="var(--pink)"
            strokeWidth={1.5}
          />
          <text x="100" y="95" textAnchor="middle" fill="var(--pink)" style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }} fontSize="11" fontWeight="600">
            CAREER
          </text>
          <text x="100" y="112" textAnchor="middle" fill="var(--cream)" style={{ fontFamily: 'var(--font-fraunces), serif' }} fontSize="15" fontWeight="700">
            READY
          </text>
          <text x="100" y="128" textAnchor="middle" fill="var(--pink)" style={{ fontFamily: 'var(--font-ibm-plex-mono), monospace' }} fontSize="11" fontWeight="600">
            VERIFIED
          </text>
        </svg>
        <div className={styles.eyebrow} style={{ justifyContent: 'center', color: 'var(--pink)' }}>
          Start where you are
        </div>
        <h2>This extends EduBridge from finding the right college — to building the career that follows it.</h2>
        <a className={styles.btn} href="#pricing">
          Build my profile
        </a>
      </section>

      <footer className={styles.siteFooter}>
        <div>EduBridge Open Career Program</div>
        <div>College discovery → career ecosystem</div>
      </footer>
    </div>
  );
}
