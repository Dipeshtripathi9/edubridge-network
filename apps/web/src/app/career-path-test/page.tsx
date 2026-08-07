'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import styles from './page.module.css';

interface Category {
  icon: string;
  desc: string;
  subfields: string[];
}

const CATEGORIES: Record<string, Category> = {
  Technology: {
    icon: '💻',
    desc: 'Discover software development, AI, data science, cybersecurity, cloud, DevOps, UI/UX, and mobile development opportunities tailored to your technical skills.',
    subfields: ['Software Development', 'Artificial Intelligence', 'Data Science', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'UI/UX', 'Mobile Development'],
  },
  Business: {
    icon: '💼',
    desc: 'Explore internships and projects in marketing, finance, HR, sales, operations, and business analytics to gain practical business experience.',
    subfields: ['Marketing', 'Finance', 'HR', 'Sales', 'Operations', 'Business Analytics'],
  },
  Healthcare: {
    icon: '🩺',
    desc: 'Build hands-on experience through clinical, laboratory, radiology, physiotherapy, pharmacy, and hospital administration opportunities.',
    subfields: ['Clinical', 'Laboratory', 'Radiology', 'Physiotherapy', 'Pharmacy', 'Hospital Administration'],
  },
  Creative: {
    icon: '🎨',
    desc: 'Grow your creative portfolio with opportunities in graphic design, video editing, content writing, social media, branding, and digital media.',
    subfields: ['Graphic Design', 'Video Editing', 'Content Writing', 'Social Media', 'Branding', 'Digital Media'],
  },
  General: {
    icon: '🌍',
    desc: 'Expand your experience through campus ambassador programs, research, startup internships, volunteering, and remote opportunities across diverse industries.',
    subfields: ['Campus Ambassador Programs', 'Research', 'Startup Internships', 'Volunteering', 'Remote Opportunities'],
  },
};

interface ExtraStep {
  key: 'experience' | 'internshipType' | 'location' | 'stipend' | 'employment';
  title: string;
  sub: string;
  options: string[];
}

const EXTRA_STEPS: ExtraStep[] = [
  {
    key: 'experience',
    title: "What's your experience level?",
    sub: 'This helps us match you with opportunities at the right level.',
    options: ['No Experience', 'Personal Projects', 'Freelancing', 'Previous Internship', 'Campus Ambassador', 'Startup Experience', 'Open Source'],
  },
  {
    key: 'internshipType',
    title: 'Preferred internship type?',
    sub: 'How would you like to work day-to-day?',
    options: ['Remote', 'Hybrid', 'On-site', 'Any'],
  },
  {
    key: 'location',
    title: 'Preferred location?',
    sub: "Pick where you'd like to be based, if it matters to you.",
    options: ['Remote', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Chennai', 'No Preference'],
  },
  {
    key: 'stipend',
    title: 'Stipend expectation?',
    sub: 'What are you hoping to earn from this opportunity?',
    options: ['Unpaid', '₹5k+', '₹10k+', '₹20k+', '₹30k+', "Doesn't Matter"],
  },
  {
    key: 'employment',
    title: 'Employment preference?',
    sub: 'What kind of engagement are you looking for?',
    options: ['Internship Only', 'Internship + PPO', 'Full-Time', 'Freelance', 'Research Internship'],
  },
];

const TOTAL_STEPS = 2 + EXTRA_STEPS.length; // 7

type Selections = {
  category?: string;
  subfield?: string;
  experience?: string;
  internshipType?: string;
  location?: string;
  stipend?: string;
  employment?: string;
};

export default function CareerPathTestPage() {
  const [current, setCurrent] = useState(1);
  const [onResult, setOnResult] = useState(false);
  const [selections, setSelections] = useState<Selections>({});

  const hasSelectionFor = (step: number): boolean => {
    if (step === 1) return !!selections.category;
    if (step === 2) return !!selections.subfield;
    return !!selections[EXTRA_STEPS[step - 3].key];
  };

  const goNext = () => {
    if (onResult) return;
    if (current < TOTAL_STEPS) setCurrent((c) => c + 1);
    else setOnResult(true);
  };
  const goBack = () => {
    if (onResult) {
      setOnResult(false);
      return;
    }
    if (current > 1) setCurrent((c) => c - 1);
  };

  const pct = onResult ? 100 : Math.round(((current - 1) / TOTAL_STEPS) * 100);

  const resultUrl = (() => {
    if (!selections.category) return '/opportunities';
    const params = new URLSearchParams();
    params.set('tab', 'all');
    params.set('category', selections.category);
    if (selections.subfield) params.set('search', selections.subfield);
    if (selections.experience) params.set('experience', selections.experience);
    if (selections.internshipType) params.set('type', selections.internshipType);
    if (selections.location) params.set('location', selections.location);
    if (selections.stipend) params.set('stipend', selections.stipend);
    if (selections.employment) params.set('employment', selections.employment);
    return `/opportunities?${params.toString()}`;
  })();

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.topbar}>
          <h1>Career Path Quiz</h1>
          <div className={styles.pct}>{pct}%</div>
        </div>

        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <p className={styles.progressCaption}>
          {onResult ? "You're all set." : 'A few quick picks — then straight to real opportunities.'}
        </p>

        {!onResult && current === 1 && (
          <div className={styles.qcard}>
            <p className={styles.stepLabel}>Step 1 of {TOTAL_STEPS}</p>
            <p className={styles.qtitle}>Which field excites you most?</p>
            <p className={styles.qsub}>Pick the one that fits best — you can always explore the others later.</p>
            <div className={styles.catStack}>
              {Object.entries(CATEGORIES).map(([name, cat]) => (
                <button
                  key={name}
                  type="button"
                  className={cn(styles.catCard, selections.category === name && styles.selected)}
                  onClick={() => setSelections((s) => ({ ...s, category: name, subfield: undefined }))}
                >
                  <span className={styles.catIcon}>{cat.icon}</span>
                  <div className={styles.catName}>{name}</div>
                  <div className={styles.catDesc}>{cat.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {!onResult && current === 2 && selections.category && (
          <div className={styles.qcard}>
            <p className={styles.stepLabel}>Step 2 of {TOTAL_STEPS}</p>
            <p className={styles.qtitle}>Which part of {selections.category} interests you?</p>
            <p className={styles.qsub}>Narrow it down so we can point you to the right opportunities.</p>
            <div className={styles.optStack}>
              {CATEGORIES[selections.category].subfields.map((sf) => (
                <button
                  key={sf}
                  type="button"
                  className={cn(styles.opt, selections.subfield === sf && styles.selected)}
                  onClick={() => setSelections((s) => ({ ...s, subfield: sf }))}
                >
                  {sf}
                </button>
              ))}
            </div>
          </div>
        )}

        {!onResult &&
          current >= 3 &&
          (() => {
            const step = EXTRA_STEPS[current - 3];
            return (
              <div className={styles.qcard}>
                <p className={styles.stepLabel}>
                  Step {current} of {TOTAL_STEPS}
                </p>
                <p className={styles.qtitle}>{step.title}</p>
                <p className={styles.qsub}>{step.sub}</p>
                <div className={styles.optStack}>
                  {step.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      className={cn(styles.opt, selections[step.key] === opt && styles.selected)}
                      onClick={() => setSelections((s) => ({ ...s, [step.key]: opt }))}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

        {onResult && (
          <div className={styles.result}>
            <p className={styles.stepLabel}>Your path</p>
            <p className={styles.qtitle}>You&apos;re set</p>
            <p className={styles.qsub}>Here&apos;s where we&apos;ll take you.</p>
            <div className={styles.resultGrid}>
              <div className={styles.resultCard}>
                <div className={styles.rLabel}>Field</div>
                <div className={styles.rValue}>
                  {selections.category && CATEGORIES[selections.category].icon} {selections.category}
                </div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.rLabel}>Focus area</div>
                <div className={styles.rValue}>{selections.subfield}</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.rLabel}>Experience</div>
                <div className={styles.rValue}>{selections.experience}</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.rLabel}>Internship type</div>
                <div className={styles.rValue}>{selections.internshipType}</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.rLabel}>Location</div>
                <div className={styles.rValue}>{selections.location}</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.rLabel}>Stipend expectation</div>
                <div className={styles.rValue}>{selections.stipend}</div>
              </div>
              <div className={styles.resultCard}>
                <div className={styles.rLabel}>Employment preference</div>
                <div className={styles.rValue}>{selections.employment}</div>
                <div className={styles.rSub}>We&apos;ll pre-filter opportunities toward this when we can.</div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.navStack}>
          <button
            className={styles.backLink}
            onClick={goBack}
            style={{ visibility: !onResult && current === 1 ? 'hidden' : 'visible' }}
          >
            ← Back
          </button>
          {onResult ? (
            <Link href={resultUrl} className={styles.cta}>
              See {selections.category} Opportunities →
            </Link>
          ) : (
            <button className={styles.cta} disabled={!hasSelectionFor(current)} onClick={goNext}>
              {current === TOTAL_STEPS ? 'See My Path' : 'Continue'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
